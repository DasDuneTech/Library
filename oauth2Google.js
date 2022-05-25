//* Google authorization Oauth 2.0 process flow
const express = require('express');
const app = express();
const port = 8080;

const fs = require('fs');

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

const {codeRequest, refreshToken} = require(`./GoogleLib`)

//* 1. The user send a HTTP request to /oauth2Google endpoint
//* 2. The function will send its information to Google for authentication
//* 3. The scope is Google Sheets read/write access

app.get('/oauth2Google', async(req, res) => {

    let url = await codeRequest()
    res.redirect(url);

});

//* 4. Google will ask the user if he accepts to authorize the application (Google consent popUp window)
//* 5. If the user accept, Google will send back an access code to the configured return URI (/codeGoogleCallback)

// redirect URI endpoint to receive the access code
app.get('/oauth2GoogleCallback', async(req, res) => {

    let code = req.query.code

    let info =`oauth2GoogleCallback ::\n\t`
    for (const [key, val] of Object.entries(req.query)) info += `${key}: ${val}\n\t`
    console.log(info)

    let tokenInfo = await refreshToken({code:code})

    if (tokenInfo.refresh_token === undefined) {
        info =`oauth2GoogleCallback ::\n\t`
        info += `error : Cannot exchange the access code for a refresh token`
        console.log(info)
        res.send(`error : Cannot exchange the access code for a refresh token`);
    } 
    else {
        fs.writeFileSync('oauth2GoogleRefreshToken.txt', tokenInfo.refresh_token)
        res.send(`thanks user to trust our app.`);
    }
});

