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

    try {

        let res = await fetch(url, 
            {
            method: 'POST',    
            body: formData2
        });
        
        if (!res.ok) {
            console.log((`refresh token http request error :: code:${res.status} - ${res.statusText}`))
            return(`refresh token http request error :: code:${res.status} - ${res.statusText}`)
        }   
        else {
             let info  = await res.json()
             return(info)
            }
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}



const accessToken = async() => {

    try {

        const rToken = fs.readFileSync('oauth2GoogleRefreshToken.txt', 'utf8') 
        let tokenInfo = await refreshToken({rToken:rToken})
        token = tokenInfo.access_token
        return(tokenInfo.access_token)

    }
    catch(err) {console.log(err.message)}

}


//get all files list from Google Drive
const getFilesList = async() => {
    
    let url = `https://www.googleapis.com/drive/v3/files`

    try {

        res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        if (!res.ok) {
            console.log((`getFilesList http request error :: code:${res.status} - ${res.statusText}`))
            return(`getFilesList http request error :: code:${res.status} - ${res.statusText}`)
        }   
        else {
             let info  = await res.json()
             return(info)
            }
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}


//get spreadsheets list from Google Sheets, save to file and load to memory
const getSpreadsheetsList = async() => {

    let url = `https://www.googleapis.com/drive/v3/files?q=mimeType: "application/vnd.google-apps.spreadsheet"`

    try {

        res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});

        if (!res.ok) {
            console.log((`getSpreadsheetsList http request error :: code:${res.status} - ${res.statusText}`))
            return(`getSpreadsheetsList http request error :: code:${res.status} - ${res.statusText}`)
        } 
        else {
            let info  = await res.json()
            fs.writeFileSync(`spreadsheetsList.txt`, JSON.stringify(info.files), (err) => {
                if (err) console.log(err.message);
            });
            spreadsheetsList = info.files
            return(info)
        }

    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}


//get spreadsheet info and its sheets info
const getSpreadsheetInfo = async(spreadsheetName) => {

    let spreadsheetId = ``    

    try {

        spreadsheetsList.map((item) => {if (item.name === spreadsheetName) spreadsheetId = item.id})
        if (spreadsheetId === ``) return(`cannot find the sheets Id`)

        let url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`

        res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});

        if (!res.ok) {
            console.log((`getSpreadsheetInfo http request error :: code:${res.status} - ${res.statusText}`))
            return(`getSpreadsheetInfo http request error :: code:${res.status} - ${res.statusText}`)
        } 
        else {
            let info  = await res.json()
            return(info)
        }
    
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}

//get spreadsheet Id from spreadsheet name    
const getSpreadsheetId = async(spreadsheetName) => {

    try {

        if (spreadsheetsList === undefined) await getSpreadsheetsList()
        let spreadsheetId = ``    
        spreadsheetsList.map((item) => {if (item.name === spreadsheetName) spreadsheetId = item.id})
        return(spreadsheetId)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}





//get sheet info from Google sheets (values or formulas)
getSheetInfo = async(sheetInfo) => {

    const {spreadsheetName, sheetName, range, isFormulas} = sheetInfo

    try {

        const sheetsId = await getSpreadsheetId(spreadsheetName)

        range2 = range === undefined ? `` : `!${range}`
        formulas = isFormulas ? `?valueRenderOption=FORMULA` : ``

        let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}${formulas}`
        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});

        if (!res.ok) {
            console.log((`getSheetInfo http request error :: code:${res.status} - ${res.statusText}`))
            return(`getSheetInfo http request error :: code:${res.status} - ${res.statusText}`)
        } 
        else {

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
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}



//get sheet info from cache or sheets
const getInfo = async(sheetInfo) => {

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
const update = async(sheetInfo) => {

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

        if (!res.ok) {
            console.log((`update http request error :: code:${res.status} - ${res.statusText}`))
            return(`update http request error :: code:${res.status} - ${res.statusText}`)
        } 
        else {
            info = await res.json()
            return(info)
        }
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}


//batch update spreadsheet
const batchUpdate = async(sheetInfo) => {

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

        if (!res.ok) {
            console.log((`batch update http request error :: code:${res.status} - ${res.statusText}`))
            return(`batch update http request error :: code:${res.status} - ${res.statusText}`)
        } 
        else {
            info  = await res.json()
            return(info)
        }
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}


























































init = (async() => {

    //set the sheets info list

    try {

        let info = await accessToken()
        info = await getSpreadsheetsList()
        if (typeof info === 'object') console.log(`GoogleLib::init : completed`)
        else console.log(`GoogleLib::init : error`)

    }
    catch(err) {console.log(`GoogleLib::init: error => ${err.message}`)}

})()

module.exports = { codeRequest, refreshToken, accessToken, getFilesList, getSpreadsheetsList, getSpreadsheetInfo, getInfo, update, batchUpdate }