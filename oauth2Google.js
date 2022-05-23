// * Basic HTTP Server
const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

//* Google authorization Oauth 2.0 process flow
//* 1. The user send a HTTP request to /codeGoogle endpoint
//* 2. The function will send its information to Google for authentication
//* 3. The scope is Google Sheets read/write access

app.get('/codeGoogle', (req, res) => {

    const msUrl = `https://accounts.google.com/o/oauth2/v2/auth`
    const clientId = `185112099523-28n6mo59f8loqevo5hiptdudtm2h8gce.apps.googleusercontent.com`
    const clientSecret = `GOCSPX-4ihQua5OKvyr55KPdneyP7rpavZ`
    const scope= [`https://www.googleapis.com/auth/spreadsheets`]
    const appUri = `http://localhost:8080/codeGoogleCallback`

    let url = `${msUrl}?response_type=code&access_type=offline&client_id=${clientId}&redirect_uri=${appUri}&scope=${scope}`
    res.redirect(url);

});

//* 4. Google will ask the user if he accepts to authorize the application (Google popUp window)
//* 5. If the user accept, Google will send back an access code to the configured return URI (/codeGoogleCallback)

// redirect URI endpoint to receive the access code
// save the code as an environment variable
app.get('/codeGoogleCallback', async(req, res) => {

    let info = req.query
    let code = info.code

    console.log(code)

    console.log(`got Google access code!`);   
    res.send(`thanks user to trust our app.`);

});