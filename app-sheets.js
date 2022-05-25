const {accessToken} = require(`./GoogleLib`)
const fetch = require('node-fetch');

sheetRange = async() => {

    //get an access token
    let token = await accessToken()
    console.log(token)

    //Get the column values
    url = `https://sheets.googleapis.com/v4/spreadsheets/1TIQfrcPM15l_4NIjDOz7MMe3EtHfIR8_aST4YD-PEY4/values/A1%3AJ9`

    res = await fetch(`${url}`, {headers: {Authorization: 'Bearer ' + token}});
    let range  = await res.json()

    return range

}

sheetRange()