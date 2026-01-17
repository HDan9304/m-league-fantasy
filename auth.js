// Firebase SDK Integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Google Sign-In with Firebase (Improved with Error Handling)
const customBtn = document.getElementById('customGoogleBtn');
if (customBtn) {
    customBtn.onclick = async () => {
        const provider = new GoogleAuthProvider();
        // Force account selection to avoid auto-sign-in loops
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Logged in:", result.user.displayName);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error("Auth Error:", error.code);
            if (error.code === 'auth/popup-blocked') {
                alert("Please enable popups for this site or try again.");
            } else if (error.code === 'auth/cancelled-popup-request') {
                // User closed the popup, no action needed
            } else {
                alert("Login failed: " + error.message);
            }
        }
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

// Global Session Listener (Fetches Manager Profile)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
        
        // Fetch user document from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const teamEl = document.getElementById('displayTeamName');
            const mgrEl = document.getElementById('displayMgrName');
            
            if (teamEl && mgrEl) {
                teamEl.innerText = userData.teamName;
                mgrEl.innerText = userData.managerName;
            }
            
            // Reveal dashboard content only after data is loaded
            document.getElementById('dashboardContent').style.visibility = 'visible';
        } else {
            // No profile found: Show the modal for Google/New users
            const modal = document.getElementById('googleProfileModal');
            if (modal) modal.style.display = 'flex';
        }

        // --- Dynamic Deadline Logic (Improved Firestore Sync) ---
        let targetDeadline = 0;
        const timerEl = document.getElementById('countdownTimer');
        const gwEl = document.getElementById('deadlineGW');

        if (timerEl) timerEl.innerText = "SYNCING..."; // Provide feedback while loading

        onSnapshot(doc(db, "settings", "leagueStatus"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.deadline) {
                    // Automatically detects if deadline is a Timestamp object or a Date String
                    targetDeadline = data.deadline.toDate ? data.deadline.toDate().getTime() : new Date(data.deadline).getTime();
                }
                if (gwEl && data.gw) gwEl.innerText = data.gw;
                updateTimer(); // Trigger immediate update so it doesn't wait 1 second
            }
        }, (err) => console.error("Deadline Sync Error:", err));
        
        const updateTimer = () => {
            if (!targetDeadline || isNaN(targetDeadline)) return;
            
            const now = new Date().getTime();
            const distance = targetDeadline - now;

            if (timerEl) {
                if (distance < 0) {
                    timerEl.innerHTML = "DEADLINE PASSED";
                    return;
                }

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                timerEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        };

        setInterval(updateTimer, 1000);
    }
});

// --- Floating Nav Bubble Logic ---
const initNav = () => {
    const nav = document.querySelector('.floating-nav');
    const indicator = document.querySelector('.nav-indicator');
    const items = document.querySelectorAll('.nav-item');

    const updateIndicator = (el) => {
        items.forEach(item => item.classList.remove('active'));
        el.classList.add('active');

        // Normalized Toggle View Logic (Home vs Profile)
        const label = el.querySelector('.nav-label').innerText.trim().toLowerCase(); // Normalize for CSS transforms
        const homeView = document.getElementById('homeView');
        const profileView = document.getElementById('profileView');
        
        if (homeView && profileView) {
            if (label === 'home') {
                homeView.style.display = 'block';
                profileView.style.display = 'none';
            } else if (label === 'profile') {
                homeView.style.display = 'none';
                profileView.style.display = 'block';
            } else {
                // Hide current views if tabs without content (Squad, Transfer, etc.) are clicked
                homeView.style.display = 'none';
                profileView.style.display = 'none';
            }
        }
        
        const index = Array.from(items).indexOf(el);
        
        // Refined fit: Accounts for the 8px side padding (16px total) for a perfect "nearly-fit"
        indicator.style.width = `calc((100% - 16px) / 5)`;
        indicator.style.left = `calc(8px + (${index} * (100% - 16px) / 5))`;
    };

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            updateIndicator(item);
        });
    });

    // Initialize bubble position on page load
    const active = document.querySelector('.nav-item.active');
    if (active) setTimeout(() => updateIndicator(active), 150);
};

if (document.querySelector('.floating-nav')) initNav();

// --- Logout Action Logic ---
document.addEventListener('click', (e) => {
    // Target the logout button by ID or its children
    if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
        const auth = getAuth();
        signOut(auth).then(() => {
            window.location.href = 'index.html'; // Redirect to login screen
        }).catch((error) => alert("Logout failed: " + error.message));
    }
});

// --- Handle New Profile Submission ---
const googleProfileForm = document.getElementById('googleProfileForm');
if (googleProfileForm) {
    googleProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const managerName = document.getElementById('newMgrName').value;
        const teamName = document.getElementById('newTeamName').value;

        try {
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                managerName: managerName,
                teamName: teamName,
                email: user.email,
                createdAt: new Date()
            });

            // Update dashboard UI immediately
            document.getElementById('displayTeamName').innerText = teamName;
            document.getElementById('displayMgrName').innerText = managerName;
            document.getElementById('googleProfileModal').style.display = 'none'; // Hide modal
            
            // Reveal dashboard content now that setup is complete
            document.getElementById('dashboardContent').style.visibility = 'visible';
        } catch (error) {
            alert("Error saving profile: " + error.message);
        }
    });
}