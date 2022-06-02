// * Basic HTTP server
const express = require('express');
const app = express();

const port = 8080;

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

// JSON parsing
app.use(express.json({ limit: '50mb' }));

// FormData parsing
const multer = require('multer');
const upload = multer();

// for parsing multipart/form-data
app.use(upload.array()); 

//Google Sheets Functions library
const {codeRequest, refreshToken, accessToken, getFilesList, getSpreadsheetsList, getSpreadsheetInfo, getInfo, update, batchUpdate} = require(`./GoogleLib`)


//http get response 
app.get('/hello', async (req, res) => res.send(`Hello whoever you are`))



//http get response with parameters
app.get('/hello2', async (req, res) => {

   firstName = req.query.firstName
   lastName = req.query.lastName
 
   res.send(`Hello ${firstName} ${lastName}`)

})

//http post response with JSON / formData body object
app.post('/hello3', async (req, res) => {

   try{
       const {firstName, lastName} = req.body
       res.send(`Hello ${firstName} ${lastName}`)
   }
   catch(err){
       res.send(`error :: ${err.message}`)
       return
   }

})


//redirection to Google Auth to get an authorization code
app.get('/oauth2Google', async(req, res) => {

    let url = await codeRequest()
    res.redirect(url);

});



// redirect URI endpoint to receive the authorization code
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













//get files details list from Google Sheets
app.get('/getFilesList', async (req, res) => {

   await accessToken() 
   let info =  await getFilesList()
   console.log(info)
   res.send(info)

})

//get spreadsheets details list from Google Sheets
app.get('/getSpreadsheetsList', async (req, res) => {

    await accessToken() 
    let info =  await getSpreadsheetsList()
    console.log(info)
    res.send(info)
 
 })

//get sheets details for a given spreadsheet
 app.get('/getSpreadsheetInfo', async (req, res) => {

   await accessToken() 
   let info =  await getSpreadsheetInfo(`Library`)
   if (typeof info !== 'object') res.send(info)
   else res.send(info.sheets)

})

//get sheet info for a given sheet (values or formulas)
 app.get('/getInfo', async (req, res) => {

    await accessToken() 
    let spreadsheetInfo = {spreadsheetName:`Library`, sheetName:`Library`, isFormulas:true}
    let info =  await getInfo(spreadsheetInfo)
    console.log(info)
    res.send(info)

 })

//update a range for a given sheet 
 app.get('/update', async (req, res) => {

    await accessToken() 
    let payload = [[666],["=HYPERLINK(\"https://dasdunetech.com/library/Google.html\",\"Google API\")"]]
    let range = `B3:B4`
    let spreadsheetInfo = {spreadsheetName:`Library`, sheetName:`Library`, range:range, payload:payload}
    let info = await update(spreadsheetInfo)
    console.log(info)
    res.send(info)

 })

 //update multiple ranges for multiples sheets for a given spreadsheet
 app.get('/batchUpdate', async (req, res) => {

    await accessToken() 
    let payload = [["Library!C4:C4", 888],["Sheet2!D4:D4", 889],["Library!E4:E4", 887]]
    let sheetsInfo = {spreadsheetName:`Library`, payload:payload}
    let info = await batchUpdate(sheetsInfo)
    console.log(info)
    res.send(info)

})
