//* OAuth2 Google functions
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config()

const appId = process.env.GOOGLE_OAUTH2_APP_ID
const secret = process.env.GOOGLE_OAUTH2_APP_SECRET

const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth`
const scope= [`https://www.googleapis.com/auth/spreadsheets`]
appUri = `http://localhost:8080/oauth2GoogleCallback`
refreshTokenUrl = `https://oauth2.googleapis.com/token`

//access code request
const codeRequest = async() =>{

    let info =`oauth2GoogleFunctions::codeRequest\n\t`
    info += `oauth2 access code http request :\n\t`

    let url = `${oauth2Url}?response_type=code&access_type=offline&client_id=${appId}&redirect_uri=${appUri}&scope=${scope}`
    info += url
    console.log(info)

    return(url)
}

// refresh token from code/refresh token
const refreshToken = async(tokenInfo) => {

    const {code, rToken} = tokenInfo

    const formData2 = new FormData();
    formData2.append('client_id', appId);

    if (code !== undefined) {
        formData2.append('redirect_uri', appUri);
        formData2.append('client_secret', secret);
        formData2.append('grant_type', 'authorization_code');
        formData2.append('code', code);
    }
    else{
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
    return(tokenInfo.access_token)

}

module.exports = { codeRequest, accessToken, refreshToken }