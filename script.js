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

// TRAFFIC COP: Prevent listener from overwriting register data
let isRegistering = false; 

// MOCK DATA: Malaysian League Players
const M_LEAGUE_PLAYERS = [
    { id: 1, name: "Syihan Hazmi", pos: "GK", team: "JDT", price: 6.0 },
    { id: 2, name: "Kalamullah Al-Hafiz", pos: "GK", team: "KDA", price: 5.0 },
    { id: 3, name: "Samuel Somerville", pos: "GK", team: "SEL", price: 4.5 },
    { id: 4, name: "Matthew Davies", pos: "DEF", team: "JDT", price: 6.5 },
    { id: 5, name: "La'Vere Corbin-Ong", pos: "DEF", team: "JDT", price: 6.5 },
    { id: 6, name: "Sharul Nazeem", pos: "DEF", team: "SEL", price: 5.5 },
    { id: 7, name: "Azam Azmi", pos: "DEF", team: "TRG", price: 5.0 },
    { id: 8, name: "Dominic Tan", pos: "DEF", team: "SAB", price: 5.0 },
    { id: 9, name: "Khuzaimi Piee", pos: "DEF", team: "SEL", price: 4.5 },
    { id: 10, name: "Arif Aiman", pos: "MID", team: "JDT", price: 9.0 },
    { id: 11, name: "Faisal Halim", pos: "MID", team: "SEL", price: 8.5 },
    { id: 12, name: "Brendan Gan", pos: "MID", team: "KL", price: 6.5 },
    { id: 13, name: "Safawi Rasid", pos: "MID", team: "TRG", price: 7.0 },
    { id: 14, name: "Hong Wan", pos: "MID", team: "JDT", price: 6.0 },
    { id: 15, name: "Mukhairi Ajmal", pos: "MID", team: "SEL", price: 5.5 },
    { id: 16, name: "Bergson da Silva", pos: "FWD", team: "JDT", price: 10.0 },
    { id: 17, name: "Heberty", pos: "FWD", team: "JDT", price: 9.5 },
    { id: 18, name: "Darren Lok", pos: "FWD", team: "SAB", price: 7.5 },
    { id: 19, name: "Paulo Josue", pos: "FWD", team: "KL", price: 8.0 },
    { id: 20, name: "Ifedayo Olusegun", pos: "FWD", team: "KDA", price: 8.0 }
];
let selectedSquadIds = new Set();
const selectionScreen = document.getElementById('selection-screen');

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
    let email = document.getElementById('loginEmail').value;
    if (!email) email = prompt("Please enter your email address to reset password:");

    if (email) {
        // LOCK UI
        forgotBtn.style.pointerEvents = 'none';
        forgotBtn.innerText = "Sending...";

        try {
            await sendPasswordResetEmail(auth, email);
            showToast(`Link sent to ${email}! Check Spam folder.`, 'success');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                showToast("Error: Email not registered.", 'error');
            } else if (error.code === 'auth/invalid-email') {
                showToast("Error: Invalid email format.", 'error');
            } else {
                showToast(error.message, 'error');
            }
        } finally {
            // UNLOCK UI (Always runs)
            forgotBtn.style.pointerEvents = 'auto';
            forgotBtn.innerText = "Forgot Password?";
        }
    }
});

// REGISTER (Create User + Save Team Data to Firestore)
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const confirmPass = document.getElementById('regConfirmPass').value; // New
    const manager = document.getElementById('regManager').value;
    const team = document.getElementById('regTeam').value;

    // Validation: Check Passwords match
    if (pass !== confirmPass) {
        showToast("Error: Passwords do not match.", 'error');
        return;
    }

    // LOCK BUTTON
    const btn = registerForm.querySelector('button');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Creating Team...";
    
    isRegistering = true; // Stop Auth Listener from interfering

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            manager_name: manager,
            team_name: team,
            email: email,
            points: 0,
            budget: 100.0
        });

        showToast("Registration Successful! Welcome.", 'success');
        showDashboard({ manager_name: manager, team_name: team });
        isRegistering = false; // Reset flag to allow future logins
        
    } catch (error) {
        isRegistering = false; // Release the lock
        
        // UNLOCK ONLY ON ERROR (On success, we move to dashboard)
        btn.disabled = false;
        btn.innerText = originalText;

        if (error.code === 'auth/email-already-in-use') {
            showToast("Email already used. Please Login.", 'error');
        } else {
            showToast(error.message, 'error');
        }
    }
});


// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    
    // LOCK BUTTON
    const btn = loginForm.querySelector('button');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Verifying...";

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        
        // Manual Force Load (Fixes UI Deadlock)
        const docRef = doc(db, "users", userCredential.user.uid);
        let data = { manager_name: "Manager", team_name: "My Team" };
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) data = docSnap.data();
        } catch (e) {
            if (e.message.includes("offline")) {
                showToast(" Please Create 'Firestore Database' in Firebase Console.", 'error');
            } else {
                showToast("Data Error: " + e.message, 'error');
            }
        }

        showDashboard(data);
    } catch (error) {
        // Error: Unlock so they can try again
        btn.disabled = false;
        btn.innerText = originalText;

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
            showToast("Account not found. Please Register first.", 'error');
        } else {
            showToast("Login Failed: " + error.message, 'error');
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
    // Stop if we are in the middle of registering
    if (isRegistering) return;

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
            if (err.message.includes("offline")) {
                showToast(" Please Create 'Firestore Database' in Firebase Console.", 'error');
            } else {
                showToast("Data Error: " + err.message, 'error');
            }
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
    // 1. Check if user already has a squad
    if (!data.squad || data.squad.length === 0) {
        // No squad? Show Selection Screen
        authScreen.classList.add('hidden');
        renderSelectionScreen();
    } else {
        // Has squad? Show Dashboard
        authScreen.classList.add('hidden');
        selectionScreen.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        
        document.body.style.display = 'block'; 
        document.body.style.background = '#F0F2F5';

        document.getElementById('displayTeamName').innerText = data.team_name;
        document.getElementById('displayManagerName').innerText = data.manager_name;
        
        // Update Pitch (Optional Visual)
        const pitchText = document.querySelector('.pitch-visual p');
        if(pitchText) pitchText.innerText = "Squad Ready (" + data.squad.length + " Players)";
    }
}

// UI HELPER: Show Custom Toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// UI HELPER: Toggle Password Visibility
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = e.currentTarget.previousElementSibling;
        const isPassword = input.getAttribute('type') === 'password';
        
        // 1. Toggle Type
        input.setAttribute('type', isPassword ? 'text' : 'password');

        // 2. Toggle Icon (Swap SVG)
        if (isPassword) {
            // Show "Eye Slash" (Hidden state icon)
            e.currentTarget.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
            // Show "Eye" (Visible state icon)
            e.currentTarget.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
    });
});

// --- SQUAD SELECTION LOGIC ---
function renderSelectionScreen() {
    selectionScreen.classList.remove('hidden');
    document.body.style.background = '#F0F2F5';
    
    const container = document.getElementById('players-container');
    container.innerHTML = '';

    const positions = ['GK', 'DEF', 'MID', 'FWD'];
    
    positions.forEach(pos => {
        const section = document.createElement('div');
        section.className = 'position-section';
        section.innerHTML = `<h4 class="position-title">${pos}</h4><div class="player-grid" id="grid-${pos}"></div>`;
        container.appendChild(section);

        const grid = section.querySelector(`#grid-${pos}`);
        M_LEAGUE_PLAYERS.filter(p => p.pos === pos).forEach(player => {
            const card = document.createElement('div');
            card.className = `player-card ${selectedSquadIds.has(player.id) ? 'selected' : ''}`;
            card.onclick = () => togglePlayer(player.id, card);
            card.innerHTML = `<h4>${player.name}</h4><span>${player.team}</span><span>RM ${player.price}M</span>`;
            grid.appendChild(card);
        });
    });
}

function togglePlayer(id, cardElement) {
    if (selectedSquadIds.has(id)) {
        selectedSquadIds.delete(id);
        cardElement.classList.remove('selected');
    } else {
        if (selectedSquadIds.size >= 15) {
            showToast("Max 15 players allowed!", "error");
            return;
        }
        selectedSquadIds.add(id);
        cardElement.classList.add('selected');
    }
    
    // Update Counter
    const count = selectedSquadIds.size;
    document.getElementById('squadCount').innerText = count;
    document.getElementById('confirmSquadBtn').disabled = (count !== 15);
}

// Confirm Button Logic
document.getElementById('confirmSquadBtn').addEventListener('click', async () => {
    const btn = document.getElementById('confirmSquadBtn');
    btn.innerText = "Saving...";
    
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user found");

        const squadArray = Array.from(selectedSquadIds);
        
        // Save to Firestore with MERGE
        await setDoc(doc(db, "users", user.uid), {
            squad: squadArray
        }, { merge: true });

        // Reload to hit showDashboard again
        location.reload();
        
    } catch (err) {
        showToast("Save Failed: " + err.message, "error");
        btn.innerText = "Confirm Squad";
    }
});

