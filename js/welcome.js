/**
 * Welcome Page Script for Campus Cafe
 * Handles welcome page initialization and authentication flow debugging
 */

document.addEventListener('DOMContentLoaded', function() {
    // Debug information for welcome page
    console.log('======= CAMPUS CAFE SYSTEM DEBUGGING =======');
    console.log('Welcome page loaded at: ' + new Date().toLocaleString());
    console.log('Environment mode: ' + (window.ENV?.production ? 'Production' : 'Development'));
    console.log('Offline mode: ' + (window.ENV?.features?.offlineMode ? 'Enabled' : 'Disabled'));
    console.log('=============================================');
    
    // Initialize the welcome page
    initWelcomePage();
    
    // Initialize empty cart if not exists
    initEmptyCart();
    
    console.log('Welcome page loaded successfully');
    
    // Log authentication state (without exposing sensitive information)
    checkAndLogAuthState();
});

/**
 * Initialize the welcome page
 */
async function initWelcomePage() {
    // Check if hero image is loading correctly
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const computedStyle = window.getComputedStyle(heroSection);
        const bgImage = computedStyle.backgroundImage;
        
        if (bgImage === 'none' || bgImage === '') {
            console.warn('Hero background image not loading. Check the path: assets/hero-bg.jpg');
            // Fallback to a color if image doesn't load
            heroSection.style.backgroundColor = '#333';
        } else {
            console.log('Hero background image loaded successfully');
        }
    }
    
    // Initialize mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            console.log('Mobile menu toggled');
        });
    } else {
        console.warn('Mobile menu toggle elements not found');
    }
    
    // Check if user is already logged in using Supabase or localStorage fallback
    let isLoggedIn = false;
    let userData = null;
    
    // Try to get user from Supabase
    if (typeof supabaseManager !== 'undefined') {
        try {
            const { user, error } = await supabaseManager.getCurrentUser();
            if (user && !error) {
                isLoggedIn = true;
                userData = user;
                console.log('User authenticated via Supabase:', user.email);
            } else {
                console.log('No Supabase user session found');
            }
        } catch (error) {
            console.warn('Error checking Supabase authentication status:', error);
        }
    } else {
        console.warn('Supabase manager not loaded, falling back to localStorage');
    }
    
    // Fallback to localStorage check if Supabase didn't find a user
    if (!isLoggedIn) {
        const userDataStr = localStorage.getItem('campus_cafe_user');
        if (userDataStr) {
            try {
                userData = JSON.parse(userDataStr);
                isLoggedIn = true;
                console.log('User authenticated via localStorage:', userData.email);
            } catch (e) {
                console.error('Error parsing user data from localStorage:', e);
                localStorage.removeItem('campus_cafe_user'); // Remove invalid data
            }
        }
    }
    
    // Update UI based on authentication status
    if (isLoggedIn && userData) {
        console.log('User already logged in, should redirect to index.html');
        
        // If user is already logged in but still on welcome page, add a button to go to index
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) {
            // Clear existing buttons
            heroButtons.innerHTML = '';
            
            // Add a continue button
            const continueButton = document.createElement('a');
            continueButton.href = 'index.html';
            continueButton.className = 'btn btn-primary';
            continueButton.textContent = 'Continue to Homepage';
            heroButtons.appendChild(continueButton);
            
            // Add a logout button
            const logoutButton = document.createElement('button');
            logoutButton.className = 'btn btn-secondary';
            logoutButton.textContent = 'Logout';
            logoutButton.addEventListener('click', async function() {
                // Use Supabase for logout if available
                if (typeof supabaseManager !== 'undefined') {
                    try {
                        await supabaseManager.signOut();
                        console.log('User signed out via Supabase');
                    } catch (error) {
                        console.error('Error signing out via Supabase:', error);
                    }
                } else {
                    // Fallback to localStorage removal
                    localStorage.removeItem('campus_cafe_user');
                    console.log('User signed out via localStorage removal');
                }
                location.reload();
            });
            heroButtons.appendChild(logoutButton);
        }
    }
}

/**
 * Initialize empty cart if it doesn't exist
 */
function initEmptyCart() {
    const CART_STORAGE_KEY = 'campus_cafe_cart';
    if (!localStorage.getItem(CART_STORAGE_KEY)) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
        console.log('Initialized empty cart for new user');
    }
    
    // Ensure orders are initialized as empty if they don't exist
    const ORDERS_KEY = 'campus_cafe_orders';
    if (!localStorage.getItem(ORDERS_KEY)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
        console.log('Initialized empty orders for new user');
    }
}

/**
 * Check authentication state and log for debugging
 */
async function checkAndLogAuthState() {
    // Check if the database is initialized
    if (!localStorage.getItem('campus_cafe_users')) {
        console.warn('Users database not initialized. This should be handled by initialize-db.js');
    } else {
        const users = JSON.parse(localStorage.getItem('campus_cafe_users'));
        console.log(`Database has ${users.length} registered users`);
        
        // Check if admin user exists without exposing details
        const adminCount = users.filter(user => user.role === 'admin' || user.role === 'superadmin').length;
        if (adminCount > 0) {
            console.log(`${adminCount} admin user(s) configured`);
        } else {
            console.warn('No admin user found in database');
        }
    }
    
    // Check if Supabase is initialized
    if (typeof supabaseManager !== 'undefined') {
        console.log('Supabase manager loaded');
        
        // Try to get current user from Supabase
        try {
            const { user, error } = await supabaseManager.getCurrentUser();
            if (user && !error) {
                console.log('Current logged in user (via Supabase):', {
                    email: user.email,
                    name: user.user_metadata?.name,
                    role: user.role || 'user'
                });
            } else {
                console.log('No user currently logged in (via Supabase)');
            }
        } catch (error) {
            console.error('Error getting user from Supabase:', error);
        }
    } else {
        console.warn('Supabase manager not available');
        
        // Check current authentication state without exposing sensitive details
        const userData = localStorage.getItem('campus_cafe_user');
        if (userData) {
            const user = JSON.parse(userData);
            console.log('Current logged in user (via localStorage):', {
                email: user.email,
                name: user.user_metadata?.name,
                role: user.role || 'user'
            });
        } else {
            console.log('No user currently logged in (via localStorage)');
        }
    }
}

/**
 * Global function to show toast notifications
 * This makes it available for use in the welcome page
 * @param {string} message - Message to display
 * @param {string} type - Type of notification: success, error, warning, or info
 */
function showToast(message, type = 'info') {
    // Check if notifications.js is loaded
    if (typeof notificationsManager !== 'undefined' && notificationsManager.showToast) {
        return notificationsManager.showToast(message, type);
    } else {
        // Fallback implementation if notificationsManager is not available
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Create a simple toast if the container doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;';
            document.body.appendChild(toastContainer);
        }
        
        const toast = document.createElement('div');
        toast.style.cssText = 'background:#fff;color:#333;padding:12px 16px;margin-bottom:10px;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
        toast.style.borderLeft = `4px solid ${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'blue'}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
} 