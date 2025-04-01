// Mobile navigation toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    // Only setup if both elements exist
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            // Toggle aria-expanded for accessibility
            const expanded = mainNav.classList.contains('active');
            mobileNavToggle.setAttribute('aria-expanded', expanded);
            
            // Toggle icon between hamburger and close (X)
            const toggleIcon = mobileNavToggle.querySelector('i');
            if (toggleIcon) {
                if (expanded) {
                    toggleIcon.classList.remove('fa-bars');
                    toggleIcon.classList.add('fa-times');
                } else {
                    toggleIcon.classList.remove('fa-times');
                    toggleIcon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.main-nav') && 
                !event.target.closest('.mobile-nav-toggle') && 
                mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', false);
                
                // Reset icon
                const toggleIcon = mobileNavToggle.querySelector('i');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-times');
                    toggleIcon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking on a nav link (for better mobile UX)
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', false);
                
                // Reset icon
                const toggleIcon = mobileNavToggle.querySelector('i');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-times');
                    toggleIcon.classList.add('fa-bars');
                }
            });
        });
    }
    
    // Setup mobile bottom navigation if it exists
    const mobileBottomNav = document.querySelector('.mobile-bottom-nav');
    if (mobileBottomNav) {
        const bottomNavLinks = mobileBottomNav.querySelectorAll('a');
        
        // Set active state based on current page
        bottomNavLinks.forEach(link => {
            if (window.location.href === link.href || 
                window.location.pathname === link.getAttribute('href')) {
                link.classList.add('active');
            }
            
            // Add click handler to set active state
            link.addEventListener('click', function() {
                bottomNavLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}); 