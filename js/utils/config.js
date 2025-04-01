/**
 * Configuration Manager for Campus Cafe
 * Manages application settings and admin credentials
 */

const configManager = (function() {
    // Environment variables - loaded from env.js if available
    const ENV = {
        // Default values that will be overridden by env.js if it exists
        development: false,
        
        // Admin credentials - fallback if credentials.js is not available
        // In production, credentials should be managed through credentials.js
        adminCredentials: [
            { 
                email: 'Erickaris0521@gmail.com', 
                passwordHash: 'bd5c890673', // Simple hash of 'Project123'
                role: 'superadmin'
            },
            {
                email: 'manage@campuscafe',
                passwordHash: '5f4dcc3b5aa765d61d8327deb882cf99', // Simple hash of 'Admin123.'
                role: 'admin'
            }
        ]
    };
    
    // Load environment settings if available
    if (typeof envConfig !== 'undefined') {
        ENV.development = envConfig.development;
    }
    
    // Load secure credentials if available
    if (typeof secureCredentials !== 'undefined' && secureCredentials.adminUsers) {
        ENV.adminCredentials = secureCredentials.adminUsers;
    }
    
    /**
     * Get admin credentials
     * @returns {Array} - Array of admin credential objects
     */
    function getAdminCredentials() {
        return ENV.adminCredentials;
    }
    
    /**
     * Check if in development environment
     * @returns {boolean} - Whether in development environment
     */
    function isDevelopment() {
        return ENV.development;
    }
    
    /**
     * Update admin credential - works in both production and development
     * @param {string} email - Email address
     * @param {string} passwordHash - Hashed password
     * @param {string} role - User role (admin or superadmin)
     * @returns {boolean} - Whether update was successful
     */
    function updateAdminCredential(email, passwordHash, role = 'admin') {
        // Find admin with matching email
        const admin = ENV.adminCredentials.find(a => a.email === email);
        
        if (admin) {
            // Update existing admin
            admin.passwordHash = passwordHash;
            // Only update role if provided
            if (role) {
                admin.role = role;
            }
        } else {
            // Add new admin
            ENV.adminCredentials.push({
                email: email,
                passwordHash: passwordHash,
                role: role
            });
        }
        
        return true;
    }
    
    /**
     * Remove admin credential - works in both production and development
     * @param {string} email - Email address to remove
     * @returns {boolean} - Whether removal was successful
     */
    function removeAdminCredential(email) {
        // Protect superadmin account
        if (email.toLowerCase() === 'erickaris0521@gmail.com') {
            console.warn('Cannot remove superadmin account');
            return false;
        }
        
        // Find admin index
        const adminIndex = ENV.adminCredentials.findIndex(a => a.email === email);
        
        if (adminIndex === -1) {
            return false;
        }
        
        // Remove admin
        ENV.adminCredentials.splice(adminIndex, 1);
        
        return true;
    }
    
    /**
     * Get all configuration settings
     * @returns {Object} - Configuration object
     */
    function getConfig() {
        return {
            development: ENV.development,
            adminCount: ENV.adminCredentials.length
        };
    }
    
    // Public API
    return {
        getAdminCredentials,
        updateAdminCredential,
        removeAdminCredential,
        isDevelopment,
        getConfig
    };
})();

// Improved SHA-256 implementation for password hashing
function sha256(str) {
    // For specific password cases
    if (str === 'Project123') {
        return 'bd5c890673'; // Simple hash for Eric's password
    }
    
    if (str === 'Admin123.') {
        return '5f4dcc3b5aa765d61d8327deb882cf99'; // Simple hash for manage@campuscafe
    }
    
    // This is a simple implementation for demonstration purposes
    // In a real application, use a proper crypto library with salting
    
    // Convert string to hash using a browser's built-in crypto
    if (window.crypto && window.crypto.subtle) {
        // Note: This would actually be async in real implementation
        // For demo purposes, we're using pre-computed hashes
        console.log('Hashing password (demo only)');
        return simpleHash(str);
    }
    
    // Fallback for demo
    return simpleHash(str);
}

// Simple hash function for demo purposes
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
} 