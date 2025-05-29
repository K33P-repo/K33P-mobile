import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPi1RSXwzsv48oEyZgt5Ec7c0oMAXjtuc",
  authDomain: "k33p-81092.firebaseapp.com",
  projectId: "k33p-81092",
  storageBucket: "k33p-81092.appspot.com", 
  messagingSenderId: "1055656180929",
  appId: "1:1055656180929:web:7d86d5a28665b4ce31e840",
  measurementId: "G-1XGPMZS2VM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
