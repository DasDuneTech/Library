//* Caller : check all the Node functions Libraries

// let clientCloud = `Microsoft`
let clientCloud = `Google`

//Microsoft Functions library
const  {codeRequest, refreshToken, accessToken, popToken, getFilesList} = require(`./${clientCloud}NodeLib`)

const main = (async() =>{

    let info

    //refresh the access token 
    let token = await accessToken()
    //populate access token for the functions in Library
    popToken(token)

    //get files list (all)
    // info = await getFilesList()

    //get files list (with file type and selection, type can be `pdf` or `excel`
    info = await getFilesList({type:`pdf`, select:`name,id,webUrl,@microsoft.graph.downloadUrl`})

    console.log(info)











})()



