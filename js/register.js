/**
 * Registration Script for Campus Cafe
 * Handles user registration and account creation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the registration page
    initRegisterPage();
    
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
 * Initialize the registration page
 */
function initRegisterPage() {
    // Check if already logged in
    const userData = localStorage.getItem('campus_cafe_user');
    if (userData) {
        // User is already logged in, redirect to index page
        console.log('User already logged in, redirecting to index');
        window.location.href = 'index.html';
        return;
    }
    
    // Add event listeners
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submission event
 */
async function handleRegister(e) {
    e.preventDefault();
    
    // Clear previous messages
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');
    
    if (registerError) {
        registerError.textContent = '';
        registerError.style.display = 'none';
    }
    
    if (registerSuccess) {
        registerSuccess.textContent = '';
        registerSuccess.style.display = 'none';
    }
    
    // Get form data
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const admissionNumber = document.getElementById('register-admission').value.trim();
    
    // Validate form data
    if (!name || !email || !password || !confirmPassword || !admissionNumber) {
        showRegisterError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showRegisterError('Passwords do not match');
        return;
    }
    
    if (password.length < 8) {
        showRegisterError('Password must be at least 8 characters long');
        return;
    }
    
    if (!/^\d{5}$/.test(admissionNumber)) {
        showRegisterError('Admission number must be exactly 5 digits');
        return;
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showRegisterError('Please enter a valid email address');
        return;
    }
    
    // Disable the register button to prevent multiple submissions
    const submitButton = document.querySelector('#register-form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    }
    
    try {
        let registrationSuccess = false;
        
        // Try using Supabase registration if available
        if (typeof supabaseManager !== 'undefined' && supabaseManager) {
            console.log('Using Supabase registration');
            try {
                const { data, error } = await supabaseManager.signUp(email, password, {
                    name: name,
                    admissionNumber: admissionNumber
                });
                
                if (error) {
                    showRegisterError(error.message || 'Registration failed.');
                    resetRegisterButton(submitButton);
                    return;
                }
                
                // Registration successful with Supabase
                registrationSuccess = true;
                console.log('Registration successful with Supabase:', data);
                
                // Show success notification
                showRegisterSuccess('Registration successful! You can now log in.');
                
                // Reset form
                document.getElementById('register-form').reset();
            } catch (supabaseError) {
                console.error('Supabase registration error:', supabaseError);
                // Fall back to localStorage if Supabase fails
            }
        }
        
        // Fallback to localStorage if not already registered
        if (!registrationSuccess) {
            console.log('Using localStorage registration');
            const usersData = localStorage.getItem('campus_cafe_users');
            const users = usersData ? JSON.parse(usersData) : [];
            
            // Check if email already exists (case-insensitive)
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                showRegisterError('Email already registered');
                resetRegisterButton(submitButton);
                return;
            }
            
            // Check if admission number already exists
            if (users.some(u => u.admissionNumber === admissionNumber)) {
                showRegisterError('Admission number already registered');
                resetRegisterButton(submitButton);
                return;
            }
            
            // Add new user
            const newUser = {
                name,
                email,
                password,
                admissionNumber,
                role: 'user', // Default role is 'user'
                registeredAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('campus_cafe_users', JSON.stringify(users));
            
            // Registration successful
            registrationSuccess = true;
            showRegisterSuccess('Registration successful! You can now log in.');
            
            // Reset form
            document.getElementById('register-form').reset();
        }
        
        // Reset button
        resetRegisterButton(submitButton);
        
        if (registrationSuccess) {
            // Show toast notification
            if (typeof showToast === 'function') {
                showToast('Account created successfully!', 'success');
            }
            
            // Redirect to login page after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showRegisterError('An error occurred during registration. Please try again.');
        resetRegisterButton(submitButton);
    }
}

/**
 * Reset register button to initial state
 * @param {HTMLElement} button - The register button
 */
function resetRegisterButton(button) {
    if (button) {
        button.disabled = false;
        button.innerHTML = 'Create Account';
    }
}

/**
 * Show registration error message
 * @param {string} message - Error message to display
 */
function showRegisterError(message) {
    const registerError = document.getElementById('register-error');
    if (registerError) {
        registerError.textContent = message;
        registerError.style.display = 'block';
        
        // Shake the error message for visual feedback
        registerError.classList.add('shake');
        setTimeout(() => {
            registerError.classList.remove('shake');
        }, 500);
        
        // Scroll to error message
        registerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Show registration success message
 * @param {string} message - Success message to display
 */
function showRegisterSuccess(message) {
    const registerSuccess = document.getElementById('register-success');
    if (registerSuccess) {
        registerSuccess.textContent = message;
        registerSuccess.style.display = 'block';
        
        // Scroll to success message
        registerSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
} 