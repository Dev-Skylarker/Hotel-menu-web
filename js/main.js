/**
 * Main JavaScript for the Kenyan Delights Restaurant website
 */

// DOM Elements
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mainNav = document.querySelector('.main-nav');
const contactForm = document.getElementById('contact-form');
const featuredDishesContainer = document.getElementById('featured-dishes-container');

// Toggle mobile navigation
if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        
        // Change icon based on menu state
        const icon = mobileNavToggle.querySelector('i');
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Handle Contact Form Submission
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validate inputs
        if (!name || !email || !message) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }
        
        // In a real application, you would send data to server
        // Here we'll just show a success message and reset the form
        showAlert('Thank you for your message! We will get back to you soon.', 'success');
        contactForm.reset();
    });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show alert message to user
 * @param {string} message - Message to display
 * @param {string} type - Alert type ('success' or 'error')
 */
function showAlert(message, type = 'success') {
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    
    // Find where to insert it
    const formContainer = contactForm.parentElement;
    formContainer.insertBefore(alertEl, contactForm);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertEl.remove();
    }, 5000);
}

/**
 * Load featured dishes
 */
async function loadFeaturedDishes() {
    if (!featuredDishesContainer) return;
    
    try {
        // Get menu items from storage
        const menuItems = storageManager.getMenuItems();
        
        // Filter featured dishes
        const featuredDishes = menuItems.filter(item => item.featured);
        
        // Display featured dishes
        if (featuredDishes.length > 0) {
            featuredDishesContainer.innerHTML = '';
            
            // Limit to 3 featured dishes
            const displayDishes = featuredDishes.slice(0, 3);
            
            displayDishes.forEach(dish => {
                const dishCard = createDishCard(dish);
                featuredDishesContainer.appendChild(dishCard);
            });
        } else {
            featuredDishesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>No featured dishes yet. Check back soon!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading featured dishes:', error);
        featuredDishesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Could not load featured dishes. Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Create a dish card element
 * @param {Object} dish - Dish data
 * @returns {HTMLElement} - Dish card element
 */
function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    
    const categoryLabel = formatCategoryLabel(dish.category);
    
    card.innerHTML = `
        <div class="dish-image">
            <div class="image-placeholder">
                <i class="fas fa-utensils"></i>
                <span>${dish.name}</span>
            </div>
        </div>
        <div class="dish-info">
            <div class="dish-category">${categoryLabel}</div>
            <h3 class="dish-name">${escapeHtml(dish.name)}</h3>
            <div class="dish-price">KSh ${dish.price.toFixed(2)}</div>
            <p class="dish-description">${escapeHtml(dish.description)}</p>
            <div class="view-dish">
                <a href="menu.html#${dish.id}" class="btn btn-secondary btn-small">View Details</a>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Format category label for display
 * @param {string} category - Category key
 * @returns {string} - Formatted category label
 */
function formatCategoryLabel(category) {
    const categories = {
        'appetizers': 'Appetizer',
        'main-courses': 'Main Course',
        'desserts': 'Dessert',
        'drinks': 'Drink'
    };
    
    return categories[category] || 'Other';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe string
 * @returns {string} - Escaped string
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage if needed
    storageManager.initStorage();
    
    // Load featured dishes
    loadFeaturedDishes();
});
