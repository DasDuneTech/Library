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
const getSheetsInfo = async(fileName) => {

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

    const {sheetsName, sheetName} = sheetInfo

    try {

        const sheetsId = await getFileId(sheetsName)

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


module.exports = { codeRequest, refreshToken, accessToken, getFilesList, getFileInfo, getFileId, downloadFile, getSheetsInfo, getSheetValues, update}