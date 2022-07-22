//*Microsoft API Node functions library

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config()

const appClientId = process.env.MICROSOFT_OAUTH2_APP_ID

const oauth2Url = `https://login.microsoftonline.com/common/oauth2/v2.0`
const perm = `offline_access%20User.Read%20Files.ReadWrite.All%20Sites.ReadWrite.All`
const appURI = `http://localhost:8080/oauth2Callback`

let token
let excelFilesList
let indexFile













//access code request
const codeRequest = async() =>{

    let url = `${oauth2Url}/authorize?response_type=code&response_mode=query&client_id=${appClientId}&redirect_uri=${appURI}&scope=${perm}`
    return(url);
}




//refresh token from code/refresh token
const refreshToken = async(tokenInfo) => {

    const {code, rToken} = tokenInfo

    if (code === undefined && rToken === undefined) return(`cannot refresh token`)

    const formData2 = new FormData();
    formData2.append('client_id', appClientId);

    if (code !== undefined) {
        formData2.append('redirect_uri', appURI);
        formData2.append('grant_type', 'authorization_code');
        formData2.append('code', code);
    }
    if (rToken !== undefined) {
        formData2.append('grant_type', 'refresh_token');
        formData2.append('refresh_token', rToken);
    }

    let url = `${oauth2Url}/token`

    try {

        let res = await fetch(url, 
            {
            method: 'POST',    
            body: formData2
        });

        let res2  = await res.json()
        let info = res.ok ? res2 : `refreshToken :: http request error : ${res2.error} - ${res2.error_description}`
        return(info)
        
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}









//get a fresh access token (run when the library is loaded to provide a 1 hr access token )
const accessToken = async() => {

    try {

        const rToken = fs.readFileSync('oauth2MicrosoftRefreshToken.txt', 'utf8') 
        let tokenInfo = await refreshToken({rToken:rToken})
        if (typeof tokenInfo === 'object') {
            token = tokenInfo.access_token
            return(token)
        }
        else console.log(tokenInfo)
    }
    catch(err) {console.log(err.message)}

}




//get token to be used by the functions library for the next hour
const popToken = async(accessToken) => token = accessToken








//tag indexer
const tagIndexer = async(info) => {

    try{
        const {bookName, sheetName} = info

        indexObjArr = JSON.parse(indexFile)

        let headerOffset
        let tags = []

        // await getFilesList({type:`excel`})
        let sheetInfo = await getSheetValues(info)
        let sheetValues = sheetInfo.values

        let bookId = `` 
        excelFilesList.map((item) => {if (item.name === bookName) bookId = item.id})
        sheetValues.map((item, i)=> {if (item.indexOf('Name') !== -1) headerOffset = i})
        if (headerOffset === -1) {
            console.log(`GoogleLib::tagIndexer : cannot find <Name> field in header`)
            return(`GoogleLib::tagIndexer : cannot find <Name> field in header`)
        }

        val =  sheetValues.slice(headerOffset)

        header = val[0]
        val.map((val) => tags.push(`${val[header.indexOf('Name')]}`))

        tags.shift()
 
        let bookObj
        let sheetObj
    
        //get the book object info
        Object.values(indexObjArr).map((item) => {if (item.name === bookName){bookObj = item}})
    
        //check book exists
        if (bookObj === undefined) {
    
            let indexObj = {name:bookName, id:bookId, sheets:[{name:sheetName, tags:tags}]}
            indexObjArr.push(indexObj)
        }
        else {
          //check sheet exists 
            Object.values(bookObj.sheets).map((item) => {if (item.name === sheetName){sheetObj = item}})
            if (sheetObj !== undefined) {sheetObj.tags = tags}
            else bookObj.sheets.push({name:sheetName, tags:tags})
        }
    
        fs.writeFileSync(`index.json`, JSON.stringify(indexObjArr)) 
        indexFile = JSON.stringify(indexObjArr)

    }
    catch(err) {
        console.log(`tagIndexer: error => ${err.message}`)
        return(`tagIndexer: error => ${err.message}`)
    }
}


const deleteTagIndex = async(bookSheetNames) => {

    try{

        const {bookName, sheetName} = bookSheetNames

        let tagsObj = JSON.parse(indexFile)

        Object.values(tagsObj).map((item, j) =>{if (item.name === bookName) {
            item.sheets.map((item2, i) => {
                if (item2.name === sheetName) {
                item.sheets.splice(i,1)
                if (item.sheets.length === 0) {tagsObj.splice(0,1)}
                }
            })
            }
        })
        fs.writeFileSync(`index.json`, JSON.stringify(tagsObj))
        indexFile = JSON.stringify(tagsObj)
    }
    catch(err) {
        console.log(`deleteTagIndex: error => ${err.message}`)
        return(`deleteTagIndex: error => ${err.message}`)
    }
}



module.exports = { codeRequest, refreshToken, accessToken, popToken }

// module.exports = { codeRequest, refreshToken, accessToken, popToken, getFilesList, popFilesList, getFileInfo, getFileId, downloadFile, getDownloadUrl, getBookInfo, getSheetValues, update, batch, tagIndexer, tagInfo, deleteTagIndex}