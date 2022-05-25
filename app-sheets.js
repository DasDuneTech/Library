const {accessToken} = require(`./GoogleLib`)
const fetch = require('node-fetch');

let token = ``

getGoogleInfo = async(url) => {

    res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let info  = await res.json()
    return(info)

}

urlGetSheetRangeValues = `https://sheets.googleapis.com/v4/spreadsheets/1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4/values/Library`
urlGetFilesList = `https://www.googleapis.com/drive/v3/files`
urlGetSheetsList = `https://www.googleapis.com/drive/v3/files?q=mimeType: "application/vnd.google-apps.spreadsheet"`

main = (async() => {
    
    token = await accessToken()
    
    //get sheet range values
    let info = await getGoogleInfo(urlGetSheetRangeValues)
    console.log(info)

     //get files list
    info = await getGoogleInfo(urlGetFilesList)
    console.log(info)

    //get sheets list
    info = await getGoogleInfo(urlGetSheetsList)
    console.log(info)

})()




