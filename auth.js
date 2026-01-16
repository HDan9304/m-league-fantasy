// Initialize Google Sign-In
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "301677140666-eekdcu7mb474808h0jcvv6seha2gs7v8.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById("googleBtnContainer"),
        { theme: "filled_black", size: "large", width: "100%" }
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