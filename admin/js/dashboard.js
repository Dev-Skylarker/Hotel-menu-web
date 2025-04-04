// Admin Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    initAdminDashboard();
});

// Global variables
let allOrders = [];
let allUsers = [];
let selectedOrder = null;
let confirmationCallback = null;

/**
 * Initialize the admin dashboard
 */
function initAdminDashboard() {
    // Load data
    loadUsers();
    loadOrders();
    updateMetrics();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize tabs
    initTabs();
}

/**
 * Set up dashboard event listeners
 */
function setupEventListeners() {
    // Order action buttons (using event delegation)
    document.addEventListener('click', function(e) {
        // Order details button
        if (e.target.classList.contains('view-order-details') || e.target.closest('.view-order-details')) {
            const button = e.target.closest('.view-order-details');
            const orderId = button.getAttribute('data-order-id');
            const order = allOrders.find(o => o.orderId === orderId);
            if (order) {
                showOrderDetailsModal(order);
            }
        }
        
        // Mark order as ready button
        if (e.target.classList.contains('mark-order-ready') || e.target.closest('.mark-order-ready')) {
            const button = e.target.closest('.mark-order-ready');
            const orderId = button.getAttribute('data-order-id');
            const order = allOrders.find(o => o.orderId === orderId);
            if (order) {
                showConfirmationModal(
                    'Mark Order as Ready?',
                    `Are you sure you want to mark order #${orderId} as ready for pickup?`,
                    () => updateOrderStatus(orderId, 'ready')
                );
            }
        }
        
        // Cancel order button
        if (e.target.classList.contains('cancel-order') || e.target.closest('.cancel-order')) {
            const button = e.target.closest('.cancel-order');
            const orderId = button.getAttribute('data-order-id');
            const order = allOrders.find(o => o.orderId === orderId);
            if (order) {
                showConfirmationModal(
                    'Cancel Order?',
                    `Are you sure you want to cancel order #${orderId}? This action cannot be undone.`,
                    () => updateOrderStatus(orderId, 'cancelled')
                );
            }
        }
        
        // Mark order as completed button
        if (e.target.classList.contains('complete-order') || e.target.closest('.complete-order')) {
            const button = e.target.closest('.complete-order');
            const orderId = button.getAttribute('data-order-id');
            const order = allOrders.find(o => o.orderId === orderId);
            if (order) {
                showConfirmationModal(
                    'Mark Order as Completed?',
                    `Are you sure you want to mark order #${orderId} as completed?`,
                    () => updateOrderStatus(orderId, 'completed')
                );
            }
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Confirmation modal buttons
    document.getElementById('confirm-action-btn').addEventListener('click', function() {
        if (typeof confirmationCallback === 'function') {
            confirmationCallback();
        }
        document.getElementById('confirmation-modal').style.display = 'none';
    });
    
    document.getElementById('cancel-action-btn').addEventListener('click', function() {
        document.getElementById('confirmation-modal').style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

/**
 * Initialize tab functionality
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.style.display = 'none');
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).style.display = 'block';
            
            // Update URL hash
            history.pushState(null, null, `#${tabId}`);
        });
    });
    
    // Check URL hash on page load
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        document.querySelector(`.tab-button[data-tab="${hash}"]`).click();
    } else {
        // Default to first tab
        tabButtons[0].click();
    }
}

/**
 * Load users from localStorage
 */
function loadUsers() {
    try {
        allUsers = JSON.parse(localStorage.getItem('campus_cafe_users')) || [];
        displayUsers(allUsers);
        
        // Update users badge count
        document.getElementById('users-badge').textContent = allUsers.length;
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Failed to load users. Please try again.', 'error');
    }
}

/**
 * Display users in the users table
 */
function displayUsers(users) {
    const usersTableBody = document.getElementById('users-table-body');
    if (!usersTableBody) return;
    
    if (users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
        return;
    }
    
    usersTableBody.innerHTML = '';
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.admissionNumber || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary view-user-details" data-user-email="${user.email}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-user" data-user-email="${user.email}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    usersTableBody.querySelectorAll('.view-user-details').forEach(button => {
        button.addEventListener('click', function() {
            const userEmail = this.getAttribute('data-user-email');
            const user = allUsers.find(u => u.email === userEmail);
            if (user) {
                showUserDetailsModal(user);
            }
        });
    });
    
    usersTableBody.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const userEmail = this.getAttribute('data-user-email');
            const user = allUsers.find(u => u.email === userEmail);
            if (user) {
                showConfirmationModal(
                    'Delete User?',
                    `Are you sure you want to delete user ${user.name || user.email}? This action cannot be undone.`,
                    () => deleteUser(userEmail)
                );
            }
        });
    });
}

/**
 * Delete a user
 */
function deleteUser(email) {
    try {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('campus_cafe_users')) || [];
        
        // Filter out the user to delete
        const updatedUsers = users.filter(user => user.email !== email);
        
        // Save updated users back to localStorage
        localStorage.setItem('campus_cafe_users', JSON.stringify(updatedUsers));
        
        // Update allUsers
        allUsers = updatedUsers;
        
        // Update UI
        displayUsers(allUsers);
        
        // Update users badge count
        document.getElementById('users-badge').textContent = allUsers.length;
        
        // Show success message
        showToast('User deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Failed to delete user. Please try again.', 'error');
    }
}

/**
 * Show user details modal
 */
function showUserDetailsModal(user) {
    const modal = document.getElementById('user-details-modal');
    if (!modal) return;
    
    // Update modal content
    document.getElementById('user-details-name').textContent = user.name || 'N/A';
    document.getElementById('user-details-email').textContent = user.email || 'N/A';
    document.getElementById('user-details-admission').textContent = user.admissionNumber || 'N/A';
    
    // Get user orders
    const orders = allOrders.filter(order => order.userEmail === user.email);
    document.getElementById('user-details-orders').textContent = orders.length;
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Load orders from localStorage
 */
function loadOrders() {
    try {
        allOrders = JSON.parse(localStorage.getItem('campus_cafe_orders')) || [];
        displayOrders('all-orders-table');
        displayOrders('pending-orders-table');
        displayOrders('completed-orders-table');
        displayOrders('cancelled-orders-table');
        
        // Update pending orders badge count
        const pendingCount = allOrders.filter(order => order.status === 'pending').length;
        document.getElementById('pending-orders-badge').textContent = pendingCount;
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders. Please try again.', 'error');
    }
}

/**
 * Display orders in the specified table
 */
function displayOrders(tableId) {
    const tableBody = document.getElementById(`${tableId.replace('table', 'table-body')}`);
    if (!tableBody) return;
    
    // Filter orders based on table ID
    let filteredOrders = [...allOrders];
    
    if (tableId === 'pending-orders-table') {
        filteredOrders = allOrders.filter(order => order.status === 'pending');
    } else if (tableId === 'completed-orders-table') {
        filteredOrders = allOrders.filter(order => order.status === 'completed' || order.status === 'ready');
    } else if (tableId === 'cancelled-orders-table') {
        filteredOrders = allOrders.filter(order => order.status === 'cancelled');
    }
    
    // Sort orders by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    filteredOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
        
        // Calculate total amount
        let total = 0;
        order.items.forEach(item => {
            total += item.price * item.quantity;
        });
        
        // Determine which action buttons to show based on status
        let actionButtons = `
            <button class="btn btn-sm btn-primary view-order-details" data-order-id="${order.orderId}">
                <i class="fas fa-eye"></i> View
            </button>
        `;
        
        if (order.status === 'pending') {
            actionButtons += `
                <button class="btn btn-sm btn-success mark-order-ready" data-order-id="${order.orderId}">
                    <i class="fas fa-check"></i> Mark Ready
                </button>
                <button class="btn btn-sm btn-danger cancel-order" data-order-id="${order.orderId}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
        } else if (order.status === 'ready') {
            actionButtons += `
                <button class="btn btn-sm btn-success complete-order" data-order-id="${order.orderId}">
                    <i class="fas fa-check-double"></i> Complete
                </button>
                <button class="btn btn-sm btn-danger cancel-order" data-order-id="${order.orderId}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.userName || order.userEmail || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${formatCurrency(total)}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase()}">
                    ${order.status}
                </span>
            </td>
            <td>${actionButtons}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Show order details modal
 */
function showOrderDetailsModal(order) {
    const modal = document.getElementById('order-details-modal');
    if (!modal) return;
    
    selectedOrder = order;
    
    // Update modal title
    document.getElementById('order-details-title').textContent = `Order #${order.orderId}`;
    
    // Update order details
    const orderDate = new Date(order.orderDate);
    document.getElementById('order-details-date').textContent = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
    document.getElementById('order-details-customer').textContent = order.userName || order.userEmail || 'N/A';
    document.getElementById('order-details-status').textContent = order.status;
    document.getElementById('order-details-status').className = `status-badge status-${order.status.toLowerCase()}`;
    
    // Calculate total
    let total = 0;
    order.items.forEach(item => {
        total += item.price * item.quantity;
    });
    
    document.getElementById('order-details-total').textContent = formatCurrency(total);
    
    // Update notes
    const notesElement = document.getElementById('order-details-notes');
    if (order.notes && order.notes.trim() !== '') {
        notesElement.textContent = order.notes;
        notesElement.parentElement.style.display = 'block';
    } else {
        notesElement.parentElement.style.display = 'none';
    }
    
    // Update items table
    const itemsTable = document.getElementById('order-items-table-body');
    itemsTable.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.price * item.quantity)}</td>
        `;
        itemsTable.appendChild(row);
    });
    
    // Update action buttons based on status
    const actionButtonsContainer = document.getElementById('order-details-actions');
    actionButtonsContainer.innerHTML = '<button class="btn btn-secondary close-modal">Close</button>';
    
    if (order.status === 'pending') {
        const markReadyButton = document.createElement('button');
        markReadyButton.className = 'btn btn-success mark-order-ready';
        markReadyButton.setAttribute('data-order-id', order.orderId);
        markReadyButton.innerHTML = '<i class="fas fa-check"></i> Mark as Ready';
        actionButtonsContainer.appendChild(markReadyButton);
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-danger cancel-order';
        cancelButton.setAttribute('data-order-id', order.orderId);
        cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancel Order';
        actionButtonsContainer.appendChild(cancelButton);
    } else if (order.status === 'ready') {
        const completeButton = document.createElement('button');
        completeButton.className = 'btn btn-success complete-order';
        completeButton.setAttribute('data-order-id', order.orderId);
        completeButton.innerHTML = '<i class="fas fa-check-double"></i> Mark as Completed';
        actionButtonsContainer.appendChild(completeButton);
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-danger cancel-order';
        cancelButton.setAttribute('data-order-id', order.orderId);
        cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancel Order';
        actionButtonsContainer.appendChild(cancelButton);
    }
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Show confirmation modal
 */
function showConfirmationModal(title, message, callback) {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) return;
    
    document.getElementById('confirmation-title').textContent = title;
    document.getElementById('confirmation-message').textContent = message;
    
    confirmationCallback = callback;
    
    modal.style.display = 'block';
}

/**
 * Update order status
 */
function updateOrderStatus(orderId, newStatus) {
    try {
        // Get orders from localStorage
        const orders = JSON.parse(localStorage.getItem('campus_cafe_orders')) || [];
        
        // Find the order to update
        const orderIndex = orders.findIndex(order => order.orderId === orderId);
        
        if (orderIndex === -1) {
            showToast('Order not found', 'error');
            return;
        }
        
        // Update order status
        orders[orderIndex].status = newStatus;
        
        // Save updated orders back to localStorage
        localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
        
        // Update allOrders
        allOrders = orders;
        
        // Close order details modal if open
        const orderDetailsModal = document.getElementById('order-details-modal');
        if (orderDetailsModal && orderDetailsModal.style.display === 'block') {
            orderDetailsModal.style.display = 'none';
        }
        
        // Update UI
        displayOrders('all-orders-table');
        displayOrders('pending-orders-table');
        displayOrders('completed-orders-table');
        displayOrders('cancelled-orders-table');
        
        // Update metrics
        updateMetrics();
        
        // Update pending orders badge count
        const pendingCount = allOrders.filter(order => order.status === 'pending').length;
        document.getElementById('pending-orders-badge').textContent = pendingCount;
        
        // Send notification to user
        sendOrderStatusNotification(orders[orderIndex]);
        
        // Show success message
        showToast(`Order #${orderId} marked as ${newStatus}`, 'success');
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Failed to update order status. Please try again.', 'error');
    }
}

/**
 * Send notification to user about order status change
 */
function sendOrderStatusNotification(order) {
    // Get user notifications array
    let notifications = JSON.parse(localStorage.getItem('campus_cafe_notifications')) || [];
    
    // Create notification message based on status
    let message = '';
    
    switch (order.status) {
        case 'ready':
            message = `Your order #${order.orderId} is ready for pickup!`;
            break;
        case 'completed':
            message = `Your order #${order.orderId} has been completed. Thank you for your business!`;
            break;
        case 'cancelled':
            message = `Your order #${order.orderId} has been cancelled. Please contact us for more information.`;
            break;
        default:
            message = `Your order #${order.orderId} status has been updated to ${order.status}.`;
    }
    
    // Add notification
    notifications.push({
        id: Date.now().toString(),
        userId: order.userEmail,
        message: message,
        type: order.status === 'cancelled' ? 'error' : 'success',
        read: false,
        date: new Date().toISOString()
    });
    
    // Save updated notifications
    localStorage.setItem('campus_cafe_notifications', JSON.stringify(notifications));
    
    console.log(`Notification sent to user ${order.userEmail} about order #${order.orderId}`);
}

/**
 * Update dashboard metrics
 */
function updateMetrics() {
    try {
        // Count orders by status
        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
        const completedOrders = allOrders.filter(order => order.status === 'completed').length;
        const cancelledOrders = allOrders.filter(order => order.status === 'cancelled').length;
        
        // Calculate total revenue
        let totalRevenue = 0;
        allOrders.filter(order => order.status === 'completed').forEach(order => {
            order.items.forEach(item => {
                totalRevenue += item.price * item.quantity;
            });
        });
        
        // Get total users
        const totalUsers = allUsers.length;
        
        // Update metric cards
        updateMetricValue('total-orders', totalOrders);
        updateMetricValue('pending-orders-count', pendingOrders);
        updateMetricValue('completed-orders-count', completedOrders);
        updateMetricValue('total-revenue', formatCurrency(totalRevenue));
        updateMetricValue('total-users', totalUsers);
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

/**
 * Update metric value in the UI
 */
function updateMetricValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Format currency amount
 */
function formatCurrency(amount) {
    // Use the currency formatter if available
    if (window.formatCurrency) {
        return window.formatCurrency(amount);
    }
    
    // Fallback formatter
    return '$' + amount.toFixed(2);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
}

/**
 * Get toast icon based on type
 */
function getToastIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
} 