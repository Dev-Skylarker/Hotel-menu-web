/**
 * Admin Configuration Manager for Campus Cafe
 * Allows admins to manage credentials in both development and production environments
 */

// DOM Elements
const adminForm = document.getElementById('admin-form');
const adminList = document.getElementById('admin-list');
const adminTable = document.getElementById('admin-table');
const adminCountEl = document.getElementById('admin-count');
const errorMessage = document.getElementById('config-error');
const successMessage = document.getElementById('config-success');
const logoutBtn = document.getElementById('logout-btn');
const adminBadge = document.getElementById('admin-badge');

/**
 * Initialize the system with default password for the superadmin if it doesn't exist
 */
function initSuperAdminPassword() {
    const superAdminEmail = 'Erickaris0521@gmail.com';
    let passwordManager = JSON.parse(localStorage.getItem('admin_password_manager') || '{}');
    
    // Check if the superadmin has a password in the password manager
    if (!passwordManager[superAdminEmail]) {
        // Set the default password to Project123
        passwordManager[superAdminEmail] = 'Project123';
        localStorage.setItem('admin_password_manager', JSON.stringify(passwordManager));
        console.log('Initialized superadmin password to Project123');
    }
}

/**
 * Handle logout button click
 * @param {Event} e - Click event
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Add a fade-out effect to the body
    document.body.style.opacity = '0.5';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Log the user out
    authManager.logout();
    
    // Redirect to login page after a short delay for the animation
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

/**
 * Initialize the configuration page
 */
function initConfigPage() {
    // Check if user is logged in
    if (!authManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Ensure default admin is in password manager
    initSuperAdminPassword();
    
    // Check if current user is superadmin (Eric)
    const isSuperAdmin = authManager.isSuperAdmin();
    const currentUser = authManager.getCurrentUser();
    
    // Show/hide primary admin badge
    if (adminBadge) {
        if (isSuperAdmin) {
            adminBadge.style.display = 'inline-block';
        } else {
            adminBadge.style.display = 'none';
        }
    }
    
    // Show/hide admin form based on permissions
    if (adminForm) {
        if (isSuperAdmin) {
            // Show admin form to superadmin
            adminForm.style.display = 'block';
        adminForm.addEventListener('submit', handleAdminSubmit);
        } else {
            // Hide admin form from regular admins
            adminForm.style.display = 'none';
            
            // Show permission message
            const permissionMessage = document.createElement('div');
            permissionMessage.className = 'form-info';
            permissionMessage.innerHTML = '<strong>Note:</strong> Only the primary administrator (Eric) can add new admin accounts.';
            adminForm.parentNode.insertBefore(permissionMessage, adminForm);
        }
    }
    
    // Add logout button event listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Load admin list
    loadAdminList();
    
    // Update admin count
    updateAdminCount();
}

/**
 * Update admin count display
 * @param {number} [count] - Optional count to display
 */
function updateAdminCount(count) {
    if (!adminCountEl) return;
    
    if (count !== undefined) {
        adminCountEl.textContent = count;
        return;
    }
    
    // Calculate count from storage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const secureCredentials = credentialsManager.getCredentials();
    
    // Filter to only include admins
    const adminUsers = storedUsers.filter(user => 
        !user.role || user.role === 'admin' || user.role === 'superadmin'
    );
    
    const adminSecure = secureCredentials.filter(cred => 
        !cred.role || cred.role === 'admin' || cred.role === 'superadmin'
    );
    
    // Set admin count
    adminCountEl.textContent = adminUsers.length + adminSecure.length;
}

/**
 * Check if an admin with the specified email already exists
 * @param {string} email - The email to check
 * @returns {boolean} - True if admin exists, false otherwise
 */
function adminExists(email) {
    // Get existing users
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check secure credentials
    const secureCredentials = credentialsManager.getCredentials();
    
    // Check if admin exists in either stored users or secure credentials
    return storedUsers.some(user => user.email === email) || 
           secureCredentials.some(cred => cred.email === email);
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Hide success message if it's visible
    if (successMessage) successMessage.style.display = 'none';
}

/**
 * Show a success message
 * @param {string} message - The success message to display
 */
function showSuccess(message) {
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
    
    // Hide error message if it's visible
    if (errorMessage) errorMessage.style.display = 'none';
}

/**
 * Clear all messages
 */
function clearMessages() {
    if (errorMessage) errorMessage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
}

/**
 * Generate SHA-256 hash of a string
 * @param {string} str - The string to hash
 * @returns {string} - The hashed string
 */
function sha256(str) {
    // Simple polyfill for environments without crypto
    if (typeof crypto === 'undefined') {
        console.warn('Crypto API not available, using fallback hashing');
        return str; // In production, implement a proper fallback
    }
    
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    // Hash the data
    return crypto.subtle.digest('SHA-256', data)
        .then(buffer => {
            // Convert buffer to byte array
            const array = Array.from(new Uint8Array(buffer));
            
            // Convert bytes to hex string
            return array.map(b => b.toString(16).padStart(2, '0')).join('');
        })
        .catch(error => {
            console.error('Hashing error:', error);
            throw error;
        });
}

// Synchronous version for compatibility
function sha256Sync(str) {
    // This is a simplified implementation for demo purposes
    // In production, use a proper crypto library
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
}

/**
 * Handle admin form submission
 * @param {Event} event - The form submission event
 */
function handleAdminSubmit(event) {
    event.preventDefault();
    
    // Clear any previous messages
    clearMessages();
    
    // Check if current user is superadmin
    if (!authManager.isSuperAdmin()) {
        showError('Only the primary administrator (Eric) can add new admin accounts');
        return;
    }
    
    // Get form inputs
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const currentAdminPassword = document.getElementById('currentAdminPassword').value.trim();
    
    // Validate inputs
    if (!email || !password || !confirmPassword || !currentAdminPassword) {
        showError('All fields are required');
        return;
    }
    
    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Validate password length
    if (password.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Check if admin already exists
    if (adminExists(email)) {
        showError('An admin with this email already exists');
        return;
    }
    
    // Verify current admin credentials
    const currentAdminEmail = authManager.getCurrentUser();
    if (!authManager.login(currentAdminEmail.email, currentAdminPassword)) {
        showError('Current admin password is incorrect');
        return;
    }
    
    try {
        // Store initial password for first-time login
        const initialPassword = password;
        let passwordManager = JSON.parse(localStorage.getItem('admin_password_manager') || '{}');
        passwordManager[email] = initialPassword;
        localStorage.setItem('admin_password_manager', JSON.stringify(passwordManager));
        
        // Add to campus_cafe_users for auth system
        const caffeUsers = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
        caffeUsers.push({
            email: email,
            passwordHash: sha256Sync(password),
            role: 'admin'
        });
        localStorage.setItem('campus_cafe_users', JSON.stringify(caffeUsers));
        
        // Ensure users array exists
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        
        // Add to users in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newAdmin = {
            email: email,
            password: sha256Sync(password),
            role: 'admin' // Default role for new admins
        };
        
        users.push(newAdmin);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Clear form and show success message
        adminForm.reset();
        showSuccess(`Admin ${email} has been added successfully!`);
        
        // Reload admin list
        loadAdminList();
        
        // Update admin count
        updateAdminCount();
        
        // Log success for debugging
        console.log('Admin added successfully');
    } catch (error) {
        console.error('Error adding admin:', error);
        showError('An error occurred while adding the admin. Please try again.');
    }
}

/**
 * Load admin list from storage
 */
function loadAdminList() {
    if (!adminList) return;
    
    adminList.innerHTML = '';
    
    try {
        // Initialize credentials arrays
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const caffeUsers = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
        let secureCredentials = [];
        
        // Check if credentialsManager exists and has getCredentials method
        if (typeof credentialsManager !== 'undefined' && credentialsManager.getCredentials) {
            secureCredentials = credentialsManager.getCredentials();
        }
        
        console.log('Loading admin users:', { storedUsers, caffeUsers, secureCount: secureCredentials.length });
        
        // Combine all sources and filter to only include admins
        const combinedAdmins = [
            ...secureCredentials,
            ...storedUsers,
            ...caffeUsers
        ].filter(user => 
            user && (!user.role || user.role === 'admin' || user.role === 'superadmin')
        );
        
        // Deduplicate by email
        const uniqueAdmins = [];
        const emails = new Set();
        
        combinedAdmins.forEach(admin => {
            if (admin && admin.email && !emails.has(admin.email)) {
                emails.add(admin.email);
                uniqueAdmins.push(admin);
            }
        });
        
        console.log('Unique admins:', uniqueAdmins.length);
        
        // Check if current user is primary admin
        const isSuperAdmin = authManager.isSuperAdmin();
        
        // Add each admin to the list
        uniqueAdmins.forEach((admin, index) => {
            const tr = document.createElement('tr');
            
            // Check if this admin is Eric (the superadmin)
            const isSuperAdminRow = admin.email === 'Erickaris0521@gmail.com';
            // Check if this is the manage@campuscafe account
            const isDefaultAdmin = admin.email === 'manage@campuscafe';
            
            // Only superadmin can see view passwords button, and regular admins can't delete any accounts
            const isCurrentUserSuperAdmin = authManager.isSuperAdmin();
            
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${admin.email}${isSuperAdminRow ? ' <span class="badge">Primary Admin</span>' : ''}</td>
                <td>
                    ${isSuperAdminRow 
                        ? '<span class="badge badge-primary">Primary Admin</span>' 
                        : isDefaultAdmin 
                            ? '<span class="badge badge-secondary">Default Admin</span>'
                            : '<span class="badge badge-info">Custom Admin</span>'}
                </td>
                <td>
                    ${isCurrentUserSuperAdmin && !isSuperAdminRow 
                        ? `<button class="btn btn-sm btn-danger" data-action="delete-admin" data-email="${admin.email}" 
                            ${isDefaultAdmin ? 'data-requires-confirmation="true"' : ''}>
                              <i class="fas fa-trash"></i> Delete
                           </button>` 
                        : ''}
                </td>
            `;
            
            adminList.appendChild(tr);
        });
        
        // Add event listeners to view buttons
        const viewButtons = document.querySelectorAll('.view-password');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const email = e.currentTarget.dataset.email;
                handleViewPassword(email);
            });
        });
        
        // Add event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-admin');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const email = e.currentTarget.dataset.email;
                handleDeleteAdmin(email);
            });
        });
        
        // Update admin count
        updateAdminCount(uniqueAdmins.length);
    } catch (error) {
        console.error('Error loading admin list:', error);
        adminList.innerHTML = '<tr><td colspan="3">Error loading admin list. Please refresh the page.</td></tr>';
    }
}

/**
 * Handle deleting an admin
 * @param {string} email - Email of the admin to delete
 */
function handleDeleteAdmin(email) {
    // Clear any previous messages
    clearMessages();
    
    // Check if current user is superadmin
    if (!authManager.isSuperAdmin()) {
        showError('Only the primary administrator (Eric) can delete admin accounts');
        return;
    }
    
    // Don't allow deleting the primary admin
    if (email === 'Erickaris0521@gmail.com') {
        showError('Cannot delete the primary administrator');
        return;
    }
    
    // Require additional confirmation for deleting manage@campuscafe
    if (email === 'manage@campuscafe') {
        if (!confirm('Warning: You are about to delete the default admin account. Are you sure?')) {
            return;
        }
    }
    
    // Ask for confirmation with email info
    if (!confirm(`Are you sure you want to delete admin ${email}?\nThis action cannot be undone.`)) {
        return;
    }
    
    // Verify current admin credentials with a password prompt
    const currentAdminPassword = prompt('Please enter your admin password to confirm this action:');
    
    if (!currentAdminPassword) {
        // User cancelled the prompt
        return;
    }
    
    const currentAdminEmail = authManager.getCurrentUser();
    if (!authManager.login(currentAdminEmail.email, currentAdminPassword)) {
        showError('Current admin password is incorrect');
        return;
    }
    
    try {
        // Remove from users in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.filter(user => user.email !== email);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Remove from campus_cafe_users for compatibility
        const caffeUsers = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
        const updatedCaffeUsers = caffeUsers.filter(user => user.email !== email);
        localStorage.setItem('campus_cafe_users', JSON.stringify(updatedCaffeUsers));
        
        // Remove from password manager
        let passwordManager = JSON.parse(localStorage.getItem('admin_password_manager') || '{}');
        if (passwordManager[email]) {
            delete passwordManager[email];
            localStorage.setItem('admin_password_manager', JSON.stringify(passwordManager));
        }
    
    // Show success message
        showSuccess(`Admin ${email} deleted successfully`);
    
    // Reload admin list
    loadAdminList();
        
        // Update admin count
        updateAdminCount();
    } catch (error) {
        console.error('Error deleting admin:', error);
        showError('An error occurred while deleting the admin. Please try again.');
    }
}

/**
 * Handles password viewing for admin accounts
 * @param {string} email - Email of the admin to view password for
 */
function handleViewPassword(email) {
    // Only allow superadmin to view passwords
    if (!authManager.isSuperAdmin()) {
        showError('Only the primary admin can view passwords');
        return;
    }

    // Create modal for password verification
    const verifyModal = document.createElement('div');
    verifyModal.className = 'modal';
    verifyModal.style.position = 'fixed';
    verifyModal.style.top = '0';
    verifyModal.style.left = '0';
    verifyModal.style.width = '100%';
    verifyModal.style.height = '100%';
    verifyModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    verifyModal.style.display = 'flex';
    verifyModal.style.alignItems = 'center';
    verifyModal.style.justifyContent = 'center';
    verifyModal.style.zIndex = '1000';

    verifyModal.innerHTML = `
        <div style="background-color: #222; border-radius: 8px; width: 400px; max-width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #444;">
                <h2 style="margin: 0; font-size: 1.5rem; color: #fff;">Password Verification</h2>
                <span class="close-btn" style="font-size: 1.5rem; cursor: pointer; color: #ccc;">&times;</span>
            </div>
            <div style="padding: 20px;">
                <p style="margin-bottom: 20px;">Please enter your admin password to view credentials for <strong>${email}</strong></p>
                <div style="margin-bottom: 20px;">
                    <label for="verify-password" style="display: block; margin-bottom: 8px;">Your Password</label>
                    <input type="password" id="verify-password" placeholder="Enter your password" 
                           style="width: 100%; padding: 10px; background-color: #333; border: 1px solid #444; border-radius: 4px; color: #fff;">
                </div>
                <button id="verify-btn" 
                        style="background-color: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">
                    Verify
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(verifyModal);
    
    // Handle close button
    const closeBtn = verifyModal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        verifyModal.remove();
    });
    
    // Handle verification
    const verifyBtn = verifyModal.querySelector('#verify-btn');
    verifyBtn.addEventListener('click', () => {
        const password = verifyModal.querySelector('#verify-password').value;
        const currentUser = authManager.getCurrentUser();
        
        // Verify admin credentials
        if (authManager.login(currentUser.email, password)) {
            verifyModal.remove();
            showAdminCredentials(email);
        } else {
            alert('Incorrect password');
        }
    });
}

/**
 * Shows admin credentials in a modal
 * @param {string} email - Email of the admin to show credentials for
 */
function showAdminCredentials(email) {
    // Get password from password manager
    let passwordManager = JSON.parse(localStorage.getItem('admin_password_manager') || '{}');
    const password = passwordManager[email] || 'admin123'; // Fallback to default
    
    // Create credentials modal
    const credModal = document.createElement('div');
    credModal.className = 'modal';
    credModal.style.position = 'fixed';
    credModal.style.top = '0';
    credModal.style.left = '0';
    credModal.style.width = '100%';
    credModal.style.height = '100%';
    credModal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    credModal.style.display = 'flex';
    credModal.style.alignItems = 'center';
    credModal.style.justifyContent = 'center';
    credModal.style.zIndex = '1000';

    credModal.innerHTML = `
        <div style="background-color: #222; border-radius: 8px; width: 400px; max-width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #444;">
                <h2 style="margin: 0; font-size: 1.5rem; color: #fff;">Admin Credentials</h2>
                <span class="close-btn" style="font-size: 1.5rem; cursor: pointer; color: #ccc;">&times;</span>
            </div>
            <div style="padding: 20px;">
                <div style="background-color: #333; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 10px 0; display: flex; align-items: center;">
                        <strong>Password:</strong> 
                        <span id="password-display" style="font-family: monospace; letter-spacing: 1px; margin-left: 5px;">••••••••</span>
                        <button id="toggle-password" style="background: none; border: none; color: #28a745; cursor: pointer; padding: 5px; margin-left: 5px;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </p>
                    <p style="margin: 10px 0; color: #aaa; font-style: italic;">Please securely store these credentials.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(credModal);
    
    // Handle close button
    const closeBtn = credModal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        credModal.remove();
    });
    
    // Handle password toggle
    const toggleBtn = credModal.querySelector('#toggle-password');
    const passwordDisplay = credModal.querySelector('#password-display');
    let isPasswordVisible = false;
    
    toggleBtn.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        passwordDisplay.textContent = isPasswordVisible ? password : '••••••••';
        toggleBtn.innerHTML = isPasswordVisible ? 
            '<i class="fas fa-eye-slash"></i>' : 
            '<i class="fas fa-eye"></i>';
    });
}

/**
 * Test function for development to verify credentials storage and retrieval
 * This function is only for development and should be removed in production
 */
function testCredentials() {
    console.log('Testing credentials system...');
    
    // Test password manager
    let passwordManager = JSON.parse(localStorage.getItem('admin_password_manager') || '{}');
    console.log('Admin Password Manager:', passwordManager);
    
    // Test stored credentials
    let storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Stored Users:', storedUsers);
    
    // Test if superadmin check works
    console.log('Current user is superadmin:', authManager.isSuperAdmin());
}

// Call test function only in development environment
// Uncomment to test: testCredentials();

// Initialize configuration page
document.addEventListener('DOMContentLoaded', initConfigPage); 