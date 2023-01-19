// * Basic HTTP server
const express = require('express');
const app = express();
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config()

const port = 8080;
const appId = process.env.GOOGLE_OAUTH2_APP_ID
const secret = process.env.GOOGLE_OAUTH2_APP_SECRET
const refreshToken = process.env.GOOGLE_OAUTH2_REFRESH_TOKEN
const refreshTokenUrl = `https://oauth2.googleapis.com/token`

let token = {expires_in:0}

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

// JSON parsing
app.use(express.json({ limit: '50mb' }));
app.use('/pub', express.static('pub'));

// check if access token is valid on every request
app.use(async (req, res, next) => {
    if (token.expires_in < 60) await getAccessToken()
    next()
})

//* http requests
app.get('/', async (req, res) => {res.send(`TagLinker Library Server`)})

app.get('/debug', async (req, res) => {

    res.sendFile(`${__dirname}/tree.html`);

})


app.get('/indexer', async (req, res) => {

    res.sendFile(`${__dirname}/videoIndexer.html`);

})

app.get('/viewer', async (req, res) => {

    res.sendFile(`${__dirname}/videoViewer.html`);

})


//get a fresh access token
const getAccessToken = async() => {

    const rToken = refreshToken
    const formData2 = new FormData();
    formData2.append('client_id', appId);
    formData2.append('grant_type', 'refresh_token');
    formData2.append('refresh_token', rToken);
    formData2.append('client_secret', secret);

    let url = `${refreshTokenUrl}`

    try {
        let res = await fetch(url, 
            {
            method: 'POST',    
            body: formData2
        });

        let data  = await res.json()
        if (res.ok) {return(token = data)}
        else throw `error getting the access token : code : ${res.status}(${res.statusText}) - ${data.error} - ${data.error_description}`
    }
    catch(err) {
        // console.log(err)
        console.trace()
        console.log(err)
        return {error: `error getting the access token`}
    }

}


//get sheet values
app.get('/getSheetsList', async (req, res) => {

    try {

        let sheetsId= `1SjOk0X2rIYs6UBaGP2k_JCeJpx9H5ZgibIErgQHp1tU`
        let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}`

        let resp = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token.access_token}});
        let data  = await resp.json()
        if (!resp.ok) throw `Cannot get the sheet's values sheet :: ${resp.statusText}`
        res.send(data)
    }
    catch(err) {
        console.log(err.message)
        res.send(err.message)
    }
})



//get sheet values
app.get('/getSheetsValues', async (req, res) => {

    let sheetName = req.query.sheetName

    try {

        let sheetsId= `1SjOk0X2rIYs6UBaGP2k_JCeJpx9H5ZgibIErgQHp1tU`
        // let sheetName = `Library`
        let range = ``
        let formulas = `?valueRenderOption=FORMULA`

        let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range}${formulas}`

        let resp = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token.access_token}});
        let data  = await resp.json()
        if (!resp.ok) throw `Cannot get the sheet's values sheet :: ${resp.statusText}`
        res.send(data)
    }
    catch(err) {
        console.log(err.message)
        res.send(err.message)
    }
})

//clear sheet
app.post('/clear', async (req, res) => {

    const {range} = req.body

    let sheetsId= `1SjOk0X2rIYs6UBaGP2k_JCeJpx9H5ZgibIErgQHp1tU`
    let sheetName = `Library`
    let range2 = range === undefined ? `` : `!${range}`

    try {

        // let range2 = range === undefined ? `` : `!${range}`
        
        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}:clear`

        let resp = await fetch(url, 
            {
            method: 'POST',    
            headers: {
            Authorization: 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        let data  = await resp.json()
        if (resp.ok) throw `Cannot clear the sheet :: ${resp.statusText}`
        res.send(data)
    }
    catch(err) {
        console.log(err.message)
        res.send(err.message)
    }
})


//update sheet
app.post('/update', async (req, res) => {

    const {range, values} = req.body

    let sheetsId= `1SjOk0X2rIYs6UBaGP2k_JCeJpx9H5ZgibIErgQHp1tU`
    let sheetName = `Library`
    let range2 = range === undefined ? `` : `!${range}`

    try {

        // const bookId = await getFileId(bookName)

        let range2 = range === undefined ? `` : `!${range}`
        let payloadObj = {values:values}
        
        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}?includeValuesInResponse=true&valueInputOption=USER_ENTERED`

        let resp = await fetch(url, 
            {
            method: 'PUT',    
            headers: {
            Authorization: 'Bearer ' + token.access_token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadObj)
        });
        let data  = await res.json()
        if (!resp.ok) throw `Cannot update the sheet :: ${resp.statusText}`
        res.send(data)

    }
    catch(err) {
        console.log(err.message)
        res.send(err.message)
    }
})
