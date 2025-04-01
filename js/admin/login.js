/**
 * Admin Login JavaScript for Campus Cafe
 */

// DOM Elements
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('login-error');
const togglePassword = document.querySelector('.toggle-password');

// Track failed login attempts
let failedAttempts = parseInt(sessionStorage.getItem('admin_failed_attempts') || '0');

/**
 * Initialize the login page
 */
function initLoginPage() {
    // Always require login for security, so logout any existing session
    authManager.logout();
    
    // Debug localStorage
    console.log('LocalStorage state:', {
        'campus_cafe_users': JSON.parse(localStorage.getItem('campus_cafe_users') || '[]'),
        'users': JSON.parse(localStorage.getItem('users') || '[]'),
        'admin_password_manager': localStorage.getItem('admin_password_manager')
    });
    
    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // Set default admin email for easy login during development
    if (document.getElementById('email') && envConfig && envConfig.development) {
        document.getElementById('email').value = 'Erickaris0521@gmail.com';
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    // Check if too many failed attempts
    if (failedAttempts >= 2) {
        showError('Sorry, this is for admin use only. Seek admin help through the contact details provided or visit ICT rooms.', true);
        return;
    }
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const normalizedEmail = email.toLowerCase(); // Normalize email for consistent comparison
    const password = document.getElementById('password').value.trim();
    
    console.log('Login attempt:', { email, passwordLength: password.length });
    
    // Clear previous error
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    // Disable login button to prevent multiple submissions
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Logging in...';
    }
    
    // Validate inputs
    if (!email || !password) {
        showError('Please enter both email and password');
        resetLoginButton(loginButton);
        return;
    }
    
    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
        showError('Please enter a valid email address');
        resetLoginButton(loginButton);
        return;
    }
    
    // Make sure Eric exists as superadmin before login attempt
    ensureSuperAdmin();

    // Special direct bypass for Eric with exact password match
    // This ensures the primary admin can always log in
    if (normalizedEmail === 'erickaris0521@gmail.com' && password === 'Project123') {
        console.log('Super admin direct login bypass');
        
        // Reset failed attempts
        failedAttempts = 0;
        sessionStorage.setItem('admin_failed_attempts', '0');
        
        // Show success message briefly
        showSuccess('Login successful! Redirecting to dashboard...');
        
        // Create session for super admin
        const superAdmin = {
            email: 'Erickaris0521@gmail.com',
            role: 'superadmin'
        };
        authManager.createSession(superAdmin);
        
        // Add animation effect
        document.body.style.opacity = '0.8';
        document.body.style.transition = 'opacity 0.5s ease';
        
        // Redirect to dashboard after short delay for animation
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
        
        return;
    }
    
    // Try to login
    try {
        const success = authManager.login(email, password);
        
        if (success) {
            console.log('Login successful, redirecting to dashboard');
            
            // Reset failed attempts on successful login
            failedAttempts = 0;
            sessionStorage.setItem('admin_failed_attempts', '0');
            
            // Show success message briefly
            showSuccess('Login successful! Redirecting to dashboard...');
            
            // Add animation effect
            document.body.style.opacity = '0.8';
            document.body.style.transition = 'opacity 0.5s ease';
            
            // Get current user to determine redirect based on role
            const currentUser = authManager.getCurrentUser();
            console.log('Current user for redirect:', currentUser);
            
            let dashboardUrl = 'dashboard.html'; // Default dashboard
            
            // Redirect based on user role
            if (currentUser && currentUser.role === 'superadmin') {
                dashboardUrl = 'dashboard.html'; // Super admin dashboard - full access
                console.log('Redirecting to superadmin dashboard');
            } else if (currentUser && currentUser.role === 'admin') {
                dashboardUrl = 'dashboard.html?mode=limited'; // Regular admin dashboard with limited access
                console.log('Redirecting to limited admin dashboard');
            }
            
            // Redirect to appropriate dashboard after short delay for animation
            setTimeout(() => {
                window.location.href = dashboardUrl;
            }, 800);
        } else {
            console.warn('Login failed for:', email);
            resetLoginButton(loginButton);
            
            // Special handling for Eric's account
            if (normalizedEmail === 'erickaris0521@gmail.com') {
                showError('Invalid password for primary admin account. The password should be exactly "Project123".');
                
                // Don't count failed attempts for the main admin account hint
                if (failedAttempts === 0) {
                    // Only increment on second attempt
                    failedAttempts++;
                    sessionStorage.setItem('admin_failed_attempts', failedAttempts.toString());
                }
            } else {
                // Increment failed attempts for non-Eric accounts
                failedAttempts++;
                sessionStorage.setItem('admin_failed_attempts', failedAttempts.toString());
                
                // Show error message based on attempt count
                if (failedAttempts >= 2) {
                    showError('Sorry, this is for admin use only. Seek admin help through the contact details provided or visit ICT rooms.', true);
                } else {
                    showError(`Invalid email or password. ${2 - failedAttempts} attempt${2 - failedAttempts !== 1 ? 's' : ''} remaining.`);
                }
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        resetLoginButton(loginButton);
    }
}

/**
 * Reset login button to initial state
 * @param {HTMLElement} button - The login button
 */
function resetLoginButton(button) {
    if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

/**
 * Ensure superadmin exists
 */
function ensureSuperAdmin() {
    const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
    const superAdminEmail = 'Erickaris0521@gmail.com';
    
    // Check if Eric exists (case-insensitive)
    let ericUser = users.find(u => u.email.toLowerCase() === superAdminEmail.toLowerCase());
    
    if (!ericUser) {
        // Add Eric as superadmin with Project123 password
        ericUser = {
            email: superAdminEmail, // Always use the proper case for the email
            // This hash value corresponds to 'Project123' using our simple hash function
            passwordHash: 'bd5c890673', 
            role: 'superadmin'
        };
        users.push(ericUser);
        localStorage.setItem('campus_cafe_users', JSON.stringify(users));
        console.log('Added superadmin to campus_cafe_users');
    } else {
        // Make sure Eric has the right role and password
        ericUser.role = 'superadmin';
        
        // Only update passwordHash if it's not already set to Project123 hash
        if (ericUser.passwordHash !== 'bd5c890673') {
            ericUser.passwordHash = 'bd5c890673'; // Project123 hash
            localStorage.setItem('campus_cafe_users', JSON.stringify(users));
            console.log('Updated superadmin credentials');
        }
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {boolean} showContactButton - Whether to show contact button
 */
function showError(message, showContactButton = false) {
    if (errorMessage) {
        errorMessage.className = 'error-message';
        
        // Create message content
        if (showContactButton) {
            errorMessage.innerHTML = `
                ${message}
                <div style="margin-top: 10px;">
                    <a href="../contact.html" class="btn btn-small btn-secondary" style="background: white; color: var(--primary-color);">
                        <i class="fas fa-headset"></i> Contact Support
                    </a>
                </div>
            `;
        } else {
            errorMessage.textContent = message;
        }
        
        errorMessage.style.display = 'block';
        
        // Add animation
        errorMessage.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
        setTimeout(() => {
            errorMessage.style.animation = '';
        }, 500);
    }
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    if (errorMessage) {
        errorMessage.className = 'success-message';
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
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
}

/**
 * Debug login issues
 */
function debugLogin() {
    console.log('Debugging login process...');
    
    // Check localStorage for users
    const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
    console.log('Found users in localStorage:', users.length);
    
    // Check localStorage for password manager
    const passwordManager = localStorage.getItem('admin_password_manager');
    console.log('Password manager exists:', !!passwordManager);
    
    // Check if super admin exists
    const superAdmin = users.find(u => u.email.toLowerCase() === 'erickaris0521@gmail.com');
    console.log('Eric super admin exists:', !!superAdmin);
    
    if (superAdmin) {
        // Log details about super admin
        console.log('Super admin details:', {
            email: superAdmin.email,
            role: superAdmin.role,
            passwordHashLength: (superAdmin.passwordHash || '').length
        });
    }
    
    // Create debug information div on page in development mode
    if (envConfig && envConfig.development) {
        const debugInfoDiv = document.createElement('div');
        debugInfoDiv.id = 'admin-debug-info';
        debugInfoDiv.style.margin = '20px auto';
        debugInfoDiv.style.maxWidth = '500px';
        debugInfoDiv.style.padding = '15px';
        debugInfoDiv.style.borderRadius = '5px';
        debugInfoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        debugInfoDiv.style.color = 'var(--text-color)';
        debugInfoDiv.style.fontSize = '14px';
        
        // Check if environment is correctly set
        debugInfoDiv.innerHTML = `
            <h3 style="margin-top: 0; color: var(--primary-color);">Login Debug Information</h3>
            <ul style="list-style-type: none; padding-left: 0;">
                <li>🔑 Eric user exists: <strong>${!!superAdmin}</strong></li>
                <li>📧 <span style="color: #4CAF50;">CORRECT EMAIL:</span> <strong>Erickaris0521@gmail.com</strong></li>
                <li>🔒 <span style="color: #4CAF50;">PASSWORD:</span> <strong>********</strong> (provided to admins only)</li>
                <li>👥 Total users: <strong>${users.length}</strong></li>
                <li>⚙️ Environment: <strong>${envConfig.development ? 'Development' : 'Production'}</strong></li>
            </ul>
            <p style="margin: 10px 0; font-weight: bold; color: #F44336;">Note: For security reasons, contact ICT support if you need the password.</p>
            <p style="margin-bottom: 0;">Any login issues? Contact support through the Contact Support link.</p>
        `;
        
        // Add to page
        if (!document.getElementById('admin-debug-info')) {
            document.body.appendChild(debugInfoDiv);
        }
    }
    
    // Ensure super admin exists
    ensureSuperAdmin();
}

// Initialize login page
document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
    debugLogin();
});
