/**
 * EXAMPLE CREDENTIALS FILE
 * 
 * This is a template for creating your own credentials.js file
 * Copy this file to 'credentials.js' and update with your secure credentials
 * The credentials.js file is git-ignored for security
 */

const secureCredentials = {
    // Admin users array - each object represents one admin user
    adminUsers: [
        { 
            email: 'Erickaris0521@gmail.com',
            // For a real application, use a secure hashing method with salt
            passwordHash: 'bd5c890673', // Simple hash of 'Project123'
            role: 'superadmin'
        },
        {
            email: 'manage@campuscafe',
            passwordHash: '5f4dcc3b5aa765d61d8327deb882cf99', // Simple hash of 'Admin123.'
            role: 'admin'
        }
        // Additional admins can be added by the superadmin through the admin interface
        // The system will store them in localStorage
    ]
}; 