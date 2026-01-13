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

    // 2. Handle Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload for demo
        
        const email = document.getElementById('email').value;
        const submitBtn = document.querySelector('.btn-primary');

        // Simulate loading state (Professional touch)
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.style.opacity = '0.7';

        setTimeout(() => {
            alert(`Welcome back to M-League Fantasy, Manager!\nLogin attempt for: ${email}`);
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
        }, 1500);
    });
});
