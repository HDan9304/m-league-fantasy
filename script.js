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

// DATA STATE
let M_LEAGUE_PLAYERS = []; 
let GW_INFO = {};
let FIXTURES = []; 
let TEAM_KITS = {}; // New State for Kits
let selectedSquadIds = new Set();

// INITIALIZATION: Fetch Data, Fixtures & Kits Parallelly
async function initGameData() {
    try {
        const [dataRes, fixRes, kitsRes] = await Promise.all([
            fetch('./data.json'),
            fetch('./fixtures.json'),
            fetch('./kits.json')
        ]);

        const data = await dataRes.json();
        FIXTURES = await fixRes.json();
        TEAM_KITS = await kitsRes.json();

        M_LEAGUE_PLAYERS = data.players;
        GW_INFO = data.gameweek;
        console.log(`Loaded: ${M_LEAGUE_PLAYERS.length} Players, ${FIXTURES.length} Fixtures, Kits Ready`);
    } catch (err) {
        console.error(err);
        showToast("System Error: Could not load game data.", "error");
    }
}

const gameDataReady = initGameData(); // Run & Capture Promise to wait for later
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

    await gameDataReady; // Fix: Wait for JSON to load before rendering UI

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
        renderSelectionScreen(data); // Pass User Data
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
function renderSelectionScreen(data) {
    selectionScreen.classList.remove('hidden');
    document.body.style.background = '#F0F2F5';
    
    // Inject Manager Identity
    if (data) {
        document.getElementById('selManager').innerText = data.manager_name || "Manager";
        document.getElementById('selTeam').innerText = data.team_name || "My Team";
    }

    // Update Deadline Text
    if (GW_INFO.deadline) {
        document.getElementById('gw-deadline').innerText = `GW${GW_INFO.id} Deadline: ${GW_INFO.deadline}`;
    }

    // Initialize Pitch immediately (No more list view)
    updatePitchView();
}

function togglePlayer(id, cardElement) {
    // 1. Identify Player & Current Squad
    const player = M_LEAGUE_PLAYERS.find(p => p.id === id);
    const squad = Array.from(selectedSquadIds).map(sid => M_LEAGUE_PLAYERS.find(p => p.id === sid));

    // 2. Remove if already selected
    if (selectedSquadIds.has(id)) {
        selectedSquadIds.delete(id);
        cardElement.classList.remove('selected');
        updateFooterStats();
        return;
    }

    // 3. VALIDATION RULES (FPL Logic)
    
    // Rule A: Max 15 Players
    if (squad.length >= 15) { 
        return showToast("Squad full! Max 15 players.", "error"); 
    }

    // Rule B: Budget Cap (RM 100M)
    const currentCost = squad.reduce((sum, p) => sum + p.price, 0);
    if (currentCost + player.price > 100) { 
        return showToast(`Budget exceeded! (RM ${currentCost + player.price}M > 100M)`, "error"); 
    }

    // Rule C: Team Limit (Max 3 per club)
    if (squad.filter(p => p.team === player.team).length >= 3) { 
        return showToast(`Max 3 players from ${player.team}!`, "error"); 
    }

    // Rule D: Position Structure (2 GK, 5 DEF, 5 MID, 3 FWD)
    const LIMITS = { 'GK': 2, 'DEF': 5, 'MID': 5, 'FWD': 3 };
    const currentPosCount = squad.filter(p => p.pos === player.pos).length;
    if (currentPosCount >= LIMITS[player.pos]) { 
        return showToast(`Max ${LIMITS[player.pos]} ${player.pos}s allowed!`, "error"); 
    }

    // 4. Success: Add Player
    selectedSquadIds.add(id);
    cardElement.classList.add('selected');
    updateFooterStats();
    updatePitchView(); // Refresh the visual modal
}

// UI HELPER: Updates Counter & Budget Display
function updateFooterStats() {
    const squad = Array.from(selectedSquadIds).map(sid => M_LEAGUE_PLAYERS.find(p => p.id === sid));
    const count = squad.length;
    const cost = squad.reduce((sum, p) => sum + p.price, 0);
    const balance = (100 - cost).toFixed(1);
    
    // Update HUD (Top Card)
    document.getElementById('selCount').innerText = `${count}/15`;
    const bankEl = document.getElementById('selBank');
    bankEl.innerText = `RM ${balance}M`;
    
    // Visual Feedback for Low Balance
    if (balance < 0) bankEl.style.color = "#D21034"; // Red if negative
    else bankEl.style.color = "#0E1E5B";

    // REMOVED: .counter-box update (Since we deleted that HTML element)
    
    // Validate Complete Squad
    const btn = document.getElementById('confirmSquadBtn');
    const isValid = count === 15 && cost <= 100;
    
    btn.disabled = !isValid;
    btn.style.opacity = isValid ? "1" : "0.5";
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

// NEW: Reset Button Logic
document.getElementById('resetBtn').addEventListener('click', () => {
    if(selectedSquadIds.size === 0) return;
    if(confirm("Reset all selections?")) {
        selectedSquadIds.clear();
        updateFooterStats();
        updatePitchView();
        showToast("Squad cleared.", "success");
    }
});

// --- MARKET & PITCH LOGIC ---
const marketModal = document.getElementById('market-modal');
const marketList = document.getElementById('market-list');
const actionModal = document.getElementById('action-modal');
let activePlayerObj = null; // Track who we are viewing

document.getElementById('closeMarketBtn').addEventListener('click', () => marketModal.classList.add('hidden'));
document.getElementById('closeActionBtn').addEventListener('click', () => actionModal.classList.add('hidden'));

// 1. OPEN MARKET (For Empty Slots)
function openMarket(position) {
    marketModal.classList.remove('hidden');
    document.getElementById('marketTitle').innerText = `Select ${position}`;
    marketList.innerHTML = '';

    const candidates = M_LEAGUE_PLAYERS.filter(p => p.pos === position);

    candidates.forEach(player => {
        const isSelected = selectedSquadIds.has(player.id);
        const row = document.createElement('div');
        row.className = 'market-row';
        row.innerHTML = `
            <div class="market-info">
                <h4>${player.name}</h4>
                <span>${player.team}</span>
                <span class="market-price">RM ${player.price}M</span>
            </div>
            ${isSelected 
                ? `<button class="btn-select" style="background:#ccc" disabled>Selected</button>` 
                : `<button class="btn-select" onclick="selectPlayerFromMarket(${player.id})">Add</button>`
            }
        `;
        marketList.appendChild(row);
    });
}

// 2. OPEN ACTION MODAL (For Filled Slots)
function openPlayerActionModal(player) {
    activePlayerObj = player;
    actionModal.classList.remove('hidden');
    
    // Populate Modal
    document.getElementById('actionName').innerText = player.name;
    // Use innerHTML and &bull; to prevent encoding errors (?)
    document.getElementById('actionInfo').innerHTML = `${player.pos} &bull; ${player.team} &bull; RM ${player.price}M`;
    document.getElementById('actionKit').src = TEAM_KITS[player.team] || 'assets/kits/default.png';
}

// 3. REMOVE PLAYER
document.getElementById('btnRemove').addEventListener('click', () => {
    if(!activePlayerObj) return;
    selectedSquadIds.delete(activePlayerObj.id);
    updateFooterStats();
    updatePitchView();
    actionModal.classList.add('hidden');
    showToast("Player removed.", "success");
});

// 4. REPLACE PLAYER (Remove + Open Market)
document.getElementById('btnReplace').addEventListener('click', () => {
     if(!activePlayerObj) return;
     const pos = activePlayerObj.pos;
     selectedSquadIds.delete(activePlayerObj.id);
     updateFooterStats();
     
     actionModal.classList.add('hidden');
     openMarket(pos); // Immediate Swap
});

window.selectPlayerFromMarket = (id) => {
    const player = M_LEAGUE_PLAYERS.find(p => p.id === id);
    if (!selectedSquadIds.has(id)) {
        const dummyCard = document.createElement('div'); 
        togglePlayer(id, dummyCard);
        if (selectedSquadIds.has(id)) {
            marketModal.classList.add('hidden');
        }
    }
};

// HELPER: Find Next Opponent
function getNextOpponent(myTeam) {
    const match = FIXTURES.find(m => m.home === myTeam || m.away === myTeam);
    if (!match) return "-"; 
    if (match.home === myTeam) return match.away + " (H)"; 
    return match.home + " (A)"; 
}

function updatePitchView() {
    const squad = Array.from(selectedSquadIds).map(sid => M_LEAGUE_PLAYERS.find(p => p.id === sid));
    
    const structure = {
        'GK': { count: 2, el: document.getElementById('row-GK') },
        'DEF': { count: 5, el: document.getElementById('row-DEF') },
        'MID': { count: 5, el: document.getElementById('row-MID') },
        'FWD': { count: 3, el: document.getElementById('row-FWD') }
    };

    Object.keys(structure).forEach(pos => {
        const rowData = structure[pos];
        const playersInPos = squad.filter(p => p.pos === pos);
        rowData.el.innerHTML = '';

        for (let i = 0; i < rowData.count; i++) {
            const slot = document.createElement('div');
            const player = playersInPos[i];
            
            // Logic Change: Different Click Actions
            if (player) {
                // FILLED -> Open Profile
                slot.onclick = () => openPlayerActionModal(player);
                slot.className = 'pitch-slot filled';
                slot.style.cursor = "pointer";
                slot.innerHTML = `
                    <div class="slot-price">RM ${player.price}M</div>
                    <img src="${TEAM_KITS[player.team] || 'assets/kits/default.png'}" class="slot-kit" loading="lazy" width="50" height="50" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1865/1865147.png'">
                    <div class="slot-name">${player.name.split(' ').pop()}</div>
                    <div class="slot-fix ${getNextOpponent(player.team).includes('(H)') ? 'home' : 'away'}">
                        ${getNextOpponent(player.team)}
                    </div>
                `;
            } else {
                // EMPTY -> Open Market
                slot.onclick = () => openMarket(pos);
                slot.className = 'pitch-slot';
                slot.style.cursor = "pointer";
                slot.innerHTML = `<span>${pos}</span><span style="font-size:1.2rem;">+</span>`;
            }
            rowData.el.appendChild(slot);
        }
    });
}
