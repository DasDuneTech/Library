const {accessToken} = require(`./GoogleLib`)
const fetch = require('node-fetch');
const fs = require('fs');

main = (async() => {

    let token = ``
    let sheetsList
    let cacheSheetsNames = []
    
    //get an access token
    token = await accessToken()

    //get sall files list from Google Drive
    const getFilesList = async() => {

        let url = `https://www.googleapis.com/drive/v3`
        res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let info  = await res.json()
        return(info)
    
    }
    
    //get sheets list from Google Sheets
    const getSheetsList = async() => {

        let url = `https://www.googleapis.com/drive/v3/files?q=mimeType: "application/vnd.google-apps.spreadsheet"`
        res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let info  = await res.json()
        return(info)
    
    }

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
    const getSheetId = async(sheetsName) => {

        if (sheetsList === undefined) loadSheetsList()
        let sheetId = ``    
        sheetsList.map((item) => {if (item.name === sheetsName) sheetId = item.id})
        if (sheetId === ``) {
            //refresh the lists and try a second time
            await saveSheetsList()
            await loadSheetsList()
            sheetsList.map((item) => {if (item.name === `Library`) sheetId = item.id})
            if (sheetId = ``) return(`cannot find the sheet Id for ${sheetName}`)
        }
        else return(sheetId)
    }

    //get sheet info from Google sheets
    // sheetInfo = {sheetsName, sheetName, range} 
    getSheetInfo = async(sheetInfo) => {
    
        const {sheetsName, sheetName, range, isFormulas} = sheetInfo
        const sheetsId = await getSheetId(sheetsName)
    
        range2 = range === undefined ? `` : `!${range}`
        formulas = isFormulas ? `?valueRenderOption=FORMULA` : ``

        let url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}${formulas}`
        let res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
        let info  = await res.json()
  
        let index = -1
       
        //create/update cache
        cacheSheetsNames.map((o, i) => { if (Object.keys(o)[0] == `${sheetsName}-${sheetName}`) index = i })
        if (index === -1) {
            let obj = {}
            obj[`${sheetsName}-${sheetName}`] = info.values
            cacheSheetsNames.push(obj)
        }
        else cacheSheetsNames[index][`${sheetsName}-${sheetName}`] = info.values

        return(info)
    
    }

   //get sheet info from cache
    getInfo = async(sheetInfo) => {

        const {sheetsName, sheetName, range} = sheetInfo
        let index = -1

        //get values from cache or from Google Sheets
        cacheSheetsNames.map((o, i) => { if (Object.keys(o)[0] == `${sheetsName}-${sheetName}`) index = i })
        let info = index === -1 ? await getSheetInfo(sheetsInfo) : cacheSheetsNames[index][`${sheetsName}-${sheetName}`]
        return(info.values)

    }

    //update sheet
    update = async(sheetInfo) => {

        const {sheetsName, sheetName, range, payload} = sheetInfo
        const sheetsId = await getSheetId(sheetsName)
    
        range2 = range === undefined ? `` : `!${range}`
        payloadObj = {values:payload}
        

        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values/${sheetName}${range2}?valueInputOption=USER_ENTERED`

        let res = await fetch(url, 
            {
            method: 'PUT',    
            headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadObj)
        });
        resInfo  = await res.json()
        console.log(resInfo)

    }


    //update sheet
    batchUpdate = async(sheetInfo) => {

        const {sheetsName, payload} = sheetInfo
        const sheetsId = await getSheetId(sheetsName)
    
        let payloadObj = {valueInputOption: "USER_ENTERED"}
        let arrObj = []
        payload.map((item) => arrObj.push({range:item[0], values:[[item[[1]]]]}))
        payloadObj = {...payloadObj, ...{data:arrObj}}
        

        url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}/values:batchUpdate`

        let res = await fetch(url, 
            {
            method: 'POST',    
            headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadObj)
        });
        resInfo  = await res.json()
        console.log(resInfo)

    }

    //* testing

    //get sheet info

    // let sheetsInfo = {sheetsName:`Library`, sheetName:`Library`, isFormulas:true}
    // let info = await getInfo(sheetsInfo)

    // info = await getInfo(sheetsInfo)
    // console.log(info)


    // let key = `toto`
    // let val = [[1],[2],[3],[4],[5]]
    // let obj = {}
    // obj[key] = val
    // cacheSheetsNames.push(obj)


    // console.log(cacheSheetsNames)



    // let payload = {values:[[77],[78]]}
    // let payload = [[999],["=HYPERLINK(\"https://dasdunetech.com/library/Google.html\",\"Google API\")"]]
    // let range = `B3:B4`
    // let sheetsInfo = {sheetsName:`Library`, sheetName:`Library`, range:range, payload:payload}
    // let msg = await update(sheetsInfo)


    let payload = [["Library!C4:C4", 888],["Sheet2!D4:D4", 889],["Library!E4:E4", 887]]
    let sheetsInfo = {sheetsName:`Library`, payload:payload}
    let msg = await batchUpdate(sheetsInfo)



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








