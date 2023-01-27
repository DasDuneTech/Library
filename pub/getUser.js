//common library
import {readConfig, snackBar, getUser} from './lib/lib.js'

//read config
let config = await readConfig()
if ('error' in config) snackBar(error)

let idToken = ``

document.getElementById(`idToken`).addEventListener('change', () => init())

const init = async() => {

    let userInfo = await getUser()
    console.log(userInfo )

}

document.addEventListener('idToken', (e) => {
    
    idToken = e.detail.idToken
    init()

});
