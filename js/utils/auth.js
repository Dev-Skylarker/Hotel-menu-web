/**
 * Authentication Manager for Kenyan Delights Restaurant Admin
 */

const authManager = (function() {
    // Storage keys
    const USER_KEY = 'kenyan_delights_user';
    const TOKEN_KEY = 'kenyan_delights_token';
    
    // Default admin credentials (in a real app, this would be on the server)
    const DEFAULT_ADMIN = {
        username: 'admin',
        // Password: "admin123" (hashed)
        passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
    };
    
    /**
     * Initialize authentication
     */
    function init() {
        // Check if admin user exists in storage
        const users = JSON.parse(localStorage.getItem('kenyan_delights_users')) || [];
        
        // If no admin exists, create default admin
        if (users.length === 0) {
            localStorage.setItem('kenyan_delights_users', JSON.stringify([DEFAULT_ADMIN]));
        }
    }
    
    /**
     * Hash a password
     * @param {string} password - The password to hash
     * @returns {string} - Hashed password
     */
    function hashPassword(password) {
        // Simple hash function using SHA-256
        // In a real application, this would use a more secure method with salt
        return sha256(password);
    }
    
    /**
     * SHA-256 hash function
     * @param {string} str - String to hash
     * @returns {string} - Hashed string
     */
    function sha256(str) {
        // This is a simplified SHA-256 implementation for demo purposes
        // In a real application, use a proper crypto library
        
        // Convert string to an array of bytes
        const buffer = new TextEncoder().encode(str);
        
        // Use SubtleCrypto API if available (modern browsers)
        if (window.crypto && window.crypto.subtle) {
            return window.crypto.subtle.digest('SHA-256', buffer)
                .then(hash => {
                    // Convert hash to hex string
                    return Array.from(new Uint8Array(hash))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                });
        }
        
        // Fallback for older browsers (simplified hash)
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
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {boolean} - Whether login was successful
     */
    function login(username, password) {
        // Get users from storage
        const users = JSON.parse(localStorage.getItem('kenyan_delights_users')) || [];
        
        // Find user with matching username
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return false;
        }
        
        // Check password
        const passwordHash = hashPassword(password);
        
        // For demo purposes, also allow the unhashed default password
        if (user.passwordHash === passwordHash || (username === 'admin' && password === 'admin123')) {
            // Create session
            const sessionUser = {
                username: user.username
            };
            
            // Generate simple token (in real app, this would be JWT or similar)
            const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Save to storage
            localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
            localStorage.setItem(TOKEN_KEY, token);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} - Whether user is logged in
     */
    function isLoggedIn() {
        const user = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        
        return !!(user && token);
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
    }
    
    // Initialize on load
    init();
    
    // Public API
    return {
        login,
        logout,
        isLoggedIn,
        getCurrentUser
    };
})();
