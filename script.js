// 1. SELECT ELEMENTS
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');

const displayTeamName = document.getElementById('displayTeamName');
const displayManagerName = document.getElementById('displayManagerName');

// 2. TOGGLE LOGIC
toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        toggleText.innerText = "Don't have a team yet?";
        toggleBtn.innerText = "Register for Season 2026";
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        toggleText.innerText = "Already have a team?";
        toggleBtn.innerText = "Back to Login";
    }
});

// 3. REGISTER
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const manager = document.getElementById('regManager').value;
    const team = document.getElementById('regTeam').value;

    const userData = { pass, manager, team };
    localStorage.setItem(email, JSON.stringify(userData));

    alert("Registration Successful!");
    toggleBtn.click(); // Switch to login
});

// 4. LOGIN
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const storedUser = localStorage.getItem(email);

    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.pass === pass) {
            showDashboard(user);
        } else {
            alert("Incorrect Password");
        }
    } else {
        alert("User not found.");
    }
});

// 5. SHOW DASHBOARD
function showDashboard(user) {
    authScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    
    // Remove the center alignment from body for dashboard view
    document.body.style.display = 'block'; 
    document.body.style.background = '#F0F2F5';

    displayTeamName.innerText = user.team;
    displayManagerName.innerText = user.manager;
}

// 6. LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => {
    location.reload();
});