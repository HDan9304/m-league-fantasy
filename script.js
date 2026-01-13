// DOM Elements
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleBtn = document.getElementById('toggleBtn');

// Toggle Login/Register
toggleBtn.addEventListener('click', () => {
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        toggleBtn.innerText = "Don't have a team? Register here";
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        toggleBtn.innerText = "Back to Login";
    }
});

// Handle Register (Save to LocalStorage)
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const manager = document.getElementById('regManager').value;
    const team = document.getElementById('regTeam').value;

    const userData = { pass, manager, team };
    localStorage.setItem(email, JSON.stringify(userData));
    alert("Success! Please Login.");
    toggleBtn.click(); // Switch to login
});

// Handle Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const storedUser = localStorage.getItem(email);

    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.pass === pass) {
            // Login Success
            loadDashboard(user);
        } else {
            alert("Wrong Password");
        }
    } else {
        alert("User not found");
    }
});

function loadDashboard(user) {
    authScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    document.body.style.backgroundColor = "#F4F5F7"; // Change bg color
    document.getElementById('displayTeamName').innerText = user.team;
    document.getElementById('displayManagerName').innerText = user.manager;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    location.reload();
});
