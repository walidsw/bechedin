import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA95Dgc3Ja4hHW4AKFTmWatgGpRMBQ8jRk",
  authDomain: "fine-entry-475306-b5.firebaseapp.com",
  projectId: "fine-entry-475306-b5",
  storageBucket: "fine-entry-475306-b5.firebasestorage.app",
  messagingSenderId: "261859703587",
  appId: "1:261859703587:web:b4ae37893bd46f2b84aa96",
  measurementId: "G-MJ3ELFQ371",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
