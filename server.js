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

// check if access token is valid
app.use(async (req, res, next) => {
    if (token.expires_in < 60) await getAccessToken()
    next()
})

//* http requests

app.get('/', async (req, res) => {res.send(`TagLinker Library`)})

// app.get('/getAccessToken', async (req, res) => {
    
//     accessToken = await getAccessToken()
//     res.send(accessToken)})

app.get('/getSheetsValues', async (req, res) => {

    let range = req.query.range
    let info = await getSheetsValues(range)
    res.send(info)})

//* Google stuff

// //get a fresh access token
// const checkAccessToken = async(accessToken) => {

//     if (accessToken.expires_in < 60) {
//     await getAccessToken()
//     }
//     return

// }

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

//get sheet info from Google sheets (values or formulas)
getSheetsValues = async(range) => {

    try {

        let sheetsId= `1SjOk0X2rIYs6UBaGP2k_JCeJpx9H5ZgibIErgQHp1tU`
        let sheetName = `Library`
        let range2 = range === undefined ? `` : `!${range}`
        let formulas = `?valueRenderOption=FORMULA`

        let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}${formulas}`

        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token.access_token}});
        let data  = await res.json()
        let info = res.ok ? data : `getSheetInfo :: http request error : ${data.error.message}`
        return(info)
    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}

//update sheet
const update = async(sheetInfo) => {

    const {bookName, sheetName, range, payload} = sheetInfo

    try {

        const bookId = await getFileId(bookName)

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
        let data  = await res.json()
        let info = res.ok ? data : `update :: http request error : ${data.error.message}`
        return(info)

    }
    catch(err) {
        console.log(err.message)
        return(err.message)
    }
}




































//redirection to cloud provider Auth to get an authorization code
app.get('/oauth2', async(req, res) => {

    try{
        let url = await codeRequest()
        res.redirect(url);
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }

});







// redirect URI endpoint to receive the authorization code
app.get('/oauth2Callback', async(req, res) => {

    try {

        let code = req.query.code

        let info =`oauth2Callback ::\n\t`
        for (const [key, val] of Object.entries(req.query)) info += `${key}: ${val}\n\t`
        console.log(info)

        let tokenInfo = await accessCode(code)

        if (tokenInfo.refresh_token !== undefined) {
             fs.writeFileSync('oauth2RefreshToken.txt', tokenInfo.refresh_token)
            res.send(`thanks user to trust our app.`);
        }
        else {
            info =`oauth2Callback ::\n\t`
            info += `error : Cannot exchange the access code for a refresh token`
            console.log(info)
            res.send(`error : Cannot exchange the access code for a refresh token`);
        }
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
});






//get files details list from Google Sheets
app.get('/accessToken', async (req, res) => {

    try {
        await accessToken() 
        res.send(`done`)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
})



//get files details list from Google Sheets
app.get('/getFilesList', async (req, res) => {

    try {

        let type = req.query.type
        let query = {type:type}

        //use select with Microsoft to avoid a ton of useless information
        query = {...query, ...{select:`name,id,webUrl,@microsoft.graph.downloadUrl`}}

        await accessToken() 
        let info =  await getFilesList(query)
        console.log(info)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
})




//get file info
app.get('/getFileInfo', async (req, res) => {

    try {

        await accessToken() 
        let info =  await getFileInfo(`Library.xlsx`)
        console.log(info)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
 })





//get file info
app.get('/getFileId', async (req, res) => {

    try {

        await accessToken() 
        let info =  await getFileId(`Electricity.pdf`)
        console.log(info)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
})





//file export (download) - only Google Workspace files allow
app.get('/exportFile', async (req, res) => {

    try {

        await accessToken() 

        let fileInfo = {name:`Electricity`, type:`doc`}
        let info =  await exportFile(fileInfo)
        if (typeof info !== 'object') res.send(info)
        else res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
  })



//file download - only binary files (like pdf) allow
app.get('/downloadFile', async (req, res) => {

    try {

        await accessToken() 

        let info =  await downloadFile(`Electricity.pdf`)
        if (typeof info !== 'object') res.send(info)
        else res.send(info)
        }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
  })




//file upload
app.get('/uploadFile', async (req, res) => {

    try{

        await accessToken() 
        let fileInfo = {name:`Salsa.pdf`, type:`pdf`}
        let info =  await uploadFile(fileInfo)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
  })



 

//get sheets info
 app.get('/getBookInfo', async (req, res) => {

    try {

        await accessToken() 
        let info =  await getBookInfo(`Library.xlsx`)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
  })






//get sheet values for a given sheet (values or formulas)
 app.get('/getSheetValues', async (req, res) => {

    try {

        await accessToken() 
        // let sheetInfo = {sheetsName:`Library`, sheetName:`Library`, formulas:true}
        let sheetInfo = {bookName:`Library.xlsx`, sheetName:`Sheet1`}
        let info =  await getSheetValues(sheetInfo)
        console.log(info)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
 })



//update a range for a given sheet 
 app.get('/update', async (req, res) => {

    try {

        await accessToken() 
        let payload = [[666],["=HYPERLINK(\"https://dasdunetech.com/library/Google.html\",\"Google API\")"]]
        let range = `B3:B4`
        let bookInfo = {bookName:`tagsList1.xlsx`, sheetName:`Sheet1`, range:range, payload:payload}
        let info = await update(bookInfo)
        console.log(info)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
 })


 //update multiple ranges for multiples sheets
 app.get('/batch', async (req, res) => {

    try {

        info = await batch(tags)
        console.log(info)
        res.send(info)
    }
    catch(err){
        res.send(`error :: ${err.message}`)
        return
    }
})






//common functions
app.get('/tagIndexer', async (req, res) => {

    let sheetsInfo 
    let info 

    sheetsInfo = {bookName:`Library.xlsx`, sheetName:`Sheet1`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)

    sheetsInfo = {bookName:`Library.xlsx`, sheetName:`Sheet2`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)
    
    sheetsInfo = {bookName:`Library.xlsx`, sheetName:`Sheet3`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)

    sheetsInfo = {bookName:`Library3.xlsx`, sheetName:`Sheet1`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)

    sheetsInfo = {bookName:`Library3.xlsx`, sheetName:`Sheet2`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)
    
    sheetsInfo = {bookName:`Library3.xlsx`, sheetName:`Sheet3`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)

    sheetsInfo = {bookName:`Library2.xlsx`, sheetName:`Sheet1`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)

    sheetsInfo = {bookName:`Library2.xlsx`, sheetName:`Sheet2`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)
    
    sheetsInfo = {bookName:`Library2.xlsx`, sheetName:`Sheet3`}
    info = await tagIndexer(sheetsInfo)
    console.log(info)


    res.send(info)


})




app.get('/tagInfo', async (req, res) => {

    let info = await tagInfo(`Tag1`)

    console.log(info)

    res.send(info)

})





let tags = 
[
    [`Tag1`, `Header1`, `=HYPERLINK("https://dasdunetech.com/","DasDuneTech")`],
    [`Tag5`, `Header1`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag16`, `Header2`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag29`, `Header3`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag203`, `Header4`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag217`, `Header5`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag226`, `Header6`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag305`, `Header7`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag313`, `Header8`, `=HYPERLINK("https://dasdunetech.com/","DDT")`],
    [`Tag336`, `Header4`, `=HYPERLINK("https://dasdunetech.com/","DDT")`]
]





