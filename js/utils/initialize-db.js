/**
 * Initialize Database Script
 * Creates default data structures in localStorage if they don't exist
 */

(function() {
    console.log('======= INITIALIZING DATABASE =======');
    console.log('Checking if database needs initialization...');
    
    // Initialize users collection if it doesn't exist
    if (!localStorage.getItem('campus_cafe_users')) {
        console.log('Creating users collection');
        localStorage.setItem('campus_cafe_users', JSON.stringify([]));
    }
    
    // Initialize orders collection if it doesn't exist
    if (!localStorage.getItem('campus_cafe_orders')) {
        console.log('Creating orders collection');
        localStorage.setItem('campus_cafe_orders', JSON.stringify([]));
    }
    
    // Initialize notifications collection if it doesn't exist
    if (!localStorage.getItem('campus_cafe_notifications')) {
        console.log('Creating notifications collection');
        localStorage.setItem('campus_cafe_notifications', JSON.stringify([]));
    }
    
    // Check if we need to create users
    const users = JSON.parse(localStorage.getItem('campus_cafe_users'));
    
    // Check if admin user exists
    const hasAdmin = users.some(user => user.role === 'admin' || user.role === 'superadmin');
    
    // Create admin user if it doesn't exist
    if (!hasAdmin && users.length === 0) {
        console.log('%c========== DEFAULT ADMIN CREDENTIALS ==========', 'font-weight: bold; color: blue;');
        
        // Create admin user with specified credentials
        const adminUser = {
            name: 'Admin User',
            email: 'erickaris0521@gmail.com',
            password: 'Project123',
            admissionNumber: '00000',
            role: 'admin',
            registeredAt: new Date().toISOString()
        };
        
        users.push(adminUser);
        console.log('%cAdmin user created with the following credentials:', 'color: blue;');
        console.log('%cEmail: ' + adminUser.email, 'color: blue;');
        console.log('%cPassword: ' + adminUser.password, 'color: blue;');
        console.log('%c=============================================', 'font-weight: bold; color: blue;');
    }
    
    // Check if default user exists
    const hasDefaultUser = users.some(user => user.email === 'user@test.gmail.com');
    
    // Create default user if it doesn't exist
    if (!hasDefaultUser) {
        console.log('%c========== DEFAULT USER CREDENTIALS ==========', 'font-weight: bold; color: green;');
        
        // Create default user
        const defaultUser = {
            name: 'Test User',
            email: 'user@test.gmail.com',
            password: 'password',
            admissionNumber: '12345',
            role: 'user',
            registeredAt: new Date().toISOString()
        };
        
        users.push(defaultUser);
        console.log('%cDefault user created with the following credentials:', 'color: green;');
        console.log('%cEmail: ' + defaultUser.email, 'color: green;');
        console.log('%cPassword: ' + defaultUser.password, 'color: green;');
        console.log('%c=============================================', 'font-weight: bold; color: green;');
    }
    
    // Save users back to localStorage
    localStorage.setItem('campus_cafe_users', JSON.stringify(users));
    
    console.log('Database initialization complete');
    console.log('=========================================');
    
    /**
     * Generate a secure random password
     * @param {number} length - The length of the password to generate
     * @returns {string} A secure random password
     */
    function generateSecurePassword(length = 12) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
        let password = '';
        
        // Ensure we have at least one of each character type
        password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // uppercase
        password += getRandomChar('abcdefghijklmnopqrstuvwxyz'); // lowercase
        password += getRandomChar('0123456789'); // digit
        password += getRandomChar('!@#$%^&*()-_=+'); // special
        
        // Fill the rest of the password
        for (let i = password.length; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        // Shuffle the password characters
        return shuffleString(password);
    }
    
    /**
     * Get a random character from a string
     * @param {string} characters - The character set to choose from
     * @returns {string} A random character from the set
     */
    function getRandomChar(characters) {
        return characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    /**
     * Shuffle a string
     * @param {string} string - The string to shuffle
     * @returns {string} The shuffled string
     */
    function shuffleString(string) {
        const array = string.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
})(); 