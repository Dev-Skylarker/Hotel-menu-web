/**
 * Admin Dashboard JavaScript for Kenyan Delights Restaurant
 */

// DOM Elements
const totalMenuItemsEl = document.getElementById('total-menu-items');
const totalOrdersEl = document.getElementById('total-orders');
const totalRevenueEl = document.getElementById('total-revenue');
const recentOrdersBody = document.getElementById('recent-orders-body');
const noOrdersMessage = document.getElementById('no-orders-message');
const adminNameEl = document.getElementById('admin-name');
const logoutBtn = document.getElementById('logout-btn');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const categoryStats = document.querySelectorAll('.category-stat');

/**
 * Initialize the dashboard page
 */
function initDashboard() {
    // Check if user is logged in
    if (!authManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display admin name
    const admin = authManager.getCurrentUser();
    if (adminNameEl && admin) {
        adminNameEl.textContent = admin.username;
    }
    
    // Add event listeners
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Load dashboard data
    loadDashboardData();
}

/**
 * Handle logout
 * @param {Event} e - Click event
 */
function handleLogout(e) {
    e.preventDefault();
    
    authManager.logout();
    window.location.href = 'login.html';
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('active');
    
    // Change icon based on menu state
    const icon = mobileMenuToggle.querySelector('i');
    if (sidebar.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

/**
 * Load all dashboard data
 */
function loadDashboardData() {
    // Load menu statistics
    loadMenuStatistics();
    
    // Load orders data
    loadOrdersData();
}

/**
 * Load menu statistics
 */
function loadMenuStatistics() {
    try {
        // Get menu items
        const menuItems = storageManager.getMenuItems();
        
        // Update total menu items
        if (totalMenuItemsEl) {
            totalMenuItemsEl.textContent = menuItems.length;
        }
        
        // Calculate category counts
        const categoryCounts = {
            'appetizers': 0,
            'main-courses': 0,
            'desserts': 0,
            'drinks': 0
        };
        
        menuItems.forEach(item => {
            if (categoryCounts[item.category] !== undefined) {
                categoryCounts[item.category]++;
            }
        });
        
        // Update category statistics
        categoryStats.forEach(stat => {
            const category = stat.dataset.category;
            const count = categoryCounts[category] || 0;
            const countEl = stat.querySelector('p');
            const progressEl = stat.querySelector('.progress');
            
            if (countEl) {
                countEl.textContent = count === 1 ? `${count} item` : `${count} items`;
            }
            
            if (progressEl) {
                // Calculate percentage (max 100%)
                const percentage = menuItems.length > 0 
                    ? Math.min((count / menuItems.length) * 100, 100) 
                    : 0;
                    
                progressEl.style.width = `${percentage}%`;
            }
        });
    } catch (error) {
        console.error('Error loading menu statistics:', error);
    }
}

/**
 * Load orders data
 */
function loadOrdersData() {
    try {
        // Get orders from storage
        const orders = storageManager.getOrders();
        
        // Update total orders
        if (totalOrdersEl) {
            totalOrdersEl.textContent = orders.length;
        }
        
        // Calculate total revenue
        let totalRevenue = 0;
        orders.forEach(order => {
            totalRevenue += order.total || (order.item ? order.item.price * order.quantity : 0);
        });
        
        // Update total revenue
        if (totalRevenueEl) {
            totalRevenueEl.textContent = `KSh ${totalRevenue.toFixed(2)}`;
        }
        
        // Update recent orders table
        if (recentOrdersBody) {
            if (orders.length > 0) {
                // Sort orders by date (newest first)
                const sortedOrders = [...orders].sort((a, b) => 
                    new Date(b.orderTime || b.date) - new Date(a.orderTime || a.date)
                );
                
                // Display only the 5 most recent orders
                const recentOrders = sortedOrders.slice(0, 5);
                
                // Clear table and hide empty message
                recentOrdersBody.innerHTML = '';
                if (noOrdersMessage) {
                    noOrdersMessage.style.display = 'none';
                }
                
                // Add orders to table
                recentOrders.forEach(order => {
                    const row = document.createElement('tr');
                    
                    // Format date
                    const orderDate = new Date(order.orderTime || order.date);
                    const formattedDate = orderDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    // Get item name and price
                    const itemName = order.item ? order.item.name : (order.items ? `${order.items.length} items` : 'Unknown');
                    const price = order.total || (order.item ? order.item.price * order.quantity : 0);
                    
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${order.customer ? escapeHtml(order.customer) : 'Customer'}</td>
                        <td>${escapeHtml(itemName)}</td>
                        <td>KSh ${price.toFixed(2)}</td>
                        <td>
                            <span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span>
                        </td>
                        <td>${formattedDate}</td>
                        <td class="actions">
                            <div class="order-actions">
                                ${order.status !== 'cancelled' && order.status !== 'completed' ? `
                                <button class="btn-icon cancel-order" data-order-id="${order.id}" title="Cancel Order">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button class="btn-icon complete-order" data-order-id="${order.id}" title="Mark as Completed">
                                    <i class="fas fa-check"></i>
                                </button>
                                ` : ''}
                                <a href="../order-details.html?id=${order.id}" class="btn-icon" title="View Details" target="_blank">
                                    <i class="fas fa-eye"></i>
                                </a>
                            </div>
                        </td>
                    `;
                    
                    recentOrdersBody.appendChild(row);
                });
                
                // Add event listeners for action buttons
                attachOrderActionListeners();
            } else {
                // Show empty message
                if (noOrdersMessage) {
                    noOrdersMessage.style.display = 'block';
                }
            }
        }
    } catch (error) {
        console.error('Error loading orders data:', error);
    }
}

/**
 * Attach event listeners to order action buttons
 */
function attachOrderActionListeners() {
    // Cancel order buttons
    const cancelButtons = document.querySelectorAll('.cancel-order');
    cancelButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const orderId = e.currentTarget.dataset.orderId;
            if (orderId) {
                cancelOrder(orderId);
            }
        });
    });
    
    // Complete order buttons
    const completeButtons = document.querySelectorAll('.complete-order');
    completeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const orderId = e.currentTarget.dataset.orderId;
            if (orderId) {
                completeOrder(orderId);
            }
        });
    });
}

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 */
function cancelOrder(orderId) {
    try {
        // Call storage manager to update order status
        const updatedOrder = storageManager.updateOrderStatus(orderId, 'cancelled');
        
        if (updatedOrder) {
            // Reload orders data
            loadOrdersData();
            
            // Show success message
            alert('Order cancelled successfully.');
        } else {
            alert('Failed to cancel order. Order not found.');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('An error occurred while cancelling the order.');
    }
}

/**
 * Mark an order as completed
 * @param {string} orderId - Order ID to complete
 */
function completeOrder(orderId) {
    try {
        // Call storage manager to update order status
        const updatedOrder = storageManager.updateOrderStatus(orderId, 'completed');
        
        if (updatedOrder) {
            // Reload orders data
            loadOrdersData();
            
            // Show success message
            alert('Order marked as completed successfully.');
        } else {
            alert('Failed to complete order. Order not found.');
        }
    } catch (error) {
        console.error('Error completing order:', error);
        alert('An error occurred while marking the order as completed.');
    }
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', initDashboard);
