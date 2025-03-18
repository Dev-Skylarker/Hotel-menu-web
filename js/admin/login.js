/**
 * Admin Login JavaScript for Kenyan Delights Restaurant
 */

// DOM Elements
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('login-error');
const togglePassword = document.querySelector('.toggle-password');

/**
 * Initialize the login page
 */
function initLoginPage() {
    // Check if user is already logged in
    if (authManager.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Clear previous error
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    // Validate inputs
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    // Try to login
    try {
        const success = authManager.login(username, password);
        
        if (success) {
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            showError('Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye');
    }
}

// Initialize login page
document.addEventListener('DOMContentLoaded', initLoginPage);
