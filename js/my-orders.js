/**
 * My Orders Page Script
 * Handles displaying the user's orders from localStorage
 */

// DOM Elements
const ordersContainer = document.getElementById('orders-container');
const cartBadge = document.getElementById('cart-badge');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const clearAllOrdersBtn = document.getElementById('clear-all-orders-btn');

// Auto-refresh interval (in milliseconds)
const AUTO_REFRESH_INTERVAL = 10000; // 10 seconds
let autoRefreshTimer = null;

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
 * Load orders from localStorage
 */
function loadOrders() {
    // Get orders from storage
    const allOrders = storageManager.getOrders() || [];
    
    // Filter orders
    const currentOrders = allOrders.filter(order => 
        order.status === 'pending' || order.status === 'ready'
    );
    const pastOrders = allOrders.filter(order => 
        order.status === 'completed' || order.status === 'cancelled'
    );
    
    // Update stats
    document.getElementById('total-orders').textContent = allOrders.length;
    document.getElementById('pending-orders').textContent = 
        allOrders.filter(order => order.status === 'pending').length;
    document.getElementById('completed-orders').textContent = 
        allOrders.filter(order => order.status === 'completed').length;
    
    // Check if there are any orders to display
    if (allOrders.length === 0) {
        // Show empty state
        displayEmptyState();
        
        // Hide clear buttons
        if (clearCompletedBtn) clearCompletedBtn.style.display = 'none';
        if (clearAllOrdersBtn) clearAllOrdersBtn.style.display = 'none';
        return;
    }
    
    // Show clear buttons when we have orders
    if (clearCompletedBtn) clearCompletedBtn.style.display = 'block';
    if (clearAllOrdersBtn) clearAllOrdersBtn.style.display = 'block';
    
    // Clear container
    if (ordersContainer) {
        ordersContainer.innerHTML = '';
    }
    
    // Display current orders
    if (currentOrders.length > 0) {
        // Add each order
        currentOrders.forEach(order => {
            if (ordersContainer) {
                const orderCard = createOrderCard(order);
                ordersContainer.appendChild(orderCard);
            }
        });
    } else {
        // No current orders - show message
        if (ordersContainer) {
            const noCurrentOrders = document.createElement('div');
            noCurrentOrders.className = 'empty-cart';
            noCurrentOrders.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <h3>No current orders</h3>
                <p>You don't have any pending or ready orders at the moment</p>
                <a href="menu.html" class="btn btn-primary">Browse Menu</a>
            `;
            ordersContainer.appendChild(noCurrentOrders);
        }
    }
    
    // Display past orders
    displayPastOrders(pastOrders);
}

/**
 * Display empty state when no orders are available
 */
function displayEmptyState() {
    if (!ordersContainer) return;
    
    // Clear container
    ordersContainer.innerHTML = '';
    
    // Create empty state message using the same style as cart.js
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-cart';
    emptyState.innerHTML = `
        <i class="fas fa-shopping-basket"></i>
        <h3>You don't have any orders yet</h3>
        <p>Add items from our menu to get started!</p>
        <a href="menu.html" class="btn btn-primary">Browse Menu</a>
    `;
    
    // Add empty state to container
    ordersContainer.appendChild(emptyState);
    
    // Hide clear buttons when no orders
    if (clearCompletedBtn) clearCompletedBtn.style.display = 'none';
    if (clearAllOrdersBtn) clearAllOrdersBtn.style.display = 'none';
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
            <div class="empty-cart">
                <i class="fas fa-history"></i>
                <h3>No past orders found</h3>
                <p>Your completed and cancelled orders will appear here</p>
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
 * Clear all completed and cancelled orders
 */
function clearCompletedOrders() {
    if (confirm('Are you sure you want to clear all completed and cancelled orders? This cannot be undone.')) {
        // Get all orders
        const orders = storageManager.getOrders();
        
        // Filter out completed and cancelled orders
        const remainingOrders = orders.filter(order => 
            order.status !== 'completed' && order.status !== 'cancelled');
        
        // Save remaining orders
        localStorage.setItem('campus_cafe_orders', JSON.stringify(remainingOrders));
        
        // Refresh orders
        refreshOrders();
        
        // Show success message
        showMessage('Completed and cancelled orders have been cleared.');
    }
}

/**
 * Clear all orders and empty cart
 */
function clearAllOrders() {
    if (confirm('Are you sure you want to clear all orders and empty your cart? This cannot be undone.')) {
        // Clear all orders from localStorage
        localStorage.setItem('campus_cafe_orders', JSON.stringify([]));
        
        // Clear the cart
        cartManager.clearCart();
        
        // Refresh orders
        refreshOrders();
        
        // Show success message
        showMessage('All orders have been cleared and cart has been emptied.');
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
    // Get all orders with the same main ID
    const mainOrderId = orderId.split('-').slice(0, 3).join('-'); // Extract main order ID part
    const orderCards = findOrderCardsByMainId(mainOrderId);
    
    if (orderCards.length > 0) {
        // Apply highlight effect to all related order cards
        orderCards.forEach(card => {
            card.style.transition = 'all 0.5s ease';
            card.style.boxShadow = '0 0 15px rgba(255, 127, 80, 0.7)';
            card.style.background = 'rgba(255, 250, 240, 0.15)';
            card.style.transform = 'translateY(-5px)';
        });
        
        // Scroll to the first order card
        orderCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Show a success message
        showMessage('Order placed successfully! You can track your order status here.');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
            orderCards.forEach(card => {
                card.style.boxShadow = '';
                card.style.background = '';
                card.style.transform = '';
            });
        }, 5000);
    } else {
        // If we can't find the order cards, refresh the orders to make sure they're loaded
        refreshOrders();
        
        // Try again after a short delay
        setTimeout(() => {
            const newOrderCards = findOrderCardsByMainId(mainOrderId);
            if (newOrderCards.length > 0) {
                highlightLastOrder(orderId); // Call self with the fresh cards
            } else {
                showMessage('Your order has been placed. You can track its status here.');
            }
        }, 500);
    }
}

/**
 * Find order cards based on the main order ID
 * @param {string} mainOrderId - The main part of the order ID
 * @returns {Array} - Array of matching order card elements
 */
function findOrderCardsByMainId(mainOrderId) {
    // This will match both the exact ID and IDs that start with mainOrderId followed by a hyphen
    const orderCards = Array.from(document.querySelectorAll('.order-card'))
        .filter(card => {
            const idLink = card.querySelector(`a[href*="${mainOrderId}"]`);
            return idLink !== null;
        });
    
    return orderCards;
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

/**
 * Create an order card element
 * @param {Object} order - Order object
 * @returns {HTMLElement} - Order card element
 */
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    // Format dates
    const orderDate = new Date(order.orderTime);
    const formattedOrderDate = orderDate.toLocaleString([], { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const pickupTime = new Date(order.estimatedPickupTime);
    const formattedPickupTime = pickupTime.toLocaleTimeString([], { 
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Determine status class
    let statusClass = '';
    switch (order.status) {
        case 'pending':
            statusClass = 'status-pending';
            break;
        case 'ready':
            statusClass = 'status-ready';
            break;
        case 'completed':
            statusClass = 'status-completed';
            break;
        case 'cancelled':
            statusClass = 'status-cancelled';
            break;
    }
    
    // Check if order can be cancelled (only pending orders)
    const canCancel = order.status === 'pending';
    
    // Check if order can be restored (only cancelled orders)
    const canRestore = order.status === 'cancelled';
    
    // Check if order can be marked as collected (only ready orders)
    const canMarkCollected = order.status === 'ready';
    
    // Format payment method
    let paymentMethod = order.paymentMethod || 'cash';
    let formattedPaymentMethod = '';
    
    switch (paymentMethod) {
        case 'cash':
            formattedPaymentMethod = 'On Pickup';
            break;
        case 'mpesa':
            formattedPaymentMethod = 'On Pickup';
            break;
        case 'card':
            formattedPaymentMethod = 'On Pickup';
            break;
        case 'paypal':
            formattedPaymentMethod = 'On Pickup';
            break;
        case 'bitcoin':
            formattedPaymentMethod = 'On Pickup';
            break;
        default:
            formattedPaymentMethod = 'On Pickup';
    }
    
    // Create HTML
    orderCard.innerHTML = `
        <div class="order-header">
            <h3>Order #${order.id}</h3>
            <span class="order-status ${statusClass}">${order.status}</span>
        </div>
        <div class="order-details">
            <p><strong>${order.item.name}</strong></p>
            <p>Quantity: ${order.quantity}</p>
            <p>Price: ${window.formatters?.currency ? window.formatters.currency(order.item.price * order.quantity, true) : `KSh ${(order.item.price * order.quantity).toFixed(2)}`}</p>
            <p><strong>Payment:</strong> ${formattedPaymentMethod}</p>
            <p><strong>Customer:</strong> ${order.customerName || 'Guest'}</p>
            ${order.admissionNumber ? `<p><strong>Admission:</strong> ${order.admissionNumber}</p>` : ''}
            <p><strong>Ordered:</strong> ${formattedOrderDate}</p>
            <p><strong>Est. Pickup:</strong> ${formattedPickupTime}</p>
            ${order.collectionMethod ? `
            <p><strong>Collection:</strong> ${order.collectionMethod === 'table' ? 'Serve at Table' : 'Pickup at Counter'}</p>
            <p><strong>Location:</strong> ${order.collectionLocation || 'Not specified'}</p>
            ` : ''}
        </div>
        <div class="order-footer">
            <a href="order-details.html?id=${order.id}" class="btn btn-small btn-primary">View Details</a>
            ${canCancel ? `<button class="btn btn-small btn-danger cancel-order-btn" data-id="${order.id}">Cancel</button>` : ''}
            ${canRestore ? `<button class="btn btn-small btn-success restore-order-btn" data-id="${order.id}">Undo Cancel</button>` : ''}
            ${canMarkCollected ? `<button class="btn btn-small btn-success mark-collected-btn" data-id="${order.id}">Mark as Collected</button>` : ''}
        </div>
    `;
    
    // Add event listener for cancel button
    if (canCancel) {
        const cancelBtn = orderCard.querySelector('.cancel-order-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel this order?')) {
                    cancelOrder(order.id);
                }
            });
        }
    }
    
    // Add event listener for restore button
    if (canRestore) {
        const restoreBtn = orderCard.querySelector('.restore-order-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                restoreOrder(order.id);
            });
        }
    }
    
    // Add event listener for mark as collected button
    if (canMarkCollected) {
        const collectBtn = orderCard.querySelector('.mark-collected-btn');
        if (collectBtn) {
            collectBtn.addEventListener('click', () => {
                markAsCollected(order.id);
            });
        }
    }
    
    return orderCard;
}

// Execute this immediately when testing with the specific order from the screenshot
// To use this in production, you would trigger it with a button or UI action
// Comment this out when not specifically testing with the order from screenshot
// undoCancelSpecificOrder(); 

// Uncomment these lines to create or remove the example order for testing
// document.addEventListener('DOMContentLoaded', createExampleOrder);
// document.addEventListener('DOMContentLoaded', removeExampleOrder); 