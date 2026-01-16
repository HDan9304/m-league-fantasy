// Firebase SDK Integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your Firebase configuration (Updated with live project keys)
const firebaseConfig = {
  apiKey: "AIzaSyBvMqEEIU6B6TYxLCsf2tRGSbSe_PtYu80",
  authDomain: "m-league-fantasy-7460c.firebaseapp.com",
  projectId: "m-league-fantasy-7460c",
  storageBucket: "m-league-fantasy-7460c.firebasestorage.app",
  messagingSenderId: "16232427026",
  appId: "1:16232427026:web:6c59e99bba1ddc7eeaf2cb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Sign-In with Firebase
const customBtn = document.getElementById('customGoogleBtn');
if (customBtn) {
    customBtn.onclick = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Logged in:", result.user.displayName);
                window.location.href = 'dashboard.html';
            }).catch((error) => alert(error.message));
    };
}

// Handle Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const managerName = document.getElementById('mgrName').value;
                const teamName = document.getElementById('teamName').value;

                // Save Manager Profile to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    managerName: managerName,
                    teamName: teamName,
                    email: email,
                    createdAt: new Date()
                });

                alert("Account & Team Created!");
                window.location.href = 'index.html';
            }).catch((error) => alert(error.message));
    });
}

// Handle Login
const loginForm = document.getElementById('emailLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => window.location.href = 'dashboard.html')
            .catch((error) => alert(error.message));
    });
}

// Global Session Listener (Replaces checkSession)
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
    }
});