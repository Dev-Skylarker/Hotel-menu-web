/**
 * Menu Page JavaScript for Kenyan Delights Restaurant
 */

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('menu-search');
const searchBtn = document.getElementById('search-btn');
const menuTabs = document.querySelectorAll('.menu-tab');
const noResults = document.querySelector('.no-results');
const itemModal = document.getElementById('item-modal');
const closeModal = document.querySelector('.close-modal');

// Current filter state
let currentCategory = 'all';
let currentSearchTerm = '';

/**
 * Initialize the menu page
 */
function initMenu() {
    // Load menu items
    loadMenuItems();
    
    // Add event listeners
    addEventListeners();
}

/**
 * Add all event listeners for the menu page
 */
function addEventListeners() {
    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Category tabs
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            setActiveTab(tab);
            filterMenuItems(category, currentSearchTerm);
        });
    });
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            closeItemModal();
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            closeItemModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && itemModal.style.display === 'block') {
            closeItemModal();
        }
    });
    
    // Handle hash in URL
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
        handleHashChange();
    }
}

/**
 * Handle search functionality
 */
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    currentSearchTerm = searchTerm;
    filterMenuItems(currentCategory, searchTerm);
}

/**
 * Set the active tab
 * @param {HTMLElement} activeTab - The tab to set as active
 */
function setActiveTab(activeTab) {
    menuTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
    currentCategory = activeTab.dataset.category;
}

/**
 * Filter menu items by category and search term
 * @param {string} category - Category to filter by
 * @param {string} searchTerm - Search term to filter by
 */
function filterMenuItems(category, searchTerm = '') {
    const menuItems = storageManager.getMenuItems();
    
    // Apply filters
    let filteredItems = menuItems;
    
    // Filter by category
    if (category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    // Filter by search term
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => {
            return (
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                (item.ingredients && item.ingredients.some(ing => 
                    ing.toLowerCase().includes(searchTerm)
                ))
            );
        });
    }
    
    // Display filtered items
    displayMenuItems(filteredItems);
}

/**
 * Display menu items in the container
 * @param {Array} items - Array of menu items to display
 */
function displayMenuItems(items) {
    if (!menuContainer) return;
    
    // Clear container
    menuContainer.innerHTML = '';
    
    // Show "no results" message if needed
    if (items.length === 0) {
        if (noResults) {
            noResults.style.display = 'block';
        }
        return;
    }
    
    // Hide "no results" message
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    // Create and append menu item elements
    items.forEach(item => {
        const menuItem = createMenuItem(item);
        menuContainer.appendChild(menuItem);
    });
    
    // Add animation effects with staggered delays
    const menuElements = menuContainer.querySelectorAll('.menu-item');
    menuElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 50 * index);
    });
}

/**
 * Create a menu item element
 * @param {Object} item - Menu item data
 * @returns {HTMLElement} - Menu item element
 */
function createMenuItem(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = item.id;
    
    const categoryLabel = formatCategoryLabel(item.category);
    
    menuItem.innerHTML = `
        <div class="menu-item-image">
            <div class="image-placeholder">
                <i class="fas fa-utensils"></i>
            </div>
        </div>
        <div class="menu-item-info">
            <div class="menu-item-category">${categoryLabel}</div>
            <h3 class="menu-item-name">${escapeHtml(item.name)}</h3>
            <div class="menu-item-price">KSh ${item.price.toFixed(2)}</div>
            <p class="menu-item-description">${escapeHtml(item.description)}</p>
        </div>
    `;
    
    // Add click event to open modal
    menuItem.addEventListener('click', () => {
        openItemModal(item);
    });
    
    return menuItem;
}

/**
 * Open modal with item details
 * @param {Object} item - Menu item data
 */
function openItemModal(item) {
    if (!itemModal) return;
    
    // Set modal content
    document.getElementById('modal-item-name').textContent = item.name;
    document.getElementById('modal-item-description').textContent = item.description;
    document.getElementById('modal-item-price').textContent = `KSh ${item.price.toFixed(2)}`;
    document.getElementById('modal-item-category').textContent = formatCategoryLabel(item.category);
    
    // Set ingredients list
    const ingredientsList = document.getElementById('modal-item-ingredients');
    ingredientsList.innerHTML = '';
    
    if (item.ingredients && item.ingredients.length > 0) {
        item.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No ingredients listed';
        ingredientsList.appendChild(li);
    }
    
    // Update URL hash
    window.location.hash = item.id;
    
    // Show modal
    itemModal.style.display = 'block';
    
    // Apply entrance animation
    const modalContent = itemModal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        modalContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 10);
}

/**
 * Close the item modal
 */
function closeItemModal() {
    if (!itemModal) return;
    
    // Update URL hash
    history.pushState('', document.title, window.location.pathname + window.location.search);
    
    // Apply exit animation
    const modalContent = itemModal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        itemModal.style.display = 'none';
        // Reset animation
        modalContent.style.transition = '';
    }, 300);
}

/**
 * Handle hash change to open menu item from URL
 */
function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        // Find menu item with this ID
        const menuItems = storageManager.getMenuItems();
        const item = menuItems.find(item => item.id === hash);
        
        if (item) {
            openItemModal(item);
        }
    }
}

/**
 * Load all menu items from storage
 */
function loadMenuItems() {
    try {
        // Get menu items
        const menuItems = storageManager.getMenuItems();
        
        // Display all items
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
        if (menuContainer) {
            menuContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Could not load menu items. Please try again later.</p>
                </div>
            `;
        }
    }
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

// Initialize menu page
document.addEventListener('DOMContentLoaded', initMenu);
