//* OAuth2 Google functions
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config()

const appId = process.env.GOOGLE_OAUTH2_APP_ID
const secret = process.env.GOOGLE_OAUTH2_APP_SECRET

const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth`
const scope= [`https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/drive`]
appUri = `http://localhost:8080/oauth2GoogleCallback`
refreshTokenUrl = `https://oauth2.googleapis.com/token`

let token
let filesList
let cacheSheet = []


//access code request
const codeRequest = async() =>{

    let info =`oauth2GoogleFunctions::codeRequest\n\t`
    info += `oauth2 access code http request :\n\t`

    let url = `${oauth2Url}?response_type=code&access_type=offline&client_id=${appId}&redirect_uri=${appUri}&scope=${scope}`
    info += url
    console.log(info)

    return(url)
}



//refresh token from code/refresh token
const refreshToken = async(tokenInfo) => {

    const {code, rToken} = tokenInfo

    if (code === undefined && rToken === undefined) return(`cannot refresh token`)

    const formData2 = new FormData();
    formData2.append('client_id', appId);

    if (code !== undefined) {
        formData2.append('redirect_uri', appUri);
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
        if (typeof tokenInfo === 'object') token = tokenInfo.access_token
        else console.log(tokenInfo)
    }
    catch(err) {console.log(err.message)}

}


//get all files list from Google Drive
const getFilesList = async() => {
    
    let url = `https://www.googleapis.com/drive/v3/files?q=trashed=false`

    try {

        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let res2  = await res.json()
        let info = res.ok ? res2 : `getFilesList :: http request error : ${res2.error.message}`
        if (res.ok) {
            fs.writeFileSync(`filesList.txt`, JSON.stringify(info.files), (err) => {
                if (err) console.log(err.message);
            });
            filesList = info.files
        }

        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}





//get file info from files List
const getFileInfo = async(fileInfo) => {

    const {name, type, id} = fileInfo

    let type2 = `application/pdf`
    if (type === `spreadsheet`) type2 = `application/vnd.google-apps.spreadsheet`
    if (type === `doc`) type2 = `application/vnd.google-apps.document`
   
       try {
   
           if (filesList === undefined) await getFilesList()
           let fileInfo  
           filesList.map((item) => {if (item.name === name && item.mimeType === type2) fileInfo = item})
           let info = id ? fileInfo.id : fileInfo
           return(info)
       }
       catch(err) {
           console.log(err.message)
           return(err.message)
       }
}
   


//delete file
const deleteFile = async(fileInfo) => {

    const {id} = fileInfo

    let url = `https://www.googleapis.com/drive/v3/files/${id}`

    try {

        let res = await fetch(url, {
            method: 'DELETE',
            headers: { Authorization: "Bearer " + token },
        })

        let res2  = await res.json()
        let info = res.ok ? res2 : `getFilesList :: http request error : ${res2.error.message}`
        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }


}





//download a Google Workspace file from Google Drive (binary files like pdf are not supported by export method)
//export cannot be used for binary file such as pdf files, the destination file is by default a pdf file
const exportFile = async(fileInfo) => {

    const {name, type} = fileInfo
    const fileId = await getFileId(fileInfo)

    let url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`

    fileStream = fs.createWriteStream(`${name}.pdf`)

    try {

        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", reject);
            fileStream.on("finish", resolve);
        })
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}
   
   

   
//download a binary file from Google Drive (cannot use export bacause a pdf is not a Google Workspace file (binary file))
//the destination file is by default a pdf file
const downloadFile = async(fileInfo) => {

    const {name, type} = fileInfo
    const fileId = await getFileId(fileInfo)

    url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`

    fileStream = fs.createWriteStream(name)

    try {

        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", reject);
            fileStream.on("finish", resolve);
        })
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}
   



//file upload to Google Drive
//source code origin : https://gist.github.com/tanaikech/33563b6754e5054f3a5832667100fe91
//note : PUT method does not seem to work with existing file upload (not found error) 
const uploadFile = async(fileInfo) => {

  const {name, type} = fileInfo
  let infoFile = await getFileInfo(fileInfo)

 if (infoFile) await deleteFile(infoFile)

    try {

        var formData = new FormData();
        var fileMetadata = {name:name}
        formData.append("metadata", JSON.stringify(fileMetadata), {contentType: "application/json"});
        formData.append("data", fs.createReadStream(name), {contentType: "application/pdf"});
        let res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
            method: 'POST',
            body: formData,
            headers: { Authorization: "Bearer " + token },
        })

        let res2  = await res.json()
        let info = res.ok ? res2 : `getFilesList :: http request error : ${res2.error.message}`
        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}




//get spreadsheet/sheets info
const getSpreadsheetInfo = async(spreadsheetName) => {

    let spreadsheetId = ``    

    try {

        filesList.map((item) => {if (item.name === spreadsheetName && item.mimeType === `application/vnd.google-apps.spreadsheet`) spreadsheetId = item.id})
        if (spreadsheetId === ``) return(`cannot find the sheets Id`)

        let url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`

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


//get sheet info from Google sheets (values or formulas)
getSheetValues = async(sheetInfo) => {

    const {spreadsheetName, sheetName, range, isFormulas} = sheetInfo

    try {

        token = `fkk;ldskf;dsk;`

        const sheetsId = await getSpreadsheetId(spreadsheetName)

        range2 = range === undefined ? `` : `!${range}`
        formulas = isFormulas ? `?valueRenderOption=FORMULA` : ``

        let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}${formulas}`
        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let res2  = await res.json()
        let info = res.ok ? res2 : `getSheetInfo :: http request error : ${res2.error.message}`
         
        if (res.ok) {
            
            let index = -1
        
            //create/update cache
            cacheSheet.map((o, i) => { if (Object.keys(o)[0] == `${spreadsheetName}-${sheetName}`) index = i })
            if (index === -1) {
                let obj = {}
                obj[`${spreadsheetName}-${sheetName}`] = info.values
                cacheSheet.push(obj)
            }
            else cacheSheet[index][`${spreadsheetName}-${sheetName}`] = info.values

            return(info.values)
        }
        else return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}









//get sheet info from cache or sheets
const getValues = async(sheetInfo) => {

    const {spreadsheetName, sheetName, range} = sheetInfo
    let index = -1

    try {

        //get values from cache or from Google Sheets
        cacheSheet.map((o, i) => { if (Object.keys(o)[0] == `${spreadsheetName}-${sheetName}`) index = i })
        let info = index === -1 ? await getSheetInfo(sheetInfo) : cacheSheet[index][`${spreadsheetName}-${sheetName}`]
        return(info)

    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}






//update sheet
const updateSheet = async(sheetInfo) => {

    const {spreadsheetName, sheetName, range, payload} = sheetInfo

    try {

        const sheetsId = await getSpreadsheetId(spreadsheetName)

        range2 = range === undefined ? `` : `!${range}`
        payloadObj = {values:payload}
        
        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}?includeValuesInResponse=true&valueInputOption=USER_ENTERED`

        let res = await fetch(url, 
            {
            method: 'PUT',    
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







//batch update spreadsheet
const batchUpdateSheet = async(sheetInfo) => {

    const {spreadsheetName, payload} = sheetInfo

    try {

        const sheetsId = await getSpreadsheetId(spreadsheetName)

        let payloadObj = {valueInputOption: "USER_ENTERED", includeValuesInResponse: true}
        let arrObj = []
        payload.map((item) => arrObj.push({range:item[0], values:[[item[[1]]]]}))
        payloadObj = {...payloadObj, ...{data:arrObj}}
        
        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values:batchUpdate`

        let res = await fetch(url, 
            {
            method: 'POST',    
            headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadObj)
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















































init = (async() => {

    //set the sheets info list

    try {

        await accessToken()
        let info = await getFilesList()
        if (typeof info === 'object') console.log(`GoogleLib::init : completed`)
        else console.log(`GoogleLib::init : error`)

    }
    catch(err) {console.log(`GoogleLib::init: error => ${err.message}`)}

})()

module.exports = { codeRequest, refreshToken, accessToken, getFilesList, getFileInfo, exportFile, getSpreadsheetInfo, getValues, updateSheet, batchUpdateSheet, downloadFile, uploadFile }