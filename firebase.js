import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


const firebaseConfig = {
    apiKey: "AIzaSyBIdF0uMvDVe4ZFDYDd8b7nvJBScOMCV30",
    authDomain: "batchat-307d9.firebaseapp.com",
    projectId: "batchat-307d9",
    storageBucket: "batchat-307d9.appspot.com",
    messagingSenderId: "844206343433",
    appId: "1:844206343433:web:7f8514358ba99b2fe03fd8"
  };

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized");
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storageRef = firebase.storage().ref();
export const db = firebase.firestore();
export const timestamp = firebase.firestore.FieldValue.serverTimestamp;
export const storage = firebase.storage();

