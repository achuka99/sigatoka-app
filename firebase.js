// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC-2ol4yesQWwqUJH63qRXNypR3socrZks",
    authDomain: "sigatoka-app-7676c.firebaseapp.com",
    projectId: "sigatoka-app-7676c",
    storageBucket: "sigatoka-app-7676c.appspot.com",
    messagingSenderId: "561053297853",
    appId: "1:561053297853:web:475e8f4641a59632529bd4",
    measurementId: "G-FJS8MDKD7P"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app);
const storage = getStorage(app);

export {  auth, db, storage };