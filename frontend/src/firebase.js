import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5WB_r7_J55fpY4ZEyCmbeKsuZL8BEg10",
  authDomain: "chainvault-c0723.firebaseapp.com",
  projectId: "chainvault-c0723",
  storageBucket: "chainvault-c0723.firebasestorage.app",
  messagingSenderId: "553366705125",
  appId: "1:553366705125:web:05b0e20306b4263e43150c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);