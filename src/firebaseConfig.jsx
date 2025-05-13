 // firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCoKGads7BNJBG5lcUTZLPi59NnwZmeqNA",
  authDomain: "fir-config-6ca5c.firebaseapp.com",
  projectId: "fir-config-6ca5c",
  storageBucket: "fir-config-6ca5c.appspot.com",
  messagingSenderId: "395068353763",
  appId: "1:395068353763:web:ea3ec46d3fac9ac109a9d6",
  measurementId: "G-BBRTC7BFHQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

 export { auth, db, storage };

   