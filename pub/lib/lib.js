// * Library 
//import all core libraries
import './firebase-app.js'
import './firebase-auth.js'

//*Global variables
let fireBaseIdToken = ``
let claims = ``


//*config

//init config
let config
export const readConfig = async() => {
  try {

    let res = await fetch('/pub/config.json');
    let data = await res.json()
    if (res.ok) {
      config = data
      return(data)
    }
    else throw `error reading configuration file <config.json>.`
  }
  catch(err) {
    console.trace()
    console.log(err)
    return {error:err.message}
  }
}

await readConfig()
const {tlServer, clientCloud, FBInit} =  config
//firebase stuff
firebase.initializeApp(FBInit);
const auth = firebase.auth();


//*functions

//Get current firebase user idToken
auth.onAuthStateChanged(cred => {

  try {

    let user = firebase.auth().currentUser;

    if (user) {
      auth.currentUser
        .getIdToken()
        .then((idToken) => {
          fireBaseIdToken = idToken
        })
        .catch((err) => console.log(err.message));
    }

    if (!user) {
      console.log(`no user signed, call signIn dialog box...`)
      auth
        .signInWithPopup(authProvider)
        .then(usr => {
          auth.currentUser
            .getIdToken()
            .then((idToken) => {
              fireBaseIdToken = idToken
        })
            .catch((err) => console.log(err.message));
        })
        .catch(err => {console.log(err.message)});
    }
  }
  catch(err) {
    console.log(err.message)
    return(err.message)
  }
})

//populate DOM elements
export const popEle = (info) =>{

  try {

  const {e, i, c, t, p, v} = info
  
    let ele = document.createElement(e)
    if (i !== undefined) ele.id = i
    if (c !== undefined) ele.className = c
    if (t !== undefined) ele.textContent = t
    if (p !== undefined) p.appendChild(ele)
    if (v !== undefined) ele.value = v
    return ele
  }
  catch(err) {
    console.log(err.message)
    return(err.message)
  }
}

//get Firebase Id token (wait a sec..)
export const getIdToken= () => { 
  return(fireBaseIdToken) 
}


//get Id token custom claims
export const getCustomClaims= async() => { 


  claims = await auth.verifyIdToken(fireBaseIdToken)
  console.log(claims)


}










