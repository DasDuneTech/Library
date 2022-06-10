//*Microsoft API functions library
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config()

const appClientId = process.env.MICROSOFT_OAUTH2_APP_ID

const oauth2Url = `https://login.microsoftonline.com/common/oauth2/v2.0`
const perm = `offline_access%20User.Read%20Files.ReadWrite.All%20Sites.ReadWrite.All`
const appURI = `http://localhost:8080/oauth2Callback`








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
    let select = ``
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
        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }

}












module.exports = { codeRequest, refreshToken, accessToken, getFilesList }