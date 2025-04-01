/**
 * Menu Page JavaScript for Campus Cafe
 */

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const searchInput = document.getElementById('menu-search');
const searchBtn = document.getElementById('search-btn');
const menuTabs = document.querySelectorAll('.menu-tab');
const noResults = document.querySelector('.no-results');
const itemModal = document.getElementById('item-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const orderItemBtn = document.getElementById('order-item-btn');
const orderConfirmationModal = document.getElementById('order-confirmation-modal');
const closeConfirmationBtn = document.getElementById('close-confirmation');
const orderNumberSpan = document.getElementById('order-number');
const currentOrdersContainer = document.getElementById('current-orders');

// Current filter state
let currentCategory = 'all';
let currentSearchTerm = '';
let currentItem = null;
// Auto-refresh interval (in milliseconds)
const REFRESH_INTERVAL = 30000; // 30 seconds
let refreshTimerId = null;

/**
 * Initialize the menu page
 */
function initMenu() {
    // Load menu items
    loadMenuItems();
    
    // Display current orders if any
    displayCurrentOrders();
    
    // Add event listeners
    addEventListeners();
    
    // Start auto-refresh timer
    startAutoRefresh();
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
    // Clear any existing timer
    if (refreshTimerId) {
        clearInterval(refreshTimerId);
    }
    
    // Set up auto-refresh timer
    refreshTimerId = setInterval(() => {
        console.log('Auto-refreshing menu data...');
        // Refresh menu items while preserving current filters
        filterMenuItems(currentCategory, currentSearchTerm);
        // Refresh current orders
        displayCurrentOrders();
    }, REFRESH_INTERVAL);
}

/**
 * Stop auto-refresh timer
 */
function stopAutoRefresh() {
    if (refreshTimerId) {
        clearInterval(refreshTimerId);
        refreshTimerId = null;
    }
}

/**
 * Add all event listeners for the menu page
 */
function addEventListeners() {
    // Get clear search button
    const clearSearchBtn = document.getElementById('clear-search-btn');
    
    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
        // Real-time search as user types
        searchInput.addEventListener('input', () => {
            // Update search term and filter in real time
            currentSearchTerm = searchInput.value.trim().toLowerCase();
            filterMenuItems(currentCategory, currentSearchTerm);
            
            // Show clear button if there's text
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
            }
        });
        
        // Search on Enter key
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            filterMenuItems(currentCategory, '');
            clearSearchBtn.style.display = 'none';
            searchInput.focus();
        });
    }
    
    // Category tabs
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            setActiveTab(tab);
            currentCategory = category;
            filterMenuItems(category, currentSearchTerm);
        });
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.closest('#item-modal')) {
                closeItemModal();
            } else if (e.target.closest('#order-confirmation-modal')) {
                closeConfirmationModal();
            }
        });
    });
    
    // Order button
    if (orderItemBtn) {
        orderItemBtn.addEventListener('click', placeOrder);
    }
    
    // Close confirmation button
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', closeConfirmationModal);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === itemModal) {
            closeItemModal();
        } else if (e.target === orderConfirmationModal) {
            closeConfirmationModal();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (itemModal && itemModal.style.display === 'block') {
                closeItemModal();
            } else if (orderConfirmationModal && orderConfirmationModal.style.display === 'block') {
                closeConfirmationModal();
            }
        }
    });
    
    // Handle hash in URL
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
        handleHashChange();
    }
    
    // Stop auto-refresh when page is hidden to save resources
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
        }
    });
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
    console.log(`Filtering by category: ${category} and search term: ${searchTerm}`);
    
    // Get all menu items
    const menuItems = storageManager.getMenuItems();
    
    // Apply filters
    let filteredItems = menuItems;
    
    // Filter by category first
    if (category && category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    // Then filter by search term
    if (searchTerm && searchTerm.trim() !== '') {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        filteredItems = filteredItems.filter(item => {
            return (
                (item.name && item.name.toLowerCase().includes(lowerSearchTerm)) ||
                (item.description && item.description.toLowerCase().includes(lowerSearchTerm)) ||
                (item.category && item.category.toLowerCase().includes(lowerSearchTerm)) ||
                (item.ingredients && Array.isArray(item.ingredients) && item.ingredients.some(ing => 
                    ing.toLowerCase().includes(lowerSearchTerm)
                ))
            );
        });
    }
    
    // Display filtered items
    displayMenuItems(filteredItems);
    
    // Update the UI to show active filters
    updateFilterUI(category, searchTerm);
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
        const menuItem = createMenuItemCard(item);
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
 * Create a menu item card
 * @param {Object} item - Menu item data
 * @returns {HTMLElement} - Menu item card element
 */
function createMenuItemCard(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    if (item.available === false) {
        menuItem.classList.add('unavailable');
    }
    menuItem.setAttribute('data-id', item.id);
    
    const formattedPrice = window.formatters?.currency 
        ? window.formatters.currency(item.price, true) 
        : `KSh ${item.price.toFixed(2)}`;
    
    // Create availability badge
    const availabilityBadge = item.available === false ? 
        '<div class="unavailable-indicator"><i class="fas fa-times-circle"></i> Currently Unavailable</div>' : 
        '<div class="available-indicator"><i class="fas fa-check-circle"></i> Available</div>';
    
    // Create featured badge if needed
    const featuredBadge = item.featured ? 
        '<div class="featured-indicator"><i class="fas fa-star"></i> Featured</div>' : 
        '';
    
    menuItem.innerHTML = `
        <div class="menu-item-image">
            ${item.imageUrl 
                ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" class="menu-img">` 
                : `<div class="image-placeholder"><i class="fas fa-utensils"></i><p>No image available</p></div>`
            }
            ${featuredBadge}
            ${availabilityBadge}
        </div>
        <div class="menu-item-info">
            <h3 class="menu-item-name">${escapeHtml(item.name)}</h3>
            <div class="menu-item-price">${formattedPrice}</div>
            <p class="menu-item-description">${escapeHtml(item.description)}</p>
            <div class="menu-item-category">${formatCategoryLabel(item.category)}</div>
            <div class="menu-item-actions">
                <button class="btn btn-small btn-secondary view-details-btn" data-id="${item.id}">
                    <i class="fas fa-eye"></i> View Details
                </button>
                ${item.available === false ? 
                    `<div class="unavailable-message">Not Available</div>` :
                    `<button class="btn btn-small btn-secondary add-to-cart-btn" data-id="${item.id}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn btn-small btn-primary order-now-btn" data-id="${item.id}">
                        <i class="fas fa-shopping-cart"></i> Order Now
                    </button>`
                }
            </div>
        </div>
    `;
    
    // Add event listener to the view details button
    const viewDetailsBtn = menuItem.querySelector('.view-details-btn');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openItemModal(item);
        });
    }
    
    // Add event listeners to action buttons only if item is available
    if (item.available !== false) {
        // Add event listener to the add to cart button
        const addToCartBtn = menuItem.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCartDirectly(item);
            });
        }
        
        // Add event listener to the order now button
        const orderNowBtn = menuItem.querySelector('.order-now-btn');
        if (orderNowBtn) {
            orderNowBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                orderNowDirectly(item);
            });
        }
    }
    
    // Make entire card clickable for details
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
    
    // Store current item reference
    currentItem = item;
    
    // Set modal content
    document.getElementById('modal-item-name').textContent = item.name;
    document.getElementById('modal-item-description').textContent = item.description;
    document.getElementById('modal-item-price').textContent = window.formatters?.currency ? window.formatters.currency(item.price, true) : `KSh ${item.price}`;
    document.getElementById('modal-item-category').textContent = formatCategoryLabel(item.category);
    
    // Check if item is available
    const isAvailable = item.available !== false;
    
    // Set the image
    const imageContainer = document.getElementById('modal-item-image');
    if (imageContainer) {
        if (item.imageUrl) {
            imageContainer.innerHTML = `
                <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" class="modal-item-img">
                ${!isAvailable ? '<div class="modal-unavailable-indicator"><i class="fas fa-times-circle"></i> Currently Unavailable</div>' : ''}
            `;
        } else {
            imageContainer.innerHTML = `
                <div class="image-placeholder"><i class="fas fa-utensils"></i></div>
                ${!isAvailable ? '<div class="modal-unavailable-indicator"><i class="fas fa-times-circle"></i> Currently Unavailable</div>' : ''}
            `;
        }
    }

    // Add quantity controls only if item is available
    const actionsContainer = document.querySelector('.modal-item-actions');
    if (actionsContainer) {
        if (isAvailable) {
            actionsContainer.innerHTML = `
                <div class="quantity-control">
                    <button class="quantity-btn decrease-btn" id="decrease-quantity">-</button>
                    <input type="number" id="item-quantity" class="quantity-input" value="1" min="1" max="99">
                    <button class="quantity-btn increase-btn" id="increase-quantity">+</button>
                </div>
                <div class="action-buttons">
                    <button id="add-to-cart-btn" class="btn btn-secondary">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button id="order-item-btn" class="btn btn-primary">
                        <i class="fas fa-shopping-cart"></i> Order Now
                    </button>
                </div>
            `;
            
            // Add event listeners for quantity buttons
            const decreaseBtn = document.getElementById('decrease-quantity');
            const increaseBtn = document.getElementById('increase-quantity');
            const quantityInput = document.getElementById('item-quantity');
            const addToCartBtn = document.getElementById('add-to-cart-btn');
            const orderBtn = document.getElementById('order-item-btn');
            
            // Decrease quantity button
            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => {
                    const currentValue = parseInt(quantityInput.value);
                    if (currentValue > 1) {
                        quantityInput.value = currentValue - 1;
                    }
                });
            }
            
            // Increase quantity button
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => {
                    const currentValue = parseInt(quantityInput.value);
                    if (currentValue < 99) {
                        quantityInput.value = currentValue + 1;
                    }
                });
            }
            
            // Add to cart button
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    const quantity = parseInt(quantityInput.value);
                    addToCart(quantity);
                });
            }
            
            // Order button
            if (orderBtn) {
                orderBtn.addEventListener('click', () => {
                    placeOrder();
                });
            }
        } else {
            // Item is unavailable - show message instead of controls
            actionsContainer.innerHTML = `
                <div class="modal-unavailable-message">
                    <i class="fas fa-info-circle"></i> 
                    This item is currently unavailable for ordering
                </div>
            `;
        }
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
 * Close the order confirmation modal
 */
function closeConfirmationModal() {
    if (!orderConfirmationModal) return;
    
    // Apply exit animation
    const modalContent = orderConfirmationModal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        orderConfirmationModal.style.display = 'none';
        // Reset animation
        modalContent.style.transition = '';
    }, 300);
    
    // Update current orders display
    displayCurrentOrders();
}

/**
 * Add current item to cart
 */
function addToCart() {
    if (!currentItem) return;
    
    // Get quantity
    const quantityInput = document.getElementById('item-quantity');
    const quantity = parseInt(quantityInput ? quantityInput.value : 1);
    
    // Add to cart
    cartManager.addToCart(currentItem, quantity);
    
    // Update cart badge count immediately
    updateCartBadge();
    
    // Show confirmation
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `${currentItem.name} added to cart!`;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
    
    // Close modal
    closeItemModal();
}

/**
 * Place an order for the current item
 */
function placeOrder() {
    try {
        // Check if item is available
        if (currentItem.available === false) {
            showNotification('This item is currently unavailable for ordering', 'error');
            return;
        }
        
        // Get quantity
        const quantityInput = document.getElementById('item-quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        // Create a unique order ID
        const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000) + '-' + 
                        Math.floor(1000 + Math.random() * 9000);
        
        // Create order object
        const order = {
            id: orderId,
            item: currentItem,
            quantity: quantity,
            status: 'pending',
            customerName: 'Current User',
            orderTime: new Date().toISOString(),
            estimatedPickupTime: new Date(new Date().getTime() + 20 * 60000).toISOString(), // 20 minutes from now
            paymentMethod: 'cash'
        };
        
        // Get current orders array
        const currentOrders = storageManager.getOrders();
        
        // Add the new order
        currentOrders.push(order);
        
        // Save back to storage
        localStorage.setItem('campus_cafe_orders', JSON.stringify(currentOrders));
        
        // Store the order ID for tracking
        localStorage.setItem('last_order_id', orderId);
        
        // Add item to cart for backup
        cartManager.addToCart(currentItem, quantity);
        
        // Update cart badge count
        updateCartBadge();
        
        // Close the modal
        closeItemModal();
        
        // Navigate directly to my-orders page
        showNotification(`${quantity} x ${currentItem.name} has been added to cart. Redirecting to orders...`, 'success');
        
        // Short delay before redirecting to give notification time to show
        setTimeout(() => {
            window.location.href = 'my-orders.html';
        }, 1000);
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}

/**
 * Show order confirmation modal
 * @param {Object} order - Order object
 */
function showOrderConfirmation(order) {
    if (!orderConfirmationModal || !orderNumberSpan) return;
    
    // Set order number
    orderNumberSpan.textContent = order.id;
    
    // Show modal
    orderConfirmationModal.style.display = 'block';
    
    // Apply entrance animation
    const modalContent = orderConfirmationModal.querySelector('.modal-content');
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        modalContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 10);
}

/**
 * Display current orders
 */
function displayCurrentOrders() {
    if (!currentOrdersContainer) return;
    
    // Get current orders
    const orders = getOrders();
    
    // Filter to only show recent pending orders (last 24 hours)
    const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.orderTime);
        const now = new Date();
        const timeDiff = now - orderDate;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        return hoursDiff < 24 && order.status === 'pending';
    });
    
    // Clear container
    currentOrdersContainer.innerHTML = '';
    
    if (recentOrders.length === 0) {
        currentOrdersContainer.innerHTML = `
            <div class="empty-state">
                <p>No current orders. Order something delicious!</p>
            </div>
        `;
        return;
    }
    
    // Create and display order cards
    recentOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        currentOrdersContainer.appendChild(orderCard);
    });
}

/**
 * Create an order card element
 * @param {Object} order - Order object
 * @returns {HTMLElement} - Order card element
 */
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    const pickupTime = new Date(order.estimatedPickupTime);
    const formattedTime = pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    orderCard.innerHTML = `
        <div class="order-header">
            <h3>Order #${order.id}</h3>
            <span class="order-status">${order.status}</span>
        </div>
        <div class="order-details">
            <p><strong>${order.item.name}</strong> x${order.quantity}</p>
            <p>Est. Pickup: ${formattedTime}</p>
            <a href="order-details.html?id=${order.id}" class="btn btn-small btn-primary">View Details</a>
        </div>
    `;
    
    return orderCard;
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
 * Load menu items from storage
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
        'breakfast': 'Breakfast',
        'lunch': 'Lunch',
        'main-courses': 'Main Course',
        'snacks': 'Snack',
        'drinks': 'Drink'
    };
    
    return categories[category] || 'Other';
}

/**
 * Generate a unique order ID
 * @returns {string} - Unique order ID
 */
function generateOrderId() {
    // Simple order number format: current timestamp + random chars
    return Math.floor(Math.random() * 900 + 100).toString();
}

/**
 * Calculate estimated pickup time (15-30 minutes from now)
 * @returns {string} - ISO string of estimated pickup time
 */
function getEstimatedPickupTime() {
    const now = new Date();
    // Random time between 15-30 minutes from now
    const minutesToAdd = Math.floor(Math.random() * 16) + 15;
    const pickupTime = new Date(now.getTime() + minutesToAdd * 60000);
    return pickupTime.toISOString();
}

/**
 * Save order to localStorage
 * @param {Object} order - Order to save
 */
function saveOrder(order) {
    // Get existing orders
    const orders = getOrders();
    
    // Add new order
    orders.push(order);
    
    // Save to localStorage
    localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
}

/**
 * Get all orders from localStorage
 * @returns {Array} - Array of orders
 */
function getOrders() {
    return JSON.parse(localStorage.getItem('campus_cafe_orders')) || [];
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

/**
 * Clean up resources when page is unloaded
 */
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// Initialize menu page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize menu
    initMenu();
    
    // Update cart badge
    updateCartBadge();
    
    // Update customer stats
    updateCustomerStats();
});

/**
 * Update cart badge
 */
function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    if (!cartBadge) return;
    
    // Get the total number of items in the cart
    const totalItems = cartManager.getTotalItems();
    
    // Update the badge
    cartBadge.textContent = totalItems;
    
    // Show or hide badge based on cart contents
    if (totalItems > 0) {
        cartBadge.style.display = 'flex';
    } else {
        cartBadge.style.display = 'none';
    }
}

/**
 * Update customer stats in footer
 */
function updateCustomerStats() {
    // Get stats elements
    const customersToday = document.getElementById('customers-today');
    const customersTotal = document.getElementById('customers-total');
    const ordersCount = document.getElementById('orders-count');
    
    if (!customersToday || !customersTotal || !ordersCount) return;
    
    // Get stats from storage
    const stats = JSON.parse(localStorage.getItem('campus_cafe_stats')) || {
        customersServedToday: 0,
        customersEverServed: 0,
        ordersSubmitted: 0
    };
    
    // Get orders to count total submissions
    const orders = storageManager.getOrders() || [];
    stats.ordersSubmitted = orders.length;
    
    // Update elements with animation
    animateCounter(customersToday, 0, stats.customersServedToday);
    animateCounter(customersTotal, 0, stats.customersEverServed);
    animateCounter(ordersCount, 0, stats.ordersSubmitted);
}

/**
 * Animate a counter from start to end value
 * @param {HTMLElement} element - Element to update
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in ms
 */
function animateCounter(element, start, end, duration = 1000) {
    if (!element) return;
    
    // Ensure minimum values for visual effect
    end = Math.max(end, 5);
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end;
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Add an item to cart directly from the menu
 * @param {Object} item - Menu item data
 */
function addToCartDirectly(item) {
    // Add to cart with quantity 1
    cartManager.addToCart(item, 1);
    
    // Update cart badge
    updateCartBadge();
    
    // Show confirmation
    const confirmationContainer = document.createElement('div');
    confirmationContainer.className = 'order-confirmation-popup';
    confirmationContainer.innerHTML = `
        <div class="confirmation-content">
            <div class="confirmation-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>${item.name} added to cart!</h3>
            <p>Your item has been added to the cart.</p>
            <div class="confirmation-actions">
                <button id="continue-shopping" class="btn btn-secondary">Continue Shopping</button>
                <a href="cart.html" class="btn btn-primary">View Cart</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmationContainer);
    
    // Add animation
    setTimeout(() => {
        confirmationContainer.classList.add('show');
    }, 10);
    
    // Add event listener to continue shopping button
    const continueBtn = confirmationContainer.querySelector('#continue-shopping');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            confirmationContainer.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(confirmationContainer);
            }, 300);
        });
    }
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(confirmationContainer)) {
            confirmationContainer.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(confirmationContainer)) {
                    document.body.removeChild(confirmationContainer);
                }
            }, 300);
        }
    }, 5000);
}

/**
 * Order item now and redirect to checkout
 * @param {Object} item - Menu item data
 */
function orderNowDirectly(item) {
    // Add to cart with quantity 1
    cartManager.addToCart(item, 1);
    
    // Update cart badge
    updateCartBadge();
    
    // Show confirmation briefly before redirecting
    const confirmationContainer = document.createElement('div');
    confirmationContainer.className = 'order-confirmation-popup';
    confirmationContainer.innerHTML = `
        <div class="confirmation-content">
            <div class="confirmation-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>${item.name} added to cart!</h3>
            <p>Redirecting to checkout...</p>
        </div>
    `;
    
    document.body.appendChild(confirmationContainer);
    
    // Add animation
    setTimeout(() => {
        confirmationContainer.classList.add('show');
    }, 10);
    
    // Redirect to cart after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 1500);
}

/**
 * Update the UI to reflect active filters
 * @param {string} category - Active category
 * @param {string} searchTerm - Active search term
 */
function updateFilterUI(category, searchTerm) {
    // Update search input
    if (searchInput && searchTerm !== searchInput.value) {
        searchInput.value = searchTerm;
    }
    
    // Update clear search button visibility
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
    }
    
    // Update category tabs
    menuTabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}
