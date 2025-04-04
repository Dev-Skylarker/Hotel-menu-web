/**
 * Authentication Redirect Script
 * Checks if a user is logged in and redirects to login page if not
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the current path and convert to lowercase for consistent comparison
    const currentPath = window.location.pathname.toLowerCase();
    const currentPageName = currentPath.split('/').pop();
    
    // Pages that don't require authentication
    const publicPages = [
        'welcome.html',
        'login.html', 
        'register.html', 
        'admin/login.html'
    ];
    
    // Skip the auth check for public pages and static resources
    if (publicPages.some(page => currentPath.includes(page)) || 
        currentPath.includes('.css') || 
        currentPath.includes('.jpg') || 
        currentPath.includes('.png') || 
        currentPath.includes('.js')) {
        console.log('Skipping auth check for:', currentPath);
        return;
    }
    
    // Check if we're on the index page and redirect to welcome if not logged in
    if (currentPageName === 'index.html' || currentPageName === '' || currentPath.endsWith('/')) {
        const userData = localStorage.getItem('campus_cafe_user');
        if (!userData) {
            console.log('Not logged in, redirecting index to welcome page');
            window.location.href = currentPath.includes('/admin/') ? '../welcome.html' : 'welcome.html';
            return;
        }
    }
    
    // Check if user is logged in for protected pages
    const userData = localStorage.getItem('campus_cafe_user');
    if (!userData) {
        console.log('User not logged in, redirecting to login page');
        
        // Store the current URL to redirect back after login
        localStorage.setItem('redirect_after_login', window.location.href);
        
        // Show toast notification if possible
        if (typeof showToast === 'function') {
            showToast('Please log in to access this page', 'info');
        }
        
        // Redirect to login page
        window.location.href = currentPath.includes('/admin/') ? '../login.html' : 'login.html';
        return;
    }
    
    console.log('User is logged in, continuing to page');
    
    // For admin pages, check if user has admin role
    if (currentPath.includes('/admin/') && !currentPath.includes('admin/login.html')) {
        const user = JSON.parse(userData);
        // Verify the user has admin permissions
        if (!user.role || (user.role !== 'admin' && user.role !== 'superadmin')) {
            console.log('User does not have admin privileges, redirecting to home');
            
            // Show toast notification if possible
            if (typeof showToast === 'function') {
                showToast('You do not have admin privileges', 'error');
            }
            
            window.location.href = '../index.html';
        }
    }
}); 