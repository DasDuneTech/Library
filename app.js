// * Basic HTTP server
const express = require('express');
const app = express();
const fs = require('fs');

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

//get the config file
let config = fs.readFileSync('config.json', 'utf8')
let configObj = JSON.parse(config)
const {clientCloud} = configObj

//Google Sheets Functions library
const {codeRequest, refreshToken, accessToken, getFilesList, getFileInfo, getFileId, downloadFile, getSheetsInfo, getSheetValues, update, batchUpdate} = require(`./${clientCloud}-Lib`)
// const {codeRequest, refreshToken, accessToken, getFilesList, getFileInfo, exportFile, getSpreadsheetInfo, getValues, update, batchUpdate, downloadFile, uploadFile} = require(`./Google-Lib`)


//Google Sheets Functions library
// const {codeRequest, refreshToken, accessToken, getFilesList, exportFile, getSpreadsheetInfo, getValues, update, batchUpdate, downloadFile, uploadFile} = require(`./Google-Lib`)


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
app.get('/oauth2', async(req, res) => {

    let url = await codeRequest()
    res.redirect(url);

});



// redirect URI endpoint to receive the authorization code
app.get('/oauth2Callback', async(req, res) => {

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
        fs.writeFileSync('oauth2RefreshToken.txt', tokenInfo.refresh_token)
        res.send(`thanks user to trust our app.`);
    }
});


//get files details list from Google Sheets
app.get('/accessToken', async (req, res) => {

    await accessToken() 
    res.send(`done`)
})




//get files details list from Google Sheets
app.get('/getFilesList', async (req, res) => {

    let type = req.query.type
    let query = {type:type}

    //use select with Microsoft to avoid a ton of useless information
    query = {...query, ...{select:`name,id,webUrl,@microsoft.graph.downloadUrl`}}

    await accessToken() 
    let info =  await getFilesList(query)
    console.log(info)
    res.send(info)

})





//get file info
app.get('/getFileInfo', async (req, res) => {

    await accessToken() 
    let info =  await getFileInfo(`Electricity.pdf`)
    console.log(info)
    res.send(info)
 
 })



//get file info
app.get('/getFileId', async (req, res) => {

    await accessToken() 
    let info =  await getFileId(`Electricity.pdf`)
    console.log(info)
    res.send(info)

})







//file export (download) - only Google Workspace files allow
app.get('/exportFile', async (req, res) => {

    await accessToken() 

    let fileInfo = {name:`Electricity`, type:`doc`}
    let info =  await exportFile(fileInfo)
    if (typeof info !== 'object') res.send(info)
    else res.send(info)
 
 })




//file download - only binary files (like pdf) allow
app.get('/downloadFile', async (req, res) => {

    await accessToken() 

    let info =  await downloadFile(`Electricity.pdf`)
    if (typeof info !== 'object') res.send(info)
    else res.send(info)
 
 })




//file upload
app.get('/uploadFile', async (req, res) => {

    await accessToken() 
    let fileInfo = {name:`Salsa.pdf`, type:`pdf`}
    let info =  await uploadFile(fileInfo)
    res.send(info)
 
 })




 

//get sheets info
 app.get('/getSheetsInfo', async (req, res) => {

   await accessToken() 
   let info =  await getSheetsInfo(`tagsList1.xlsx`)
   res.send(info)


})






//get sheet values for a given sheet (values or formulas)
 app.get('/getSheetValues', async (req, res) => {

    await accessToken() 
    // let sheetInfo = {sheetsName:`Library`, sheetName:`Library`, formulas:true}
    let sheetInfo = {sheetsName:`tagsList1.xlsx`, sheetName:`Sheet1`}
    let info =  await getSheetValues(sheetInfo)
    console.log(info)
    res.send(info)

 })





//update a range for a given sheet 
 app.get('/update', async (req, res) => {

    await accessToken() 
    let payload = [[666],["=HYPERLINK(\"https://dasdunetech.com/library/Google.html\",\"Google API\")"]]
    let range = `B3:B4`
    let sheetsInfo = {sheetsName:`tagsList1.xlsx`, sheetName:`Sheet1`, range:range, payload:payload}
    let info = await update(sheetsInfo)
    console.log(info)
    res.send(info)

 })

 

 //update multiple ranges for multiples sheets for a given spreadsheet
 app.get('/batchUpdate', async (req, res) => {

    let batchValues = sortSheetsValues(tags)
    
    await accessToken() 

    for (const val of batchValues) {

        sheetsInfo = {spreadsheetName:val[0], payload:val[1]}    
        info = await batchUpdate(sheetsInfo)
        console.log(info)

    }

 

    // let payload = [["Library!C4:C4", 888],["Sheet2!D4:D4", 889],["Library!E4:E4", 887]]
    // let sheetsInfo = {spreadsheetName:`Library`, payload:payload}
    // let info = await batchUpdate(sheetsInfo)
    console.log(info)
    res.send(info)

})



let tags = 
[
    [`Library`, `Sheet1!B4:B4`, 1],
    [`Library`, `Sheet2!B3:B3`, 2],
    [`Library`, `Sheet3!B6:B6`, 3],
    [`Library2`, `Sheet2!B8:B8`, 4],
    [`Library2`, `Sheet3!B2:B2`, 5],
    [`Library3`, `Sheet1!B7:B7`, 6],
    [`Library3`, `Sheet3!B3:B3`, 7],
]



sortSheetsValues = (arr) =>  {

    let info = []
    let ssIndex

    arr.map((item) => {
        info.map((ss, i) => {if (ss[0]===item[0]) ssIndex = i})
        if (info.filter((ss) => {return ss[0]===item[0]}).length === 0) info.push([item[0], [[item[1], item[2]]]])
        else info[ssIndex][1].push([item[1], item[2]])
    })

    return(info)



}









