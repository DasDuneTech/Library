//*Microsoft API functions library
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config()

const appClientId = process.env.MICROSOFT_OAUTH2_APP_ID

const oauth2Url = `https://login.microsoftonline.com/common/oauth2/v2.0`
const perm = `offline_access%20User.Read%20Files.ReadWrite.All%20Sites.ReadWrite.All`
const appURI = `http://localhost:8080/oauth2Callback`



let token
let filesList
let bookSheetCache = []
let sheetColCache = []
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




//get a fresh access token
const accessToken = async() => {

    try {

        const rToken = fs.readFileSync('oauth2RefreshToken.txt', 'utf8') 
        let tokenInfo = await refreshToken({rToken:rToken})
        if (typeof tokenInfo === 'object') token = tokenInfo.access_token
        else console.log(tokenInfo)
    }
    catch(err) {console.log(err.message)}

}







//get all files list from One Drive
const getFilesList = async(query) => {

    let mimeType = `children`
    let selection = ``
    let select = `?select=name,id,webUrl`
    if (query) {
        mimeType = query.type === `pdf` ? `search(q='.pdf')` : mimeType
        mimeType = query.type === `excel` ? `search(q='.xlsx')` : mimeType
        selection = query.select ? `?select=${query.select}` : select
    }

    url = `https://graph.microsoft.com/v1.0/me/drive/root/${mimeType}${selection}`
    // let url = `https://graph.microsoft.com/v1.0/me/drive/root/search(q='.pdf')?select=name,id,webUrl`
    
    try {

        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let res2  = await res.json()
        let info = res.ok ? res2 : `getFilesList :: http request error : ${res2.error.message}`
        filesList = info.value
        return(info.value)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}











//get file info from files List
const getFileInfo = async(fileName) => {

    if (!filesList) filesList = await getFilesList()

    try {
        let info = `Microsoft-Lib :: getFileInfo : Cannot get info for the file ${fileName}` 
        filesList.map((item) => {if (item.name === fileName) info = item})
        return(info)
       }
       catch(err) {
           console.log(err.message)
           return(err.message)
       }
}





//get file Id
const getFileId = async(fileName) => {

    let info = await getFileInfo(fileName)
    return(info.id)

}



//file download from One Drive
const downloadFile = async(fileName) => {

    let info = await getFileInfo(fileName)
    let url = info["@microsoft.graph.downloadUrl"]

    try {

        fileStream = fs.createWriteStream(fileName)

        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", reject);
            fileStream.on("finish", resolve);
        })
        let info = res.ok ? `Microsoft-Lib :: downloadFile : file ${fileName} downloaded` : `Microsoft-Lib :: downloadFile : http request error : ${fileName} - ${res.statusText}`
        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}





//get workbook/worksheets info
const getBookInfo = async(fileName) => {

    if (!filesList) filesList = await getFilesList()
    let sheetsId = ``

    try {

        filesList.map((item) => {if (item.name === fileName && item.file.mimeType === `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) sheetsId = item.id})
        if (sheetsId === ``) return(`cannot find the file Id`)

        let url = `https://graph.microsoft.com/v1.0/me/drive/items/${sheetsId}/workbook/worksheets`

        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let res2  = await res.json()
        let info = res.ok ? res2 : `getSpreadsheetInfo :: http request error : ${res2.error.message}`
        return(info)

    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}






//get sheet info from Excel (values or formulas)
getSheetValues = async(sheetInfo) => {

    const {bookName, sheetName} = sheetInfo

    try {

        const sheetsId = await getFileId(bookName)

        let url = `https://graph.microsoft.com/v1.0/me/drive/items/${sheetsId}/workbook/worksheets/${sheetName}/usedRange`
        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let res2  = await res.json()
        let info = res.ok ? res2 : `getSheetValues :: http request error : ${res2.error.message}`
        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}










//update sheet
const update = async(sheetInfo) => {

    const {sheetsName, sheetName, range, payload} = sheetInfo

    try {

        const sheetsId = await getFileId(sheetsName)

        payloadObj = {values:payload}
        
        url = `https://graph.microsoft.com/v1.0/me/drive/items/${sheetsId}/workbook/worksheets/${sheetName}/range(address='${range}')`
        let res = await fetch(url, 
            {
            method: 'PATCH',    
            headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadObj)
        });
        let res2  = await res.json()
        let info = res.ok ? res2 : `update :: http request error : ${res2.error.message}`
        return(info)

    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}









//batch update worksheets
const batchUpdate = async(reqArr) => {

    let reqs = {requests:reqArr}

    // fs.writeFileSync(`reqs.json`, JSON.stringify(reqs) ) 


    try {

        url = `https://graph.microsoft.com/v1.0/$batch`

        let res = await fetch(url, 
            {
            method: 'POST',    
            headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqs)
        });
        let res2  = await res.json()
        let info = res.ok ? res2 : `batch update :: http request error : ${res2.error.message}`
        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}









//batch update spreadsheet (advanced)
const batch = async(tags) => {

    let tagsInfo = []
    let sortedVal = []
    let ssIndex
    // let valuesArr = []

    //aggregate tags per columns
    for (tag of tags) { 

        let info = await tagInfo(tag[0])
        if (typeof info === 'string') continue

        const {bookName, bookId, sheetName, rows, row} = info

        //look in book-sheet cache
        index = -1
        bookSheetCache.map((o, i) => { if (Object.keys(o)[0] == `${sheetName}`) index = i })

        if (index === -1) {
            sheetValues = await getSheetValues({bookName:bookName, sheetName:sheetName})
            sheetValues.values.map((item, i)=> {if (item.indexOf('Name') !== -1) headerOffset = i})
            bookSheetVal = sheetValues.values.slice(headerOffset)
            obj = {}
            obj[`${bookName}-${sheetName}`] = bookSheetVal 
            bookSheetCache.push(obj)
            tagValues = JSON.parse(JSON.stringify(bookSheetVal))
            // tagValues = bookSheetVal
        }
        else {
            bookSheetObj = bookSheetCache[index]
            tagValues = Object.values(bookSheetObj)[0]
        }

        let header = tagValues[0]
        let data = tagValues.shift()

        let colIndex = header.indexOf(tag[1])
        let col =  colIndex < 26 ? String.fromCharCode(colIndex  + 65) : `A${String.fromCharCode(colIndex %26+ 65)}`;

        //look in sheet-col cache
        index = -1
        sheetColCache.map((o, i) => { if (Object.keys(o)[0] == `${sheetName}-${tag[1]}`) index = i })
       
        if (index === -1) {

            colValues = []
            Object.values(bookSheetVal).map(item => colValues.push(item[colIndex].toString()))
            colValues[row] = `${tag[2]}`
            obj = {}
            obj[`${sheetName}-${tag[1]}`] = colValues
            sheetColCache.push(obj)
        }
        else {
            Obj = sheetColCache[index]
            colValues = Object.values(Obj)[0]
            colValues[row] = tag[2]
        }

        obj[`bookId`] = bookId
        obj[`sheetName`] = sheetName
        obj[`col`] = col
        obj[`headerOffset`] = headerOffset

    }


    //create request object for each column
    reqArr = []

    sheetColCache.map((item, i) => {
    
       const {bookId, sheetName, col, headerOffset, data} = item
       lastRow = Object.values(item)[0].length + headerOffset
       reqObj = {url: `/me/drive/items/${bookId}/workbook/worksheets/${sheetName}/range(address='${col}${headerOffset+1}:${col}${lastRow}')`}
       valuesArr = []
       Object.values(item)[0].map((val) => {valuesArr.push([val])})
       body = {formulas: valuesArr}
       reqObj = {...reqObj, ...{body:body}, ...{id:i}, ...{method:`PATCH`}, ...{headers:{"Content-Type": "application/json"}}}
       reqArr.push(reqObj)
     })
 
     console.log(`ready for batch update`)

     info = await batchUpdate(reqArr)
     console.log(info)
     return(info)
}





















//*init function
init = (async() => {

    //cache the files info list

    try {

        await accessToken()
        let info = await getFilesList({type: `excel`})
        if (typeof info === 'string') console.log(`MicrosoftLib::init : getFilesList error`)

        // sheetsInfo = {sheetsName:`Library2`, sheetName:`Sheet3`}
        // info = await tagIndexer(sheetsInfo)
        // if (typeof info === 'string') console.log(`GoogleLib::init : tagIndexer error`)

    }
    catch(err) {console.log(`Microsoftib::init: error => ${err.message}`)}

})()































//common functions
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

module.exports = { codeRequest, refreshToken, accessToken, getFilesList, getFileInfo, getFileId, downloadFile, getBookInfo, getSheetValues, update, batch, tagIndexer, tagInfo}