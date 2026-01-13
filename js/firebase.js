// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

<script>
  const firebaseConfig = {
    apiKey: "AIzaSyBvMqEEIU6B6TYxLCsf2tRGSbSe_PtYu80",
    authDomain: "m-league-fantasy-7460c.firebaseapp.com",
    projectId: "m-league-fantasy-7460c",
    storageBucket: "m-league-fantasy-7460c.firebasestorage.app",
    messagingSenderId: "16232427026",
    appId: "1:16232427026:web:6c59e99bba1ddc7eeaf2cb"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
