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
    
    // Format pickup time
    const pickupTime = new Date(order.estimatedPickupTime);
    const formattedTime = pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format order time
    const orderTime = new Date(order.orderTime);
    const formattedOrderTime = orderTime.toLocaleString([], { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
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
    
    // Format payment method
    let paymentMethod = order.paymentMethod || 'cash';
    let formattedPaymentMethod = '';
    
    switch (paymentMethod) {
        case 'cash':
            formattedPaymentMethod = 'Cash on Pickup';
            break;
        case 'mpesa':
            formattedPaymentMethod = 'M-Pesa';
            break;
        case 'card':
            formattedPaymentMethod = 'Card (Visa/Mastercard)';
            break;
        case 'paypal':
            formattedPaymentMethod = 'PayPal';
            break;
        case 'bitcoin':
            formattedPaymentMethod = 'Bitcoin';
            break;
        default:
            formattedPaymentMethod = paymentMethod;
    }
    
    // Format payment status
    let paymentStatus = order.paymentStatus || 'pending';
    let paymentStatusClass = '';
    
    switch (paymentStatus) {
        case 'pending':
            paymentStatusClass = 'status-pending';
            break;
        case 'processed':
            paymentStatusClass = 'status-completed';
            break;
        case 'failed':
            paymentStatusClass = 'status-cancelled';
            break;
        default:
            paymentStatusClass = 'status-pending';
    }
    
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
                        <p>Price: KSh ${(order.item.price * order.quantity).toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="order-meta">
                    <p><strong>Order Time:</strong> ${formattedOrderTime}</p>
                    <p><strong>Est. Pickup Time:</strong> ${formattedTime}</p>
                    <p><strong>Payment Method:</strong> ${formattedPaymentMethod}</p>
                    <p><strong>Payment Status:</strong> <span class="${paymentStatusClass}">${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</span></p>
                    ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
                </div>
            </div>
            
            ${showButtons ? `
            <div class="order-actions">
                <button id="cancel-order" class="btn btn-danger">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
                <button id="confirm-pickup" class="btn btn-success">
                    <i class="fas fa-check"></i> Confirm Picked Up
                </button>
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