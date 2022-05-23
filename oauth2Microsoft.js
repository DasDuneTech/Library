// * Basic HTTP Server
const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

//file system handler
const fs = require('fs');

//environement varialbles handler
require('dotenv').config()

//* Google authorization Oauth 2.0 process flow
//* 1. The user send a HTTP request to /codeMicrosoft endpoint
//* 2. The function will send its information to Microsoft for authentication

app.get('/codeMicrosoft', (req, res) => {

    if (process.env.MS_CODE) {

        res.send(`the app has already a MS code`)
        return

    }

    const msUrl = `https://login.microsoftonline.com/common/oauth2/v2.0`
    const appClientId = `0b4a3cf1-d0d1-414e-8f43-997a540d0c53`
    const perm = `offline_access%20User.Read%20Files.ReadWrite.All%20Sites.ReadWrite.All`
    const appUri = `http://localhost:8080/tokenMicrosoft`

    let url = `${msUrl}/authorize?response_type=code&response_mode=query&client_id=${appClientId}&redirect_uri=${appUri}&scope=${perm}`
    res.redirect(url);

});

//* 3. Microsoft will ask the user if he accepts to authorize the application (MS popUp window)
//* 4. If the user accept, microsoft will send back an access code to the configured return URI (/tokenMicrosoft)

// redirect URI endpoint to receive the access code
// save the code as an environment variable
app.get('/tokenMicrosoft', async(req, res) => {

    let info = req.query
    let code = info.code

    console.log(code)

    fs.appendFile('.env', `MS_CODE=${code}\n`, function (err) {
    if (err) throw err;
    console.log('Saved!');
    });

    console.log(`got MS access code!`);   
    res.send(`thanks user for your trust in our app.`);

});