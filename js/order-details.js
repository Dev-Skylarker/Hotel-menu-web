/**
 * Order Details JavaScript for Campus Cafe
 */

// DOM Elements
let orderDetailsContainer;
let orderDetailModal;
let backButton;
let cancelOrderButton;
let confirmPickupButton;
let mobileNavToggle;
let mainNav;

/**
 * Initialize order details page
 */
function initOrderDetails() {
    // Get DOM elements
    orderDetailsContainer = document.getElementById('order-details-container');
    orderDetailModal = document.getElementById('order-detail-modal');
    mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    mainNav = document.querySelector('.main-nav');
    
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    // Get back button
    backButton = document.getElementById('back-to-menu');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
    }
    
    // Add mobile menu toggle functionality
    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            
            const icon = mobileNavToggle.querySelector('i');
            if (icon) {
                if (mainNav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    
    // If no order ID, redirect to menu page
    if (!orderId) {
        window.location.href = 'menu.html';
        return;
    }
    
    // Load order details
    loadOrderDetails(orderId);
}

/**
 * Load order details from localStorage
 * @param {string} orderId - Order ID to load
 */
function loadOrderDetails(orderId) {
    // Get orders from storage
    const orders = storageManager.getOrders();
    
    // Find order by ID
    const order = orders.find(o => o.id === orderId);
    
    // If order not found, show error
    if (!order) {
        if (orderDetailsContainer) {
            orderDetailsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Order not found. The order may have been deleted or the ID is invalid.</p>
                    <button id="back-to-menu-error" class="btn btn-primary">Back to Menu</button>
                </div>
            `;
            
            const backToMenuBtn = document.getElementById('back-to-menu-error');
            if (backToMenuBtn) {
                backToMenuBtn.addEventListener('click', () => {
                    window.location.href = 'menu.html';
                });
            }
        }
        return;
    }
    
    // Display order details
    displayOrderDetails(order);
}

/**
 * Display order details
 * @param {Object} order - Order object
 */
function displayOrderDetails(order) {
    if (!orderDetailsContainer) return;
    
    // Create order details HTML
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
    
    // Calculate when buttons should be shown (only show for pending or ready orders)
    const showButtons = order.status === 'pending' || order.status === 'ready';
    
    // Get the total amount or calculate it
    const totalAmount = order.totalAmount || (order.item.price * order.quantity);
    
    orderDetailsContainer.innerHTML = `
        <div class="order-details-card">
            <div class="order-header">
                <h2>Order #${order.id}</h2>
                <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            
            <div class="order-info">
                <div class="order-item">
                    <img src="${order.item.imageUrl}" alt="${order.item.name}" class="order-item-image">
                    <div class="order-item-details">
                        <h3>${order.item.name}</h3>
                        <p>Quantity: ${order.quantity}</p>
                        <p>Price: ${window.formatters?.currency ? window.formatters.currency(order.item.price * order.quantity, true) : `KSh ${(order.item.price * order.quantity).toFixed(2)}`}</p>
                    </div>
                </div>
                
                <div class="order-meta">
                    <div class="customer-info">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.customerName || 'Guest'}</p>
                        <p><strong>Admission #:</strong> ${order.admissionNumber || 'N/A'}</p>
                    </div>
                    
                    ${order.collectionMethod ? `
                    <div class="collection-info">
                        <h3>Collection Information</h3>
                        <p><strong>Method:</strong> ${order.collectionMethod === 'table' ? 'Serve at Table' : 'Pickup at Counter'}</p>
                        <p><strong>Location:</strong> <span class="highlight">${order.collectionLocation || 'Not specified'}</span></p>
                        ${order.collectionMethod === 'table' 
                            ? `<p>Your order will be served directly to your table once ready.</p>` 
                            : `<p>Please collect your order from Counter 3 when notified that it is ready.</p>`
                        }
                    </div>
                    ` : ''}
                    
                    <div class="promo-ad" style="border-left-color: #FF5722;">
                        <h3>Today's Special Offers</h3>
                        <p><i class="fas fa-fire"></i> <strong>Hot Deal:</strong> Buy any 2 meals and get a free drink!</p>
                        <p><i class="fas fa-star"></i> <strong>Student Discount:</strong> 10% off on all orders with student ID</p>
                        <p class="text-center" style="margin-top: 15px;">
                            <a href="menu.html" class="btn btn-primary">Explore Our Menu</a>
                        </p>
                    </div>
                    
                    <div class="quick-service" style="border-left-color: #4CAF50; margin-top: 15px;">
                        <h3>Express Service</h3>
                        <p><i class="fas fa-clock"></i> <strong>Quick Processing:</strong> All orders are processed within 2 minutes!</p>
                        <p><i class="fas fa-thumbs-up"></i> <strong>Quality Guaranteed:</strong> Fresh ingredients, amazing taste</p>
                    </div>
                    
                    ${order.notes ? `
                    <div class="order-notes">
                        <h3>Notes</h3>
                        <p>${order.notes}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${showButtons ? `
            <div class="order-actions">
                ${order.status === 'pending' ? `
                <button id="cancel-order" class="btn btn-danger">Cancel Order</button>
                ` : ''}
                ${order.status === 'ready' ? `
                <button id="confirm-pickup" class="btn btn-primary">Confirm Pickup</button>
                ` : ''}
            </div>
            ` : ''}
        </div>
    `;
    
    // Add event listeners for buttons if they exist
    if (showButtons) {
        // Cancel order button
        cancelOrderButton = document.getElementById('cancel-order');
        if (cancelOrderButton) {
            cancelOrderButton.addEventListener('click', () => cancelOrder(order.id));
        }
        
        // Confirm pickup button
        confirmPickupButton = document.getElementById('confirm-pickup');
        if (confirmPickupButton) {
            confirmPickupButton.addEventListener('click', () => confirmPickup(order.id));
        }
    }
}

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 */
function cancelOrder(orderId) {
    try {
        // Update order status using storage manager
        const updatedOrder = storageManager.updateOrderStatus(orderId, 'cancelled');
        
        if (!updatedOrder) {
            alert('Order not found. Please refresh the page and try again.');
            return;
        }
        
        // Reload order details
        loadOrderDetails(orderId);
        
        // Show confirmation message
        showMessage('Order cancelled successfully.');
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('An error occurred while cancelling the order.');
    }
}

/**
 * Confirm order pickup
 * @param {string} orderId - Order ID
 */
function confirmPickup(orderId) {
    // Confirm with user
    if (!confirm('Confirm that you have picked up this order?')) {
        return;
    }
    
    // Update order status in storage
    const updatedOrder = storageManager.updateOrderStatus(orderId, 'completed');
    
    if (updatedOrder) {
        // The stats are now handled by the storage manager and stats manager
        
        // Reload order details
        loadOrderDetails();
        
        // Show thank you modal
        showThankYouModal();
    } else {
        showMessage('Failed to update order status');
    }
}

/**
 * Show thank you modal after order pickup
 */
function showThankYouModal() {
    const modal = document.getElementById('thank-you-modal');
    if (!modal) return;
    
    // Show modal
    modal.classList.add('show');
    
    // Close modal on click
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            // Redirect to my orders page
            window.location.href = 'my-orders.html';
        });
    }
    
    // Close on button click
    const continueBtn = document.getElementById('thank-you-continue');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            // Redirect to my orders page
            window.location.href = 'my-orders.html';
        });
    }
}

/**
 * Show message to user
 * @param {string} message - Message to show
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

// Initialize order details page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize order details page
    initOrderDetails();
    
    // Stats are now handled by the statsManager
    // No need to call updateCustomerStats() here
}); 