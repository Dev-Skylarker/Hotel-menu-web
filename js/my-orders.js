/**
 * My Orders Page Script
 * Handles displaying the user's orders from localStorage and Supabase
 */

// DOM Elements
const ordersContainer = document.getElementById('orders-container');
const cartBadge = document.getElementById('cart-badge');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const clearAllOrdersBtn = document.getElementById('clear-all-orders-btn');
const admissionNumberFilter = document.getElementById('admission-number-filter');
const applyFilterBtn = document.getElementById('apply-filter-btn');
const clearFilterBtn = document.getElementById('clear-filter-btn');

// Auto-refresh interval (in milliseconds)
const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds
let autoRefreshTimer = null;

// Create a currency formatter
const currencyFormatter = {
    format: function(amount) {
        // Use the global formatters if available
        if (window.formatters && window.formatters.currency) {
            return window.formatters.currency(amount, true);
        }
        
        // Fallback formatting
        return `KSh ${parseFloat(amount).toFixed(2)}`;
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', initMyOrdersPage);

/**
 * Initialize My Orders page
 */
function initMyOrdersPage() {
    // Check URL parameters for test/demo functions
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle test actions based on URL parameters
    if (urlParams.has('action')) {
        const action = urlParams.get('action');
        switch (action) {
            case 'create-example':
                createExampleOrder();
                break;
            case 'remove-example':
                removeExampleOrder();
                break;
            case 'undo-cancel':
                if (urlParams.has('id')) {
                    restoreOrder(urlParams.get('id'));
                } else {
                    undoCancelSpecificOrder();
                }
                break;
            case 'clear-all':
                clearAllOrders();
                break;
        }
        // Clean up URL after processing
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if there's an admission number in localStorage
    const savedAdmissionNumber = localStorage.getItem('saved_admission_number');
    if (savedAdmissionNumber && admissionNumberFilter) {
        admissionNumberFilter.value = savedAdmissionNumber;
    }
    
    // Add event listeners for filter buttons
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyAdmissionFilter);
    }
    
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearAdmissionFilter);
    }
    
    // Load orders
    loadOrders();
    
    // Update cart badge count
    updateCartBadge();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check for newly placed order
    const lastOrderId = localStorage.getItem('last_order_id');
    if (lastOrderId) {
        // Wait a moment for the orders to load
        setTimeout(() => {
            highlightLastOrder(lastOrderId);
            // Clear the last_order_id after highlighting
            // localStorage.removeItem('last_order_id');
        }, 800);
    }
    
    // Add event listeners
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompletedOrders);
    }
    
    // Add event listener for clear all orders button
    if (clearAllOrdersBtn) {
        clearAllOrdersBtn.addEventListener('click', clearAllOrders);
    }
    
    // Handle storage changes (for updates from other tabs)
    window.addEventListener('storage', handleStorageChange);
}

/**
 * Apply admission number filter
 */
function applyAdmissionFilter() {
    if (!admissionNumberFilter) return;
    
    const admissionNumber = admissionNumberFilter.value.trim();
    
    // Validate the admission number format
    if (admissionNumber && !/^\d{5}$/.test(admissionNumber)) {
        alert('Please enter exactly 5 digits for your admission number');
        admissionNumberFilter.focus();
        return;
    }
    
    // Save the admission number to localStorage
    if (admissionNumber) {
        localStorage.setItem('saved_admission_number', admissionNumber);
    } else {
        localStorage.removeItem('saved_admission_number');
    }
    
    // Reload orders with the filter
    loadOrders();
}

/**
 * Clear admission number filter
 */
function clearAdmissionFilter() {
    if (admissionNumberFilter) {
        admissionNumberFilter.value = '';
    }
    
    // Remove from localStorage
    localStorage.removeItem('saved_admission_number');
    
    // Reload orders without filter
    loadOrders();
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
    // Clear any existing timer
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
    
    // Set new timer
    autoRefreshTimer = setInterval(refreshOrders, AUTO_REFRESH_INTERVAL);
}

/**
 * Stop auto-refresh timer
 */
function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

/**
 * Refresh orders data and update the display
 * Called by auto-refresh timer and when changes are detected
 */
function refreshOrders() {
    // Load orders regardless of visibility to ensure data is fresh
    loadOrders();
    updateCartBadge();
}

/**
 * Handle page visibility changes
 * Manages resources by pausing auto-refresh when page is hidden
 */
function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden, stop auto-refresh to save resources
        stopAutoRefresh();
    } else {
        // Page is visible again, refresh immediately and restart auto-refresh
        refreshOrders();
        startAutoRefresh();
    }
}

/**
 * Handle changes to localStorage
 * @param {Event} e - Storage event
 */
function handleStorageChange(e) {
    // Refresh when orders or cart data changes
    if (e.key === 'campus_cafe_orders' || e.key === 'campus_cafe_cart') {
        refreshOrders();
    }
}

/**
 * Load and display all orders
 */
async function loadOrders() {
    if (!ordersContainer) return;
    
    // Show loading state
    ordersContainer.innerHTML = '<div class="loader"></div>';
    
    // Check if user is logged in via Supabase
    let currentUser = null;
    let userAdmissionNumber = null;
    
    if (typeof supabaseManager !== 'undefined') {
        try {
            const { user, error } = await supabaseManager.getCurrentUser();
            if (!error && user) {
                currentUser = user;
                
                // Try to get user profile with admission number
                const { data: profile, error: profileError } = await supabaseManager.getUserProfile(user.id);
                if (!profileError && profile && profile.admission_number) {
                    userAdmissionNumber = profile.admission_number;
                    console.log(`User is logged in with admission number: ${userAdmissionNumber}`);
                }
            }
        } catch (err) {
            console.error('Error checking user login status:', err);
        }
    }
    
    // Get the saved admission number filter - prioritize user selection over logged in user
    let admissionNumber = admissionNumberFilter ? 
                        admissionNumberFilter.value.trim() : 
                        localStorage.getItem('saved_admission_number');
    
    // If no filter is set but user is logged in with admission number, use that
    if (!admissionNumber && userAdmissionNumber) {
        admissionNumber = userAdmissionNumber;
        
        // Update the filter input if it exists
        if (admissionNumberFilter) {
            admissionNumberFilter.value = userAdmissionNumber;
        }
    }
    
    try {
        let orders = [];
        
        // Try to get orders from Supabase if available
        if (typeof supabaseManager !== 'undefined') {
            console.log('Attempting to load orders from Supabase...');
            
            const options = {
                orderBy: 'created_at',
                ascending: false
            };
            
            // Add admission number filter if provided
            if (admissionNumber) {
                options.admissionNumber = admissionNumber;
            } else if (currentUser) {
                // If user is logged in but no admission number, filter by user ID
                options.userId = currentUser.id;
            }
            
            const { data, error, offlineOnly } = await supabaseManager.getOrders(options);
            
            if (!error && data) {
                orders = data;
                console.log(`Found ${orders.length} orders in Supabase`);
            } else if (error) {
                console.error('Error loading orders from Supabase:', error);
            } else if (offlineOnly) {
                console.log('Operating in offline mode');
            }
        }
        
        // Fall back to localStorage if needed or if Supabase is not available
        if (orders.length === 0) {
            console.log('Falling back to localStorage...');
            orders = storageManager.getOrders();
            
            // Apply admission number filter if provided
            if (admissionNumber) {
                orders = orders.filter(order => order.admissionNumber === admissionNumber);
            }
            
            // Sort orders by date (newest first)
            orders = orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
            
            console.log(`Found ${orders.length} orders in localStorage`);
        }
        
        // Filter active orders (pending or ready)
        const activeOrders = orders.filter(order => 
            order.status === 'pending' || order.status === 'ready');
        
        // Check if there are any active orders
        if (activeOrders.length === 0) {
            displayEmptyState();
            return;
        }
        
        // Display active orders
        displayOrders(activeOrders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        displayEmptyState('An error occurred while loading your orders. Please try again later.');
    }
}

/**
 * Display all orders
 * @param {Array} orders - Array of order objects
 */
function displayOrders(orders) {
    if (!ordersContainer) return;
    
    // Clear container
    ordersContainer.innerHTML = '';
    
    // Add each order
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

/**
 * Create an order card element
 * @param {Object} order - Order data
 * @returns {HTMLElement} - Order card element
 */
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.id = `order-${order.id}`;
    
    // Get formatted date/time
    const orderDate = new Date(order.orderTime);
    const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = orderDate.toLocaleDateString([], { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    // Format total amount
    const formattedTotal = currencyFormatter.format(order.totalAmount);
    
    // Get status class
    const statusClass = `status-${order.status.toLowerCase()}`;
    
    // Build card HTML
    card.innerHTML = `
        <div class="order-header">
            <h3>Order #${order.orderNumber || order.id.substring(0, 8)}</h3>
            <span class="order-status ${statusClass}">${order.status}</span>
        </div>
        <div class="order-details">
            <p><strong>Date & Time:</strong> ${formattedDate} at ${formattedTime}</p>
            <p><strong>Admission #:</strong> ${order.admissionNumber || 'Not provided'}</p>
            <p><strong>Total:</strong> ${formattedTotal}</p>
            <p><strong>Items:</strong></p>
            <ul class="order-items">
                ${order.items.map(item => `
                    <li>${item.quantity}x ${item.name} - ${currencyFormatter.format(item.price * item.quantity)}</li>
                `).join('')}
            </ul>
            ${order.paymentInstructions ? `
                <p><strong>Payment Instructions:</strong> ${order.paymentInstructions}</p>
            ` : ''}
        </div>
        <div class="order-footer">
            <div class="action-buttons">
                ${order.status === 'ready' ? `
                    <button class="btn btn-sm mark-collected-btn" data-order-id="${order.id}">
                        Mark as Collected
                    </button>
                ` : ''}
                <a href="order-details.html?id=${order.id}" class="btn btn-sm btn-primary">
                    View Details
                </a>
            </div>
            <span class="order-time">${formattedTime}</span>
        </div>
    `;
    
    // Add event listener for "Mark as Collected" button
    const collectButton = card.querySelector('.mark-collected-btn');
    if (collectButton) {
        collectButton.addEventListener('click', () => {
            markOrderAsCompleted(order.id);
        });
    }
    
    return card;
}

/**
 * Display empty state when no orders
 * Shows different messages and options based on whether there are past orders
 * or no orders at all. Provides buttons to view menu, cart, and past orders.
 */
function displayEmptyState() {
    if (!ordersContainer) return;
    
    // Get all orders
    const allOrders = storageManager.getOrders();
    
    // Check if there are past orders (completed or cancelled)
    const pastOrders = allOrders.filter(order => 
        order.status === 'completed' || order.status === 'cancelled');
    
    // Check if we have any completed orders
    const hasCompletedOrders = pastOrders.some(order => order.status === 'completed');
    
    ordersContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-receipt"></i>
            <h3>${allOrders.length === 0 ? 'No Orders Found' : 'No Pending Orders'}</h3>
            <p>${allOrders.length === 0 
                ? 'You don\'t have any orders yet.' 
                : 'You don\'t have any pending orders at the moment.'}</p>
            
            <div class="empty-state-actions">
                <p class="action-prompt">What would you like to do?</p>
                <div class="empty-action-buttons">
                    <a href="menu.html" class="btn btn-primary"><i class="fas fa-utensils"></i> View Menu</a>
                    <a href="cart.html" class="btn btn-secondary"><i class="fas fa-shopping-cart"></i> View Cart</a>
                    ${pastOrders.length > 0 
                        ? `<button id="view-past-orders-btn" class="btn btn-info"><i class="fas fa-history"></i> View Past Orders</button>` 
                        : ''}
                </div>
            </div>
            
            ${allOrders.length === 0 ? `
            <div class="note-container">
                <div class="note">
                    <p><i class="fas fa-info-circle"></i> Orders placed through the menu or cart will appear here. You can track their status and receive updates until they're ready for collection.</p>
                </div>
            </div>` : ''}
        </div>
        ${pastOrders.length > 0 
            ? `<div id="past-orders-container" class="orders-container" style="display: none;">
                <h3 class="section-title">${hasCompletedOrders ? 'Completed Orders' : 'Past Orders'}</h3>
                <div class="past-orders-list"></div>
              </div>` 
            : ''}
    `;
    
    // Add event listener for View Past Orders button
    const viewPastOrdersBtn = document.getElementById('view-past-orders-btn');
    if (viewPastOrdersBtn) {
        viewPastOrdersBtn.addEventListener('click', () => {
            displayPastOrders(pastOrders);
        });
    }
}

/**
 * Display past orders
 * @param {Array} pastOrders - Array of past orders
 */
function displayPastOrders(pastOrders) {
    const pastOrdersContainer = document.getElementById('past-orders-container');
    if (!pastOrdersContainer) return;
    
    // Show the container
    pastOrdersContainer.style.display = 'block';
    
    // Get the list container
    const pastOrdersList = pastOrdersContainer.querySelector('.past-orders-list');
    if (!pastOrdersList) return;
    
    // Clear container
    pastOrdersList.innerHTML = '';
    
    // Check if there are any past orders
    if (pastOrders.length === 0) {
        pastOrdersList.innerHTML = `
            <div class="empty-state">
                <p>No past orders found.</p>
            </div>
        `;
        return;
    }
    
    // Add each order
    pastOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        pastOrdersList.appendChild(orderCard);
    });
    
    // Scroll to past orders
    pastOrdersContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 */
function cancelOrder(orderId) {
    // Get the order first
    const orders = storageManager.getOrders();
    const orderToCancel = orders.find(order => order.id === orderId);
    
    if (!orderToCancel) {
        showMessage('Order not found');
        return;
    }
    
    // Update order status in storage
    const updatedOrder = storageManager.updateOrderStatus(orderId, 'cancelled');
    
    if (updatedOrder) {
        // Add the item back to the cart
        cartManager.addToCart(orderToCancel.item, orderToCancel.quantity);
        
        // Reload orders to reflect changes
        refreshOrders();
        
        // Show success message
        showMessage('Order cancelled successfully. Item has been added back to your cart.');
    } else {
        // Show error message
        showMessage('Failed to cancel order. Please try again.');
    }
}

/**
 * Show a message to the user
 * @param {string} message - Message to display
 */
function showMessage(message) {
    // Create message element if it doesn't exist
    if (!document.getElementById('message-alert')) {
        const messageElement = document.createElement('div');
        messageElement.id = 'message-alert';
        messageElement.className = 'message-alert';
        document.body.appendChild(messageElement);
    }
    
    // Get message element
    const messageAlert = document.getElementById('message-alert');
    
    // Set message text
    messageAlert.textContent = message;
    
    // Show message
    messageAlert.classList.add('show');
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageAlert.classList.remove('show');
    }, 3000);
}

/**
 * Update the cart badge with current number of items
 */
function updateCartBadge() {
    if (!cartBadge) return;
    
    // Get the total number of items in the cart
    const totalItems = cartManager.getTotalItems();
    
    // Update the badge
    cartBadge.textContent = totalItems;
    
    // Toggle badge visibility
    if (totalItems > 0) {
        cartBadge.style.display = 'flex';
    } else {
        cartBadge.style.display = 'none';
    }
}

/**
 * Clear completed orders
 */
async function clearCompletedOrders() {
    if (!confirm('Are you sure you want to clear all completed and cancelled orders?')) {
        return;
    }
    
    try {
        let success = false;
        
        // Try to delete from Supabase if available
        if (typeof supabaseManager !== 'undefined') {
            console.log('Attempting to clear completed orders from Supabase...');
            
            // For Supabase, we'll just update the visibility flag rather than delete
            const { data, error } = await supabaseManager.updateOrdersVisibility({
                statuses: ['completed', 'cancelled'],
                visible: false
            });
            
            if (!error) {
                success = true;
                console.log('Successfully hidden completed/cancelled orders in Supabase');
            } else {
                console.error('Error clearing orders in Supabase:', error);
            }
        }
        
        // Fall back to localStorage or if Supabase is not available
        if (!success) {
            console.log('Falling back to localStorage...');
            
            // Get all orders
            const orders = storageManager.getOrders();
            
            // Filter out completed and cancelled orders
            const remainingOrders = orders.filter(order => 
                order.status !== 'completed' && order.status !== 'cancelled');
            
            // Save remaining orders
            localStorage.setItem(storageManager.ORDERS_KEY, JSON.stringify(remainingOrders));
            
            console.log(`Cleared ${orders.length - remainingOrders.length} orders from localStorage`);
        }
        
        // Reload orders
        refreshOrders();
        
        // Show success message
        showAlert('Completed and cancelled orders have been cleared');
        
    } catch (error) {
        console.error('Error clearing completed orders:', error);
        showAlert('Failed to clear orders. Please try again.', 'error');
    }
}

/**
 * Clear all orders
 */
async function clearAllOrders() {
    if (!confirm('Are you sure you want to clear ALL orders? This cannot be undone.')) {
        return;
    }
    
    try {
        let success = false;
        
        // Try to clear from Supabase if available
        if (typeof supabaseManager !== 'undefined') {
            console.log('Attempting to clear all orders from Supabase...');
            
            // For Supabase, we'll just update the visibility flag rather than delete
            const { data, error } = await supabaseManager.updateOrdersVisibility({
                visible: false
            });
            
            if (!error) {
                success = true;
                console.log('Successfully hidden all orders in Supabase');
            } else {
                console.error('Error clearing orders in Supabase:', error);
            }
        }
        
        // Fall back to localStorage or if Supabase is not available
        if (!success) {
            console.log('Clearing all orders from localStorage...');
            localStorage.setItem(storageManager.ORDERS_KEY, '[]');
        }
        
        // Reload orders
        refreshOrders();
        
        // Show success message
        showAlert('All orders have been cleared');
        
    } catch (error) {
        console.error('Error clearing all orders:', error);
        showAlert('Failed to clear orders. Please try again.', 'error');
    }
}

/**
 * Restore a cancelled order
 * @param {string} orderId - Order ID to restore
 */
function restoreOrder(orderId) {
    // Get the order first
    const orders = storageManager.getOrders();
    const orderToRestore = orders.find(order => order.id === orderId);
    
    if (!orderToRestore) {
        showMessage('Order not found');
        return;
    }
    
    // Update order status in storage
    storageManager.updateOrderStatus(orderId, 'pending');
    
    // Remove the item from cart if it was added there
    const cartItems = cartManager.getCart();
    const matchingCartItem = cartItems.find(item => 
        item.item.id === orderToRestore.item.id
    );
    
    if (matchingCartItem) {
        // If the item exists in the cart, remove it
        cartManager.removeFromCart(orderToRestore.item.id);
    }
    
    // Refresh orders
    refreshOrders();
    
    // Show success message
    showMessage('Order has been restored to pending status.');
}

/**
 * Undo cancel for a specific order
 * This is a specialized function to handle the specific order in the screenshot
 */
function undoCancelSpecificOrder() {
    // Get the specific order ID from the screenshot
    const orderId = "ORD-4833-9759";
    
    // Get all orders
    const orders = storageManager.getOrders();
    
    // Find the specific order
    const specificOrder = orders.find(order => order.id === orderId);
    
    if (specificOrder) {
        // Change status back to pending
        storageManager.updateOrderStatus(orderId, 'pending');
        
        // Reload orders to reflect changes
        loadOrders();
        
        // Update cart badge
        updateCartBadge();
        
        // Show success message
        showMessage('Order #ORD-4833-9759 has been restored to pending status.');
    } else {
        // If the order doesn't exist yet, create it (for the screenshot example)
        const newOrder = {
            id: orderId,
            item: {
                id: 'salad1',
                name: 'Grilled Chicken Salad',
                price: 950.00,
                category: 'lunch'
            },
            quantity: 1,
            status: 'pending',
            customerName: 'Current User',
            orderTime: new Date().toISOString(),
            estimatedPickupTime: new Date(new Date().getTime() + 20 * 60000).toISOString(), // 20 minutes from now
            paymentMethod: 'cash'
        };
        
        // Get current orders array
        const currentOrders = storageManager.getOrders();
        
        // Add the new order
        currentOrders.push(newOrder);
        
        // Save back to storage
        localStorage.setItem('campus_cafe_orders', JSON.stringify(currentOrders));
        
        // Reload orders to reflect changes
        loadOrders();
        
        // Show success message
        showMessage('Order has been restored to pending status.');
    }
}

/**
 * Create the example order from the screenshot for testing
 * This is just for demonstration purposes
 */
function createExampleOrder() {
    const orderId = "ORD-4833-9759";
    
    // Get current orders array
    const currentOrders = storageManager.getOrders();
    
    // Check if order already exists
    if (currentOrders.some(order => order.id === orderId)) {
        showMessage('Example order already exists');
        return;
    }
    
    // Create the example order
    const exampleOrder = {
        id: orderId,
        item: {
            id: 'salad1',
            name: 'Grilled Chicken Salad',
            price: 950.00,
            category: 'lunch'
        },
        quantity: 1,
        status: 'cancelled', // Start as cancelled
        customerName: 'Current User',
        orderTime: new Date("2025-03-31T02:59:00").toISOString(), // As shown in screenshot
        estimatedPickupTime: new Date("2025-03-31T03:19:00").toISOString(), // As shown in screenshot
        paymentMethod: 'cash'
    };
    
    // Add the order
    currentOrders.push(exampleOrder);
    
    // Save back to storage
    localStorage.setItem('campus_cafe_orders', JSON.stringify(currentOrders));
    
    // Reload orders to reflect changes
    loadOrders();
    
    // Show success message
    showMessage('Example order has been created');
}

/**
 * Remove the specific example order shown in the screenshot
 */
function removeExampleOrder() {
    const orderId = "ORD-4833-9759";
    
    // Get current orders
    const currentOrders = storageManager.getOrders();
    
    // Filter out the example order
    const updatedOrders = currentOrders.filter(order => order.id !== orderId);
    
    // Save back to storage
    localStorage.setItem('campus_cafe_orders', JSON.stringify(updatedOrders));
    
    // Reload orders to reflect changes
    loadOrders();
    
    // Show success message
    showMessage('Example order has been removed');
}

/**
 * Highlight the most recent order
 * @param {string} orderId - Order ID to highlight
 */
function highlightLastOrder(orderId) {
    const orderCard = document.getElementById(`order-${orderId}`);
    if (!orderCard) return;
    
    // Add highlight class to the order card
    orderCard.classList.add('highlight-order');
    
    // Scroll to the order card
    orderCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove highlight after a delay
    setTimeout(() => {
        orderCard.classList.remove('highlight-order');
    }, 5000);
}

/**
 * Show alert message
 * @param {string} message - Message to display
 * @param {string} type - Alert type ('success' or 'error')
 */
function showAlert(message, type = 'success') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `message-alert ${type === 'error' ? 'error' : 'success'}`;
    alert.textContent = message;
    
    // Add to body
    document.body.appendChild(alert);
    
    // Show alert
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);
    
    // Hide alert after delay
    setTimeout(() => {
        alert.classList.remove('show');
        
        // Remove from DOM after animation
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 300);
    }, 3000);
}

/**
 * Mark an order as collected (completed)
 * Updates the order status in storage and shows a thank you modal
 * @param {string} orderId - Order ID to mark as collected
 */
function markAsCollected(orderId) {
    // Get the order first to store its details
    const orders = storageManager.getOrders();
    const orderToComplete = orders.find(order => order.id === orderId);
    
    if (!orderToComplete) {
        showMessage('Order not found');
        return;
    }
    
    // Update order status in storage
    const result = storageManager.updateOrderStatus(orderId, 'completed');
    
    if (result) {
        // Refresh orders display
        refreshOrders();
        
        // Show thank you modal
        showThankYouModal(orderId);
    } else {
        // Show error message
        showMessage('Failed to update order status. Please try again.');
    }
}

/**
 * Show a thank you modal after marking an order as collected
 * Creates a modal if it doesn't exist, or reuses an existing one
 * @param {string} orderId - The ID of the collected order
 */
function showThankYouModal(orderId) {
    // Create modal if it doesn't exist
    if (!document.getElementById('thank-you-modal')) {
        const modal = document.createElement('div');
        modal.id = 'thank-you-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-body text-center">
                    <i class="fas fa-check-circle success-icon"></i>
                    <h2>Thank You!</h2>
                    <p>Your order has been marked as collected.</p>
                    <p>We hope you enjoy your meal!</p>
                    <div class="modal-actions">
                        <a href="menu.html" class="btn btn-primary">Back to Menu</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Show the modal
    const modal = document.getElementById('thank-you-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Execute this immediately when testing with the specific order from the screenshot
// To use this in production, you would trigger it with a button or UI action
// Comment this out when not specifically testing with the order from screenshot
// undoCancelSpecificOrder(); 

// Uncomment these lines to create or remove the example order for testing
// document.addEventListener('DOMContentLoaded', createExampleOrder);
// document.addEventListener('DOMContentLoaded', removeExampleOrder); 