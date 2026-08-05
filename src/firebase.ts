import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzQ4OPDYd8lnYLhwnZgj1IBNEBN1sOUpw",
  authDomain: "gss-kubwa-yearbook.firebaseapp.com",
  projectId: "gss-kubwa-yearbook",
  storageBucket: "gss-kubwa-yearbook.firebasestorage.app",
  messagingSenderId: "930110133457",
  appId: "1:930110133457:web:df72fca77de598a172a1f0"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
export default app;

