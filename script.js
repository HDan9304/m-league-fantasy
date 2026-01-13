document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // 1. Toggle Password Visibility
    // This is crucial for mobile users who might mistype on small screens
    togglePasswordBtn.addEventListener('click', () => {
        // Check current type
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Update button text
        togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
    });

    // --- NEW: Toggle between Login and Register ---
    const toggleFormBtn = document.getElementById('toggleFormBtn');
    const footerText = document.getElementById('footerText');
    const registerForm = document.getElementById('registerForm');
    
    toggleFormBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check which form is currently hidden
        const isLoginVisible = !loginForm.classList.contains('hidden');

        if (isLoginVisible) {
            // Switch to Register
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            footerText.textContent = "Already have a team?";
            toggleFormBtn.textContent = "Back to Login";
        } else {
            // Switch back to Login
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            footerText.textContent = "Don't have a team yet?";
            toggleFormBtn.textContent = "Register for Season 2026";
        }
    });

    // 2. Handle LOGIN Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('.btn-primary');

        try {
            submitBtn.textContent = 'Verifying...';
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Welcome back, Manager ${data.manager}!`);
                // Redirect to dashboard here
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert("Server connection failed");
        } finally {
            submitBtn.textContent = 'Masuk / Login';
        }
    });

    // 3. Handle REGISTER Submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('reg-email').value;
        const managerName = document.getElementById('reg-manager').value;
        const teamName = document.getElementById('reg-team').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, managerName, teamName, password })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                // Switch back to login view automatically
                toggleFormBtn.click();
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Registration failed");
        }
    });
});
