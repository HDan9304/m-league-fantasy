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
