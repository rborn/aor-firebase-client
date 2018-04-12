/* globals localStorage */
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK } from 'admin-on-rest'
import * as firebase from 'firebase'

const authListener = null;

function handleAuthStateChange (authUser, resolve, reject) {
  if(authUser) {
    authUser.getIdToken().then((firebaseToken) => {
      const db = firebase.firestore();

      db.collection('users').doc(authUser.uid).get()
        .then((doc) => {
          if (!doc.exists) {
            if(reject) return reject(new Error('Access Denied!'))
          }
          const profile = doc.data()
          if(profile &&
            (profile.isAdmin)) {
            localStorage.setItem('firebaseToken', firebaseToken)
            let user = {authUser, profile, firebaseToken}
            if(resolve) return resolve(user);
          } else {
            if(reject) return reject(new Error('Access Denied!'))
          }
        })
    })
  } else {
    localStorage.removeItem('firebaseToken')
  }
}

export default (type, params) => {

  if(!this.authListener) {
    this.authListener = firebase.auth().onAuthStateChanged(handleAuthStateChange.bind(this));
  }

  if (type === AUTH_LOGOUT) {
    this.authListener();
    localStorage.removeItem('firebaseToken')
    return firebase.auth().signOut()
  }

  if (type === AUTH_CHECK) {
    return localStorage.getItem('firebaseToken') ? Promise.resolve() : Promise.reject();
  }

  if (type === AUTH_LOGIN) {
    const { username, password } = params

    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(username, password)
      .then(authUser => handleAuthStateChange(authUser, resolve, reject))
      .catch(e => reject(new Error('User not found')))
    })
  }

  return Promise.resolve()
}
