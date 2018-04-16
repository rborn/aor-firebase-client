/* globals localStorage */
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK } from 'admin-on-rest'
import firebase from 'firebase'

function firebaseAuthCheck (auth, resolve, reject) {
  if (auth) {
    // TODO make it a parameter
    firebase.database().ref('/users/' + auth.uid).once('value')
    .then(function (snapshot) {
      const profile = snapshot.val()
      // TODO make it a parameter
      if (profile && profile.isAdmin) {
        auth.getIdToken().then((firebaseToken) => {
          let user = {auth, profile, firebaseToken}

          // TODO improve this! Save it on redux or something
          localStorage.setItem('firebaseToken', firebaseToken)
          if (resolve) resolve(user)
        })
        .catch(err => {
          if (reject) reject(err)
        })
      } else {
        firebase.auth().signOut()
        if (reject) reject(new Error('Access Denied!'))
      }
    })
    .catch(err => {
      if (reject) reject(err)
    })
  } else {
    if (reject) reject(new Error('Login failed!'))
  }
}

export default (type, params) => {

  if (!this.autheListener) {
      this.authListener = firebase.auth().onAuthStateChanged(firebaseAuthCheck.bind(this));
  }

  if (type === AUTH_LOGOUT) {
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
      .then(auth => firebaseAuthCheck(auth, resolve, reject))
      .catch(e => reject(new Error('User not found')))
    })
  }
  return Promise.resolve()
}
