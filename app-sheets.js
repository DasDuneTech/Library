const {accessToken} = require(`./GoogleLib`)
const fetch = require('node-fetch');
const fs = require('fs');

let token = ``
let sheetsList



urlGetSheetRangeValues = `https://sheets.googleapis.com/v4/spreadsheets/1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4/values/Library`
urUpdateSheetRangeValues = `https://sheets.googleapis.com/v4/spreadsheets/1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4/values/Library!C5%3AC6?valueInputOption=USER_ENTERED`
urlGetFilesList = `https://www.googleapis.com/drive/v3/files`
urlGetSheetsList = `https://www.googleapis.com/drive/v3/files?q=mimeType: "application/vnd.google-apps.spreadsheet"`

//! add flush sheet values cache

main = (async() => {
    
    //get an access token
    token = await accessToken()

    //get misc. Google API info
    getGoogleInfo = async(url) => {

        res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let info  = await res.json()
        return(info)
    
    }
    
    //get sheets list from Google Sheets
    const getSheetsList = async() => getGoogleInfo(urlGetSheetsList)

    //save sheets info list on a file
    const saveSheetsList = async() => {

        let info = await getSheetsList()
        fs.writeFileSync(`sheetsList.txt`, JSON.stringify(info.files), (err) => {
            if (err) console.log(err.message);
        });
    }

    //load sheets info list to memory
    const loadSheetsList = async() => {

        sheetsList  = JSON.parse(fs.readFileSync('sheetsList.txt')) 
        console.log(sheetsList)
    }

    //get sheets Id from sheets name    
    const getSheetId = async(sheetName) => {

        if (sheetsList === undefined) loadSheetsList()
        let sheetId = ``    
        sheetsList.map((item) => {if (item.name === `Library`) sheetId = item.id})
        if (sheetId === ``) {
            //refresh the lists and try a second time
            await saveSheetsList()
            await loadSheetsList()
            sheetsList.map((item) => {if (item.name === `Library`) sheetId = item.id})
            if (sheetId = ``) return(`cannot find the sheet Id for ${sheetName}`)
        }
        else return(sheetId)
    }

    //get sheet values
    // sheetInfo = {sheetsName, sheetName, range} 
    getSheetValues = async(sheetInfo) => {
    
        const {sheetsName, sheetName, range} = sheetInfo
        const sheetsId = await getSheetId(sheetsName)
    
        range2 = range === undefined ? `` : `!${range}`

        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}`
    
        let info = await getGoogleInfo(url)
        return(info)

        //! cache the sheet values and check if already in cache, keep in the cache until the app is curently used
    
    }

    //* testing

    //get sheet values

    let sheetsInfo = {sheetsName:`Library`, sheetName:`Library`}
    let info = await getSheetValues(sheetsInfo)
    console.log(info)

     //get sheet range values
    // let info = await getGoogleInfo(urlGetSheetRangeValues)
    // console.log(info)

     //get files list
    // info = await getGoogleInfo(urlGetFilesList)
    // console.log(info)

    // let info = await getSheetsList()
    // console.log(info)

    // let payload = {values:[[77],[78]]}

    // url = `https://sheets.googleapis.com/v4/spreadsheets/1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4/values/Library!C5%3AC6?valueInputOption=USER_ENTERED`

    // let res = await fetch(url, 
    //     {
    //     method: 'PUT',    
    //     headers: {
    //     Authorization: 'Bearer ' + token,
    //     'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(payload)
    // });
    // resInfo  = await res.json()
    // console.log(resInfo)

    // let sheetId = await getSheetId('Library')
    // console.log(sheetId)

 




})()








