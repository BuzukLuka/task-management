import firebase from "firebase/app";
import "firebase/auth";
// Add other Firebase SDKs you want to use (e.g., firestore, storage)

const firebaseConfig = {
    apiKey: "AIzaSyCWNp3v3ychIUmD_Tjv3fbxJ23gv3jxMXo",
    authDomain: "taskmanager-1cf80.firebaseapp.com",
    projectId: "taskmanager-1cf80",
    storageBucket: "taskmanager-1cf80.appspot.com",
    messagingSenderId: "209694404585",
    appId: "1:209694404585:web:9b4f2fb0b7e893c128e578",
    measurementId: "G-28SJFPVRPK"
  };

firebase.initializeApp(firebaseConfig);

export default firebase;
