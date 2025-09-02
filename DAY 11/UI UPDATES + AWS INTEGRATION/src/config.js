import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBulnySyt23Aik4sDdrx__SJooozZMVO7Q",
  authDomain: "medpredict-d0522.firebaseapp.com",
  projectId: "medpredict-d0522",
  storageBucket: "medpredict-d0522.firebasestorage.app",
  messagingSenderId: "123907359725",
  appId: "1:123907359725:web:c87d30f3c443c859621de4",
  measurementId: "G-J9S568LL7J"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, analytics, auth, db, storage, functions };
export default app;