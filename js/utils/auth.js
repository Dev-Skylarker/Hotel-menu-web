/**
 * Authentication Manager for Campus Cafe Admin
 */

const authManager = (function() {
    // Storage keys
    const USER_KEY = 'campus_cafe_user';
    const TOKEN_KEY = 'campus_cafe_token';
    const TOKEN_EXPIRY_KEY = 'campus_cafe_token_expiry';
    // Session timeout in milliseconds (45 minutes)
    const SESSION_TIMEOUT = 45 * 60 * 1000;
    
    /**
     * Initialize authentication
     */
    function init() {
        // Check if admin user exists in storage
        const users = JSON.parse(localStorage.getItem('campus_cafe_users')) || [];
        
        // If no admin exists, create default admins from config
        if (users.length === 0 && configManager) {
            const defaultAdmins = configManager.getAdminCredentials();
            localStorage.setItem('campus_cafe_users', JSON.stringify(defaultAdmins));
        }
        
        // Ensure Eric exists as a superadmin
        ensureSuperAdmin();
        
        // Debug current user
        console.log('Current user:', getCurrentUser());
    }
    
    /**
     * Ensure superadmin exists
     */
    function ensureSuperAdmin() {
        const users = JSON.parse(localStorage.getItem('campus_cafe_users')) || [];
        const superAdminEmail = 'Erickaris0521@gmail.com';
        
        // Check if Eric exists (case-insensitive)
        const ericExists = users.some(u => u.email.toLowerCase() === superAdminEmail.toLowerCase());
        
        if (!ericExists) {
            users.push({
                email: superAdminEmail,
                passwordHash: 'bd5c890673', // Project123 hash
                role: 'superadmin'
            });
            localStorage.setItem('campus_cafe_users', JSON.stringify(users));
            console.log('Added superadmin to campus_cafe_users');
        }
    }
    
    /**
     * Hash a password
     * @param {string} password - The password to hash
     * @returns {string} - Hashed password
     */
    function hashPassword(password) {
        // Use the SHA-256 function from config.js
        if (typeof sha256 === 'function') {
            return sha256(password);
        }
        
        // Fallback implementation
        return simpleHash(password);
    }
    
    /**
     * Simple hash function (fallback)
     * @param {string} str - String to hash
     * @returns {string} - Hashed string
     */
    function simpleHash(str) {
        // This is a simplified hash implementation for demo purposes
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
    
    /**
     * Attempt to login a user
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {boolean} - Whether login was successful
     */
    function login(email, password) {
        console.log('Attempting login for:', email);
        
        // Normalize email to lowercase for case-insensitive comparison
        const normalizedEmail = email.toLowerCase();
        
        // Debug output
        console.log(`Login attempt for "${normalizedEmail}" with password length ${password.length}`);
        
        // Get users from storage
        const users = JSON.parse(localStorage.getItem('campus_cafe_users')) || [];
        
        // Get secure credentials if available
        let secureAdmins = [];
        if (typeof secureCredentials !== 'undefined' && secureCredentials.adminUsers) {
            secureAdmins = secureCredentials.adminUsers;
            console.log('Secure admins available:', secureAdmins.length);
        } else {
            console.log('No secure admin credentials available');
        }
        
        // Combine users from both sources
        const allUsers = [...users, ...secureAdmins];
        console.log('Total users available:', allUsers.length);
        
        // Find user with matching email (case-insensitive)
        const user = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);
        
        if (!user) {
            console.warn('User not found:', email);
            return false;
        }
        
        // Use passwordHash from user if available
        const userPasswordHash = user.passwordHash;
        
        if (!userPasswordHash) {
            console.warn('No password hash found for user:', email);
            return false;
        }
        
        // Special super admin bypass for Eric - always allow Project123
        if (normalizedEmail === 'erickaris0521@gmail.com' && password === 'Project123') {
            console.log('Primary admin login successful with Project123');
            createSession(user);
            return true;
        }
        
        // Hash the provided password - only for comparison
        // We use the simple hash here since we just need to compare
        const providedPasswordHash = simpleHash(password);
        
        // Debug password comparison
        console.log('Comparing password hashes:', {
            provided: providedPasswordHash,
            stored: userPasswordHash.substring(0, 10) + '...' // Show just part for security
        });
        
        // Check password hash 
        if (userPasswordHash === providedPasswordHash || 
            userPasswordHash === password ||
            (user.password && user.password === providedPasswordHash)) {
            
            console.log('Login successful for:', email);
            createSession(user);
            return true;
        }
        
        console.warn('Login failed for:', email);
        return false;
    }
    
    /**
     * Create user session
     * @param {Object} user - User object
     */
    function createSession(user) {
        // Create session
        const sessionUser = {
            email: user.email,
            role: user.role || 'admin' 
        };
        
        // Generate token
        const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Set token expiration time
        const expiryTime = Date.now() + SESSION_TIMEOUT;
        
        // Save to storage
        localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        
        console.log('Session created for:', user.email, 'expires at:', new Date(expiryTime));
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} - Whether user is logged in
     */
    function isLoggedIn() {
        const user = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
        
        if (!user || !token || !expiryTime) {
            console.log('Missing login credentials');
            return false;
        }
        
        // Check if session has expired
        if (expiryTime && parseInt(expiryTime) < Date.now()) {
            console.log('Session expired, logging out. Expiry:', new Date(parseInt(expiryTime)));
            // Session expired, remove credentials
            logout();
            return false;
        }
        
        console.log('User is logged in, session valid until:', new Date(parseInt(expiryTime)));
        return true;
    }
    
    /**
     * Get current logged in user
     * @returns {Object|null} - Current user or null if not logged in
     */
    function getCurrentUser() {
        if (!isLoggedIn()) {
            return null;
        }
        
        return JSON.parse(localStorage.getItem(USER_KEY));
    }
    
    /**
     * Logout current user
     */
    function logout() {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
    
    /**
     * Get total admin count
     * @returns {number} - Total number of admins
     */
    function getAdminCount() {
        const users = JSON.parse(localStorage.getItem('campus_cafe_users')) || [];
        
        // Get secure credentials if available
        let secureAdmins = [];
        if (typeof secureCredentials !== 'undefined' && secureCredentials.adminUsers) {
            secureAdmins = secureCredentials.adminUsers;
        }
        
        return users.length + secureAdmins.length;
    }
    
    /**
     * Add a new admin
     * @param {string} email - Admin email
     * @param {string} password - Admin password (unhashed)
     * @returns {boolean} - Whether admin was added successfully
     */
    function addAdmin(email, password) {
        
        // Validate email format
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            console.error('Invalid email format');
            return false;
        }
        
        // Validate password
        if (!password || password.length < 8) {
            console.error('Password must be at least 8 characters long');
            return false;
        }
        
        // Hash password
        const passwordHash = simpleHash(password);
        
        // Get users from storage
        const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            // Update existing user
            existingUser.passwordHash = passwordHash;
        } else {
            // Add new user
            users.push({
                email: email,
                passwordHash: passwordHash,
                role: 'admin'
            });
        }
        
        // Save to storage
        localStorage.setItem('campus_cafe_users', JSON.stringify(users));
        
        // Also update the config if we're in development
        if (configManager && configManager.updateAdminCredential) {
            configManager.updateAdminCredential(email, passwordHash);
        }
        
        return true;
    }
    
    /**
     * Check if user is a superadmin
     * @returns {boolean} - Whether user is a superadmin
     */
    function isSuperAdmin() {
        const user = getCurrentUser();
        
        // Check if user exists and has superadmin role
        if (user && user.role === 'superadmin') {
            return true;
        }
        
        // Also check if user is Eric (case-insensitive)
        if (user && user.email && user.email.toLowerCase() === 'erickaris0521@gmail.com') {
            return true;
        }
        
        return false;
    }
    
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Public API
    return {
        login,
        logout,
        isLoggedIn,
        getCurrentUser,
        hashPassword,
        addAdmin,
        getAdminCount,
        isSuperAdmin,
        createSession
    };
})();
