
// * Basic HTTP server
const express = require('express');
const app = express();

const port = 8080;

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
});

const {accessToken, getFilesList, getSheetsList, getInfo, update, batchUpdate} = require(`./GoogleLib`)


app.get('/getFilesList', async (req, res) => {

   await accessToken() 
   let info =  await getFilesList()
   console.log(info)

})



app.get('/getSheetsList', async (req, res) => {

    await accessToken() 
    let info =  await getSheetsList()
    console.log(info)
 
 })



 app.get('/getInfo', async (req, res) => {

    await accessToken() 
    let sheetsInfo = {sheetsName:`Library`, sheetName:`Library`, isFormulas:true}
    let info =  await getInfo(sheetsInfo)
    console.log(info)
 
 })


 app.get('/update', async (req, res) => {

    await accessToken() 
    let payload = [[777],["=HYPERLINK(\"https://dasdunetech.com/library/Google.html\",\"Google API\")"]]
    let range = `B3:B4`
    let sheetsInfo = {sheetsName:`Library`, sheetName:`Library`, range:range, payload:payload}
    let info = await update(sheetsInfo)
    return(info)
 })

 app.get('/batchUpdate', async (req, res) => {

    await accessToken() 
    let payload = [["Library!C4:C4", 888],["Sheet2!D4:D4", 889],["Library!E4:E4", 887]]
    let sheetsInfo = {sheetsName:`Library`, payload:payload}
    let info = await batchUpdate(sheetsInfo)
    return(info)
})
