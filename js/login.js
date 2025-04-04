/**
 * Login Script for Campus Cafe
 * Handles user login and authentication
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the login page
    initLoginPage();
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordField = document.getElementById(targetId);
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
});

/**
 * Initialize the login page
 */
function initLoginPage() {
    // Check if already logged in
    const userData = localStorage.getItem('campus_cafe_user');
    if (userData) {
        // User is already logged in, redirect to appropriate page
        console.log('User already logged in, redirecting');
        
        // Check if there's a specific redirect URL stored
        const redirectUrl = localStorage.getItem('redirect_after_login');
        
        if (redirectUrl) {
            localStorage.removeItem('redirect_after_login');
            window.location.href = redirectUrl;
        } else {
            // Otherwise go to index
            window.location.href = 'index.html';
        }
        return;
    }
    
    // Add event listeners
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submission event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    // Clear previous error
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }
    
    // Get form data
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showLoginError('Please fill in all fields');
        return;
    }
    
    // Disable the login button to prevent multiple submissions
    const submitButton = document.querySelector('#login-form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    }
    
    try {
        let loginSuccess = false;
        
        // Try using Supabase authentication if available
        if (typeof supabaseManager !== 'undefined' && supabaseManager) {
            console.log('Using Supabase authentication');
            try {
                const { data, error } = await supabaseManager.signIn(email, password);
                
                if (error) {
                    showLoginError(error.message || 'Login failed. Please check your credentials.');
                    resetLoginButton(submitButton);
                    return;
                }
                
                // Login successful
                loginSuccess = true;
                
                // Show success notification
                if (typeof showToast === 'function') {
                    showToast('Login successful!', 'success');
                }
            } catch (supabaseError) {
                console.error('Supabase login error:', supabaseError);
                // Fall back to localStorage if Supabase fails
            }
        }
        
        // Fallback to localStorage if not already logged in
        if (!loginSuccess) {
            console.log('Using localStorage authentication');
            const usersData = localStorage.getItem('campus_cafe_users');
            const users = usersData ? JSON.parse(usersData) : [];
            
            // Find user by email (case-insensitive) and exact password
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password
            );
            
            if (!user) {
                showLoginError('Invalid email or password');
                resetLoginButton(submitButton);
                return;
            }
            
            // Store current user in localStorage
            const currentUser = {
                email: user.email,
                user_metadata: {
                    name: user.name,
                    admissionNumber: user.admissionNumber
                },
                role: user.role || 'user' // Default role is 'user'
            };
            
            localStorage.setItem('campus_cafe_user', JSON.stringify(currentUser));
            loginSuccess = true;
            
            // Show success notification
            if (typeof showToast === 'function') {
                showToast('Login successful!', 'success');
            }
        }
        
        if (loginSuccess) {
            // Check if there's a redirect URL saved
            const redirectUrl = localStorage.getItem('redirect_after_login');
            
            // Determine where to redirect
            let targetUrl = 'index.html';
            
            if (redirectUrl) {
                localStorage.removeItem('redirect_after_login'); // Clear the stored URL
                targetUrl = redirectUrl;
            }
            
            // Add a slight delay for the success message to be seen
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('An error occurred during login. Please try again.');
        resetLoginButton(submitButton);
    }
}

/**
 * Reset login button to initial state
 * @param {HTMLElement} button - The login button
 */
function resetLoginButton(button) {
    if (button) {
        button.disabled = false;
        button.innerHTML = 'Login';
    }
}

/**
 * Show login error message
 * @param {string} message - Error message to display
 */
function showLoginError(message) {
    const loginError = document.getElementById('login-error');
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        
        // Shake the error message for visual feedback
        loginError.classList.add('shake');
        setTimeout(() => {
            loginError.classList.remove('shake');
        }, 500);
    }
} 