// Initialize Google Sign-In
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "301677140666-eekdcu7mb474808h0jcvv6seha2gs7v8.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtnContainer"),
        { theme: "filled_black", size: "large", width: "100%", shape: "pill", text: "signin_with" }
    );
};

// Handle Google Response
function handleGoogleLogin(response) {
    console.log("Google JWT Token:", response.credential);
    // Future step: Send to backend
}

// Handle Email Form
document.getElementById('emailLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    console.log("Email login attempt:", email);
    alert("Login link sent to: " + email);
});

// --- DATA RESTORATION LOGIC ---

// Save Data (Registration)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const userData = {
            managerName: document.getElementById('mgrName').value,
            teamName: document.getElementById('teamName').value,
            email: document.getElementById('regEmail').value
        };
        
        // Restore/Save to LocalStorage
        localStorage.setItem('mLeagueUser', JSON.stringify(userData));
        alert("Account Created! Welcome to M-League Fantasy.");
        window.location.href = 'index.html'; // Redirect to login
    });
}

// Check for existing session on load
function checkSession() {
    const savedUser = localStorage.getItem('mLeagueUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log("Restored User Session:", user.teamName);
        // In the future, redirect directly to Dashboard here
    }
}
checkSession();