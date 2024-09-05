// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9f_jdtGpN2cfAhdXtAnRNArhhbFUqrXs",
  authDomain: "link2qr-v2.firebaseapp.com",
  projectId: "link2qr-v2",
  storageBucket: "link2qr-v2.appspot.com",
  messagingSenderId: "221679296456",
  appId: "1:221679296456:web:0c061a3c2477c9aadeaafd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Export storage
export { storage, ref, uploadBytesResumable, getDownloadURL };