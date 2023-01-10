//*Google API functions library
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config()

const appId = process.env.GOOGLE_OAUTH2_APP_ID
const secret = process.env.GOOGLE_OAUTH2_APP_SECRET

const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth`
const scope= [`https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/drive`]
appURI = `http://localhost:8080/oauth2GoogleCallback`
refreshTokenUrl = `https://oauth2.googleapis.com/token`

let token
let filesList
let indexFile












//access code request
const codeRequest = async() =>{

    let url = `${oauth2Url}?response_type=code&access_type=offline&client_id=${appId}&redirect_uri=${appURI}&scope=${scope}`
    return(url)
}




//refresh token from code/refresh token
const refreshToken = async(tokenInfo) => {

    const {code, rToken} = tokenInfo

    if (code === undefined && rToken === undefined) return(`cannot refresh token`)

    const formData2 = new FormData();
    formData2.append('client_id', appId);

    if (code !== undefined) {
        formData2.append('redirect_uri', appURI);
        formData2.append('client_secret', secret);
        formData2.append('grant_type', 'authorization_code');
        formData2.append('code', code);
    }
    if (rToken !== undefined) {
        formData2.append('grant_type', 'refresh_token');
        formData2.append('refresh_token', rToken);
        formData2.append('client_secret', secret);
    }

    let url = `${refreshTokenUrl}`

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







//get a fresh access token
const accessToken = async() => {

    try {

        const rToken = fs.readFileSync('oauth2GoogleRefreshToken.txt', 'utf8') 
        let tokenInfo = await refreshToken({rToken:rToken})
        if (typeof tokenInfo === 'object') return(tokenInfo.access_token)
        else return(tokenInfo)
    }
    catch(err) {return(err.message)}

}







//get token to be used by the functions library for the next hour
const popToken = async(accessToken) => token = accessToken








//tag indexer
const tagIndexer = async(info) => {

    const {bookName, sheetName} = info

    let headerOffset
    let names = ``

    await getFilesList({type:`excel`})
    let sheetInfo = await getSheetValues(info)
    let sheetValues = sheetInfo.values

    sheetValues.map((item, i)=> {if (item.indexOf('Name') !== -1) headerOffset = i})
    if (headerOffset === -1) {
        console.log(`GoogleLib::tagIndexer : cannot find <Name> field in header`)
        return(`GoogleLib::tagIndexer : cannot find <Name> field in header`)
    }

    val =  sheetValues.slice(headerOffset)

    header = val[0]
    val.map((val) => names += `§${val[header.indexOf('Name')]}`)
    names += `§`

    let bookRef = ''
    let sheetRef= ''
    let bookRefNew= ''
    let sheetRefNew = ''

    indexFile = fs.readFileSync(`index.txt`, 'utf8') 

    bookId = await getFileId(bookName)

    //check if book-sheet cache exists in index file
    let regex = new RegExp(`@${`${bookName}¶${bookId}`}`, 'gi');
    if (regex.test(indexFile)) {
        regex = new RegExp(`@${`${bookName}¶${bookId}`}[^@]*`, 'gi');
        bookRef = indexFile.match(regex)
        }
    //create   
    else {
        bookRef += `@${`${bookName}¶${bookId}`}`
        indexFile += bookRef
    }

    //check if sheet exists
    let bookRef2 = bookRef[0].length == 1 ? bookRef : bookRef[0] 
    regex = new RegExp(`~${sheetName}`, 'gi');
    if (regex.test(bookRef2)) {
        regex = new RegExp(`~${sheetName}[^~@]*`, 'gi');
        sheetRef= bookRef2.match(regex)
        sheetRefNew = `~${sheetName}&${names}`
        shNew = bookRef2.replace(bookRef[0], bookRefNew)
        }
    //create ws    
    else {
        bookRef += `~${sheetName}&${names}`
        bookRefNew = sheetRef+ bookRef
        }

    let indexFile2 = indexFile.replace(bookRef2, bookRefNew)
    fs.writeFileSync(`index.txt`, indexFile2 ) 

   return(bookRefNew)




}












const tagInfo = async(tag) => {
  
    try {

        if (!indexFile) indexFile = fs.readFileSync(`index.txt`, 'utf8') 

        tag = tag.toString()

        //get tag's ref info
        let regex = new RegExp(`[^@]*${tag}[^@]*`, 'gi');
        let tagRef = indexFile .match(regex)

        //get book
        let book2 = tagRef[0].match(/[^~]*/)[0]
        let bookName = book2.split('¶')[0]
        let bookId = book2.split('¶')[1]
    
        //get worksheet
        regex = new RegExp(`[^~]*§${tag}§[^~]*`, 'i');
        let sheetRef = tagRef[0].match(regex)
        let sheetName = sheetRef[0].match(/[^&]*/)[0]
        // console.log(sheet[0])rowRef

        //get header
        // let keys = sheet[0].match(/\^[^¥§]*/)
        // let header = keys[0].split(`^`)
        // header.shift()
        // header.pop()
        // console.log(keys)

        //get row index
        let rowRef = sheetRef[0].match(/[^&]*$/)
        let rows = rowRef[0].split(`§`)
        rows.shift()
        rows.pop()
        let row = rows.indexOf(tag) 

        // if (row == -1) return (`no info found for tag : ${tag}`)
        if (row == -1) return (`app :: tagInfo : tag not found`)
        else  return ({bookName: bookName, bookId:bookId, sheetName: sheetName, rows:rows, row:row})
    
    }
    
    catch(err) { 
        console.log(`excel::tagInfo cannot read info for tag ${tag}`)
        return (`excel::tagInfo cannot read info for tag ${tag}`)
    }

}

module.exports = { codeRequest, refreshToken, accessToken, popToken }

// module.exports = { codeRequest, refreshToken, accessToken, getFilesList, getFileInfo, exportFile, getBookInfo, getSheetValues, update, batch, batchUpdate, downloadFile, uploadFile, tagIndexer, tagInfo }