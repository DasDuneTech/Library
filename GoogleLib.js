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
let spreadsheetsList
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

    let res = await fetch(url, 
        {
        method: 'POST',    
        body: formData2
    });
    
    let infoToken  = await res.json()

    let info =`refreshToken ::\n\t`
    for (const [key, val] of Object.entries(infoToken)) info += `${key}: ${val}\n\t`
    console.log(info)

    return(infoToken)
}












const accessToken = async() => {

    const rToken = fs.readFileSync('oauth2GoogleRefreshToken.txt', 'utf8') 
    let tokenInfo = await refreshToken({rToken:rToken})
    token = tokenInfo.access_token
    return(tokenInfo.access_token)

}












//get all files list from Google Drive
const getFilesList = async() => {
    
    let url = `https://www.googleapis.com/drive/v3/files`
    res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let info  = await res.json()
    return(info)

}











//get spreadsheets list from Google Sheets, save to file and load to memory
const getSpreadsheetsList = async() => {

    let url = `https://www.googleapis.com/drive/v3/files?q=mimeType: "application/vnd.google-apps.spreadsheet"`
    res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let info  = await res.json()
    fs.writeFileSync(`spreadsheetsList.txt`, JSON.stringify(info.files), (err) => {
        if (err) console.log(err.message);
    });
    spreadsheetsList = info.files
    return(info)
}








//get spreadsheet info and its sheets info
const getSpreadsheetInfo = async(spreadsheetName) => {

    let spreadsheetId = ``    
    spreadsheetsList.map((item) => {if (item.name === spreadsheetName) spreadsheetId = item.id})
    if (spreadsheetId === ``) return(`cannot find the sheets Id`)

    let url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`
    res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let info  = await res.json()
    return(info)
}








//get spreadsheet Id from spreadsheet name    
const getSpreadsheetId = async(spreadsheetName) => {

    if (spreadsheetsList === undefined) await getSpreadsheetsList()
    let spreadsheetId = ``    
    spreadsheetsList.map((item) => {if (item.name === spreadsheetName) spreadsheetId = item.id})
    if (spreadsheetId === ``) {
        //refresh the lists and try a second time
        await saveSpreadsheetsList()
        await loadSpreadsheetsList()
        spreadsheetsList.map((item) => {if (item.name === `Library`) spreadsheetId = item.id})
        if (spreadsheetId = ``) return(`cannot find the sheet Id for ${sheetName}`)
        else return(spreadsheetId)
    }
    else return(spreadsheetId)
}














//get sheet info from Google sheets (values or formulas)
getSheetInfo = async(sheetInfo) => {

    const {spreadsheetName, sheetName, range, isFormulas} = sheetInfo
    const sheetsId = await getSpreadsheetId(spreadsheetName)

    range2 = range === undefined ? `` : `!${range}`
    formulas = isFormulas ? `?valueRenderOption=FORMULA` : ``

    let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}${formulas}`
    let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let info  = await res.json()

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













//get sheet info from cache or sheets
const getInfo = async(sheetInfo) => {

    const {spreadsheetName, sheetName, range} = sheetInfo
    let index = -1

    //get values from cache or from Google Sheets
    cacheSheet.map((o, i) => { if (Object.keys(o)[0] == `${spreadsheetName}-${sheetName}`) index = i })
    let info = index === -1 ? await getSheetInfo(sheetInfo) : cacheSheet[index][`${spreadsheetName}-${sheetName}`]
    return(info)

}








//update sheet
const update = async(sheetInfo) => {

    const {spreadsheetName, sheetName, range, payload} = sheetInfo
    const sheetsId = await getSpreadsheetId(spreadsheetName)

    range2 = range === undefined ? `` : `!${range}`
    payloadObj = {values:payload}
    
    url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}?valueInputOption=USER_ENTERED`

    let res = await fetch(url, 
        {
        method: 'PUT',    
        headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadObj)
    });
    info = await res.json()
    return(info)
}







//batch update spreadsheet
const batchUpdate = async(sheetInfo) => {

    const {spreadsheetName, payload} = sheetInfo
    const sheetsId = await getSheetId(spreadsheetName)

    let payloadObj = {valueInputOption: "USER_ENTERED"}
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
    resInfo  = await res.json()
    console.log(resInfo)

}


























































init = (async() => {

    //set the sheets info list
    let info = await accessToken()
    info = await getSpreadsheetsList()
    console.log(`Sheets Library Initialization complete`)

})()

module.exports = { codeRequest, refreshToken, accessToken, getFilesList, getSpreadsheetsList, getSpreadsheetInfo, getInfo, update, batchUpdate }