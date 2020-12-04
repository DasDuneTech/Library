import * as Firebase from './firebase-app.js';
import * as Firestore from './firebase-firestore.js';
import * as Auth from './firebase-auth.js';
import * as Storage from './firebase-storage.js';
import * as Functions from './firebase-functions.js';

// Your web app's Firebase configuration
firebase.initializeApp({
  apiKey: 'AIzaSyAMUALLsis8PVFIemU4nSurm0It3GXKKHQ',
  authDomain: 'taglinker-4ee7c.firebaseapp.com',
  databaseURL: 'https://taglinker-4ee7c.firebaseio.com',
  projectId: 'taglinker-4ee7c',
  storageBucket: 'taglinker-4ee7c.appspot.com',
  messagingSenderId: '348659433489',
  appId: '1:348659433489:web:2c0611d5e17a1c1e06b1b0',
});
// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// const auth = firebase.auth();
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const functions = firebase.functions();
const addAdmin = functions.httpsCallable('addAdmin');
const addEditor = functions.httpsCallable('addEditor');
const addViewer = functions.httpsCallable('addViewer');
const checkAdmin = functions.httpsCallable('checkAdmin');
const checkUser = functions.httpsCallable('checkUser');
const setUser = functions.httpsCallable('setUser');

let provider = new firebase.auth.GoogleAuthProvider();

//Events handler
let authMsg = (op, msg) => {
  const event = new CustomEvent('authMsg', {
    detail: { op: op, msg: msg },
  });
  document.dispatchEvent(event);
};

let storageMsg = (op, msg) => {
  const event = new CustomEvent('storageMsg', {
    detail: { op: op, msg: msg },
  });
  document.dispatchEvent(event);
};

//db Handler
export let dbOp = (dbObj) => {
  let { op, col, id, doc } = dbObj;

  if (op === 'chg') {
    db.collection(col)
      .orderBy('Title')
      .onSnapshot((snapshot) => {
        console.log('something change...');
        snapshot.docChanges().map((change) => {
          docChanged(change.type, change.doc.id, change.doc.data());
          console.log(
            'change Type: ' + change.type + ' on doc: ' + change.doc.id
          );
          console.log(change.doc.data());
        });
      });
  }
};

//db Handler
export let authOp = (authObj) => {
  const { op, user, email, password, token } = authObj;

  if (op === 'logIn') {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((cred) => authMsg(op, cred))
      .catch((err) => authMsg(op, err.message));
  }

  if (op === 'signIn') {
    auth
      .signInWithPopup(provider)
      .then(function (result) {
        let msg = { user: result.user, token: result.credential.accessToken };
        authMsg(op, msg);
      })
      .catch(function (error) {
        let msg = {
          err: `error code: ${error.code} - ${error.message} for email ${error.email} with credential ${error.credential} `,
        };
        authMsg(op, msg);
      });
  }

  if (op === 'signOut') {
    auth.signOut().then(
      () => {
        console.log('Signed Out');
        authMsg(op);
      },
      (error) => {
        console.error('Sign Out Error', error);
        authMsg(op, error);
      }
    );
  }

  if (op === 'signUp') {
    auth
      .createUserWithEmailAndPassword(email, pass)
      .then((cred) => authMsg(op, cred))
      .catch((err) => authMsg(op, err.message));
  }

  if (op === 'getToken') {
    auth.currentUser
      .getIdToken()
      .then((cred) => authMsg(op, cred))
      .catch((err) => authMsg(op, err.message));
  }

  if (op === 'logOut') {
    auth.signOut().then(() => authMsg(op));
  }

  if (op === 'chg') {
    auth.onAuthStateChanged((cred) => {
      authMsg(op, cred);
    });
  }

  if (op === 'addAdmin') {
    let user = auth.currentUser;
    authMsg(op, user);
  }

  if (op === 'checkUser') {
    let user = auth.currentUser;
    let userStr = JSON.stringify(user);
    checkUser({ user: userStr })
      .then((msg) => authMsg(op, msg))
      .catch((err) => authMsg(op, err.message));
  }

  if (op === 'createUser') {
    let authStr = JSON.stringify(authObj);
    setUser({ info: 'hello' })
      .then((msg) => authMsg(op, msg))
      .catch((err) => authMsg(op, err.message));
  }
};

//storage Handler

export let storageOp = (op, file) => {
  if (op === 'upload') {
    storage
      .ref('/' + file.name)
      .put(file)
      .then((msg) => storageMsg(op, msg))
      .catch((err) => storageMsg(op, err.message));
  }

  if (op === 'download')
    storage.ref
      .child('/' + file.name)
      .download(file)
      .then((msg) => storageMsg(op, msg))
      .catch((err) => storageMsg(op, err.message));
};
