
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBa8wEHBHvmy2_RxyCr0z-7QLC0kxhp3L8",
    authDomain: "remakequizlet.firebaseapp.com",
    projectId: "remakequizlet",
    storageBucket: "remakequizlet.appspot.com",
    messagingSenderId: "277822280201",
    appId: "1:277822280201:web:4f37133b3cdb243f979ed8"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//user 
function API_getCurrentUser() {
    var stored = localStorage.getItem("currentUser")

    if (stored == null){
        return null
    }else{
        return JSON.parse(stored)
    }
}

//Auth
function API_createAuthUI(signInSuccessWithAuthResultFunc, redirect, redirectURL) {
    var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            signInSuccessWithAuthResultFunc(authResult.user)
            return redirect
          },
          uiShown: function() {
          }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: redirectURL,
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            customParames: {
                // Forces account selection even when one account
                // is available.
                hd: 'students.mpsd.org',
                prompt: "select_account"
              }
          }
        ]
      };
    
    // Initialize the FirebaseUI Widget using Firebase.
    var firebase_UI = new firebaseui.auth.AuthUI(firebase.auth());
    
    firebase_UI.start('#firebaseui-auth-container',uiConfig);
}

function API_logout() {
    if (API_getCurrentUser() != null) {
        firebase.auth().signOut().then(() => {
            localStorage.setItem("currentUser", null);
            location.reload();
        }).catch((error) => {
            console.log(error);
        });
    }
}

function API_writeData(collection, data, id = null, callback = ()=>{}) {

    if (id == null) {
        db.collection(collection).add(data).then((docRef) => {
            callback(docRef)
        })
        return
    }

    db.collection(collection).doc(id).set(data).then((docRef) => {
        callback(docRef)
    })
}

function API_getData(collection, id, callback = () => {}) {
    db.collection(collection).doc(id).get().then((docRef) => {
        callback(docRef)
    })
}

function API_updateData(collection, data, id, callback = () => {}) {
    db.collection(collection).doc(id).update(data).then((docRef) => {
        callback(docRef)
    })
}

function API_writeToOwner(userId, docId, callback = () => {}) {
    let docItem = db.collection("users").doc(userId)
    docItem.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            docItem.update({
                sets: firebase.firestore.FieldValue.arrayUnion(docId)
            }).then((docRef) => {
                callback(docRef)
            }) 
        }else{
            docItem.set({sets: [docId]}).then((docRef) => {
                callback(docRef)
            })
        }
    })
} 

function API_loadUserData(userId, callback = () => {}) {
    db.collection("users").doc(userId).get().then((docRef) => {
        callback(docRef)
    })
}

function API_loadSetData(setId, callback = () => {}) {
    db.collection("sets").doc(setId).get().then((docRef) => {
        callback(docRef)
    })
}