import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyCaYLmonL2pjN4eyBdBpDRVpfEkYaiyuvI",
  authDomain: "ai-image-generator-cec43.firebaseapp.com",
  projectId: "ai-image-generator-cec43",
  storageBucket: "ai-image-generator-cec43.firebasestorage.app",
  messagingSenderId: "914970508207",
  appId: "1:914970508207:web:fe8fe36ec6391fa6000d5a",
  measurementId: "G-PPQLTDWRCM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);