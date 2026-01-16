// Initialize Google Sign-In
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "301677140666-eekdcu7mb474808h0jcvv6seha2gs7v8.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });

    // Custom Button Click Handler
    const customBtn = document.getElementById('customGoogleBtn');
    if (customBtn) {
        customBtn.onclick = () => {
            // This forces the standard Google Login selector to appear
            // bypassing any "One Tap" suppression logic
            const client = google.accounts.oauth2.initCodeClient({
                client_id: '301677140666-eekdcu7mb474808h0jcvv6seha2gs7v8.apps.googleusercontent.com',
                scope: 'openid email profile',
                ux_mode: 'popup',
                callback: (response) => {
                    console.log("Google Auth Code:", response.code);
                    // Handle the auth code here
                },
            });
            client.requestCode();
        };
    }
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