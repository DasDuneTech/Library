// * Basic HTTP Server
const express = require('express');
const app = express();
const port = 8080;

const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth`
appId = `185112099523-fa3f6cfhelrlsluons4tparvlf8ht9bs.apps.googleusercontent.com`
const clientSecret = `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`
const scope= [`https://www.googleapis.com/auth/spreadsheets`]
appUri = `http://localhost:8080/oauth2GoogleCallback`
refreshTokenUrl = `https://oauth2.googleapis.com/token`

//* Google authorization Oauth 2.0 process flow
//* 1. The user send a HTTP request to /codeGoogle endpoint
//* 2. The function will send its information to Google for authentication
//* 3. The scope is Google Sheets read/write access

app.get('/oauth2Google', (req, res) => {

    let url = `${oauth2Url}?response_type=code&access_type=offline&client_id=${appId}&redirect_uri=${appUri}&scope=${scope}`
    res.redirect(url);

});

//* 4. Google will ask the user if he accepts to authorize the application (Google popUp window)
//* 5. If the user accept, Google will send back an access code to the configured return URI (/codeGoogleCallback)

// redirect URI endpoint to receive the access code
// save the code in a secured place
app.get('/oauth2GoogleCallback', async(req, res) => {

    let info = req.query
    let code = info.code

    console.log(code)

    console.log(`got Google access code!`);   
    fs.writeFileSync('refreshToken.txt', code)
    res.send(`thanks user to trust our app.`);

});

// refresh token from code or refresh token
const refreshToken = async(rToken, code) => {

    const formData2 = new FormData();
    formData2.append('client_id', appId);

    if (code) {
        formData2.append('redirect_uri', appUri);
        formData2.append('client_secret', clientSecret);
        formData2.append('grant_type', 'authorization_code');
        formData2.append('code', rToken);
    }
    else{
        formData2.append('grant_type', 'refresh_token');
        formData2.append('refresh_token', rToken);
        formData2.append('client_secret', clientSecret);
    }

    let url = `${refreshTokenUrl}`

    let res = await fetch(url, 
        {
        method: 'POST',    
        body: formData2
    });
    
    let info2 = await res
    let info  = await res.json()
    token = code ? info.refresh_token : info.access_token

    fs.writeFileSync('refreshToken.txt', info.refresh_token)

    return(token)

}

const test = async(code) => {

    const lastrefreshToken = fs.readFileSync('refreshToken.txt', 'utf8') 
    token = await refreshToken(lastrefreshToken, code)


}

//Get refresh/access tokens with authorization code
// test(true)

//Get refresh/access tokens with refesh token
test(false)


