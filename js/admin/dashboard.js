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
            totalRevenue += order.total;
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
                    new Date(b.date) - new Date(a.date)
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
                    const orderDate = new Date(order.date);
                    const formattedDate = orderDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${escapeHtml(order.customer)}</td>
                        <td>${order.items.length} item${order.items.length !== 1 ? 's' : ''}</td>
                        <td>KSh ${order.total.toFixed(2)}</td>
                        <td>${formattedDate}</td>
                    `;
                    
                    recentOrdersBody.appendChild(row);
                });
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
