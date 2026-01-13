// --- 1. FIREBASE SETUP (Paste your keys here) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    // 🔴 PASTE YOUR KEYS FROM FIREBASE CONSOLE HERE 🔴
    apiKey: "AIzaSyBvMqEEIU6B6TYxLCsf2tRGSbSe_PtYu80", 
    authDomain: "m-league-fantasy-7460c.firebaseapp.com",
    projectId: "m-league-fantasy-7460c",
    storageBucket: "m-league-fantasy-7460c.firebasestorage.app",
    messagingSenderId: "16232427026",
    appId: "1:16232427026:web:6c59e99bba1ddc7eeaf2cb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. SELECT ELEMENTS ---
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');
const forgotBtn = document.getElementById('forgotBtn');

// --- 3. AUTH LOGIC ---

// Toggle Login/Register Views
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    
    const isLogin = !loginForm.classList.contains('hidden');
    toggleText.innerText = isLogin ? "Don't have a team yet?" : "Already have a team?";
    toggleBtn.innerText = isLogin ? "Register for Season 2026" : "Back to Login";
});

// Forgot Password Logic
forgotBtn.addEventListener('click', async () => {
    // 1. Try to get email from the login box first
    let email = document.getElementById('loginEmail').value;
    
    // 2. If empty, ask the user
    if (!email) {
        email = prompt("Please enter your email address to reset password:");
    }

    if (email) {
        try {
            await sendPasswordResetEmail(auth, email);
            alert(`Link sent to ${email}!\n\n IMPORTANT: Please check your Spam/Junk folder.`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                alert("Error: This email is NOT registered in M-League.");
            } else if (error.code === 'auth/invalid-email') {
                alert("Error: Invalid email format.");
            } else {
                alert("Error: " + error.message);
            }
        }
    } else {
        alert("Please enter an email to reset your password.");
    }
});

// REGISTER (Create User + Save Team Data to Firestore)
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const manager = document.getElementById('regManager').value;
    const team = document.getElementById('regTeam').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Save custom data (Manager Name, Team) to Firestore Database
        await setDoc(doc(db, "users", user.uid), {
            manager_name: manager,
            team_name: team,
            email: email,
            points: 0,
            budget: 100.0
        });

        alert("Registration Successful! Welcome to the League.");
        
        // Fix: Manually show dashboard to prevent Race Condition
        showDashboard({
            manager_name: manager,
            team_name: team
        });
    } catch (error) {
        alert("Registration Failed: " + error.message);
    }
});

// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // Note: onAuthStateChanged will handle the redirect
    } catch (error) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            alert("Account not found. Please Register for a new team first.");
        } else {
            alert("Login Failed: " + error.message);
        }
    }
});

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        location.reload();
    });
});

// --- 4. STATE LISTENER (The Brain) ---
// This runs automatically whenever the app starts or user logs in/out
onAuthStateChanged(auth, async (user) => {
    const loader = document.getElementById('loading-overlay');
    
    if (user) {
        // User is signed in - try to get data
        const docRef = doc(db, "users", user.uid);
        let data = { manager_name: "Manager", team_name: "My Team" }; // Default Fallback

        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                data = docSnap.data();
            }
        } catch (err) {
            console.log("Offline or Error:", err);
        }

        // Show Dashboard even if DB read fails
        showDashboard(data);
    } else {
        // User is signed out
        authScreen.classList.remove('hidden');
        dashboardScreen.classList.add('hidden');
        document.body.style.background = 'linear-gradient(135deg, #0E1E5B 0%, #050a24 100%)';
    }
    
    // Hide Loader
    if(loader) loader.classList.add('hidden');
});


function showDashboard(data) {
    authScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    
    document.body.style.display = 'block'; 
    document.body.style.background = '#F0F2F5';

    document.getElementById('displayTeamName').innerText = data.team_name;
    document.getElementById('displayManagerName').innerText = data.manager_name;
}