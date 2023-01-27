//common library
import {readConfig, snackBar, getUser} from './lib/lib.js'

//read config
let config = await readConfig()
if ('error' in config) snackBar(error)

let idToken = ``
let serverUrl = location.origin 

document.getElementById(`idToken`).addEventListener('change', () => init())

const init = async() => {

    let userInfo = await getUser()
    console.log(userInfo )

    try {
        let res = await fetch(`${serverUrl}/setAdmin`, 
        { method: `POST`,
        headers: {'Content-Type': `application/json`},
        body:JSON.stringify({idToken:idToken, uid:userInfo.uid})})
        // body:JSON.stringify({uid:userInfo.uid})})
        if(!res.ok) throw `Cannot clear the sheet :: ${res.statusText}`
    }
    catch(err){
        console.trace()
        console.log(err)
    }



}

document.addEventListener('idToken', (e) => {
    
    idToken = e.detail.idToken
    init()

});
