/**
 * Admin Dashboard JavaScript for Campus Cafe
 */

// DOM Elements - Main UI
const adminNameEl = document.getElementById('admin-name');
const logoutBtn = document.getElementById('logout-btn');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const refreshDataBtn = document.getElementById('refresh-data');

// Dashboard metrics
const totalRevenueEl = document.getElementById('total-revenue');
const completedOrdersEl = document.getElementById('completed-orders');
const pendingOrdersEl = document.getElementById('pending-orders');
const avgOrderValueEl = document.getElementById('avg-order-value');
const revenueTrendEl = document.getElementById('revenue-trend');
const completedTrendEl = document.getElementById('completed-trend');
const avgValueTrendEl = document.getElementById('avg-value-trend');

// Tab control
const tabItems = document.querySelectorAll('.tab-item');
const tabContents = document.querySelectorAll('.tab-content');

// Order counts
const allCountEl = document.getElementById('all-count');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const cancelledCountEl = document.getElementById('cancelled-count');

// Order tables
const allOrdersBody = document.getElementById('all-orders-body');
const pendingOrdersBody = document.getElementById('pending-orders-body');
const completedOrdersBody = document.getElementById('completed-orders-body');
const cancelledOrdersBody = document.getElementById('cancelled-orders-body');

// Empty state messages
const noOrdersMessage = document.getElementById('no-orders-message');
const noPendingOrders = document.getElementById('no-pending-orders');
const noCompletedOrders = document.getElementById('no-completed-orders');
const noCancelledOrders = document.getElementById('no-cancelled-orders');

// Modals
const orderDetailsModal = document.getElementById('order-details-modal');
const orderDetailsContent = document.getElementById('order-details-content');
const markReadyBtn = document.getElementById('mark-ready-btn');
const cancelOrderBtn = document.getElementById('cancel-order-btn');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmActionBtn = document.getElementById('confirm-action-btn');

// Filters
const dateFilter = document.getElementById('date-filter');
const searchOrders = document.getElementById('search-orders');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const resetFiltersBtn = document.getElementById('reset-filters');

// Batch action buttons
const exportOrdersBtn = document.getElementById('export-orders');
const deleteSelectedBtn = document.getElementById('delete-selected');
const completeAllPendingBtn = document.getElementById('complete-all-pending');
const clearCancelledBtn = document.getElementById('clear-cancelled');

// Charts
let salesChart = null;
let categoryChart = null;

// State
let allOrders = [];
let filteredOrders = [];
let currentOrder = null;
let currentAction = null;

/**
 * Initialize the dashboard page
 */
function initDashboard() {
    // Check if user is logged in
    if (!authManager.isLoggedIn()) {
        console.log('User not logged in, redirecting to login page');
        window.location.href = 'login.html';
        return;
    }
    
    // Get current user and ensure it exists
    const admin = authManager.getCurrentUser();
    if (!admin) {
        console.log('No admin user data found, redirecting to login page');
        authManager.logout(); // Clear any invalid session data
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Admin authenticated successfully:', admin.email);
    
    // Check for limited mode param in URL for regular admins
    const urlParams = new URLSearchParams(window.location.search);
    const limitedMode = urlParams.get('mode') === 'limited';
    
    // Check if user is a superadmin
    const isSuperAdmin = authManager.isSuperAdmin();
    console.log('User is superadmin:', isSuperAdmin);
    
    // Configure UI based on user role
    configureUIForRole(admin, isSuperAdmin, limitedMode);
    
    // Display admin name
    if (adminNameEl && admin) {
        adminNameEl.textContent = admin.email ? admin.email.split('@')[0] : 'Admin';
        // Add badge for superadmin
        if (isSuperAdmin) {
            const badge = document.createElement('span');
            badge.className = 'admin-badge';
            badge.textContent = 'Super Admin';
            badge.style.backgroundColor = 'var(--primary-color)';
            badge.style.color = 'white';
            badge.style.fontSize = '10px';
            badge.style.padding = '2px 6px';
            badge.style.borderRadius = '10px';
            badge.style.marginLeft = '5px';
            adminNameEl.appendChild(badge);
        }
    }
    
    // Add event listeners
    attachEventListeners();
    
    // Initialize tabs
    initTabs();
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize charts
    initCharts();
    
    // Setup regular auth status check
    setupAuthCheck();
}

/**
 * Configure UI elements based on user role
 * @param {Object} admin - The admin user object
 * @param {boolean} isSuperAdmin - Whether user is a superadmin
 * @param {boolean} limitedMode - Whether dashboard is in limited mode
 */
function configureUIForRole(admin, isSuperAdmin, limitedMode) {
    console.log('Configuring UI for role:', admin.role, 'isSuperAdmin:', isSuperAdmin, 'limitedMode:', limitedMode);
    
    // Elements that should only be visible to superadmins
    const superAdminOnlyElements = document.querySelectorAll('.superadmin-only');
    
    // Elements that should be visible to all admins but with restricted functionality for regular admins
    const adminRestrictedElements = document.querySelectorAll('.admin-restricted');
    
    // Handle superadmin-only elements
    superAdminOnlyElements.forEach(element => {
        element.style.display = isSuperAdmin ? '' : 'none';
    });
    
    // Handle admin-restricted elements
    adminRestrictedElements.forEach(element => {
        if (!isSuperAdmin || limitedMode) {
            // For regular admins, disable certain actions but keep elements visible
            const buttons = element.querySelectorAll('button:not(.view-only)');
            buttons.forEach(button => {
                button.disabled = true;
                button.title = 'Requires super admin privileges';
                // Add visual indicator
                button.classList.add('disabled-for-regular-admin');
            });
        }
    });
    
    // Handle navigation items
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        if (item.classList.contains('superadmin-only') && !isSuperAdmin) {
            item.style.display = 'none';
        }
    });
    
    // Update page title to indicate role
    document.title = isSuperAdmin ? 
        'Super Admin Dashboard - Campus Cafe' : 
        'Admin Dashboard - Campus Cafe';
}

/**
 * Setup regular authentication status check
 * Check login status every minute and redirect to login if not authenticated
 */
function setupAuthCheck() {
    // Check auth status every minute
    setInterval(() => {
        if (!authManager.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }, 60000); // 60 seconds
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    // Main UI
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', refreshData);
    }
    
    // Tab navigation
    tabItems.forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    // Filters
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Export buttons
    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener('click', () => exportOrders('all'));
    }
    
    // Select all checkboxes
    const selectAll = document.getElementById('select-all');
    if (selectAll) {
        selectAll.addEventListener('change', e => toggleSelectAll(e.target.checked, 'all'));
    }
    
    const selectAllPending = document.getElementById('select-all-pending');
    if (selectAllPending) {
        selectAllPending.addEventListener('change', e => toggleSelectAll(e.target.checked, 'pending'));
    }
    
    const selectAllCancelled = document.getElementById('select-all-cancelled');
    if (selectAllCancelled) {
        selectAllCancelled.addEventListener('change', e => toggleSelectAll(e.target.checked, 'cancelled'));
    }
    
    // Batch action buttons
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedOrders);
    }
    
    if (completeAllPendingBtn) {
        completeAllPendingBtn.addEventListener('click', completeAllPendingOrders);
    }
    
    if (clearCancelledBtn) {
        clearCancelledBtn.addEventListener('click', clearCancelledOrders);
    }
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Modal buttons
    if (markReadyBtn) {
        markReadyBtn.addEventListener('click', markOrderReady);
    }
    
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', promptCancelOrder);
    }
    
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', executeConfirmedAction);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', e => {
        if (e.target === orderDetailsModal) {
            closeModals();
        }
        if (e.target === confirmModal) {
            closeModals();
        }
    });
}

/**
 * Initialize tabs
 */
function initTabs() {
    switchTab('all-orders');
}

/**
 * Switch active tab
 * @param {string} tabId - The tab to switch to
 */
function switchTab(tabId) {
    // Update tab buttons
    tabItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabId);
    });
    
    // Update tab content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

/**
 * Handle logout
 * @param {Event} e - Click event
 */
function handleLogout(e) {
    e.preventDefault();
    
    // Add a fade-out effect to the body
    document.body.style.opacity = '0.5';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Log the user out
    authManager.logout();
    
    // Redirect to login page after a short delay for the animation
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
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
 * Refresh data
 */
function refreshData() {
    // Show loading spinner on the refresh button
    if (refreshDataBtn) {
        const originalContent = refreshDataBtn.innerHTML;
        refreshDataBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshDataBtn.disabled = true;
        
        // Force clear any cached data
        allOrders = [];
        
        // Small delay to ensure UI updates
        setTimeout(() => {
            // Load all dashboard data
            loadDashboardData();
            
            // Update charts
            updateCharts();
            
            // Restore button state with success indicator
            refreshDataBtn.innerHTML = '<i class="fas fa-check"></i> Data Refreshed';
            refreshDataBtn.disabled = false;
            
            // Return to original state after 2 seconds
            setTimeout(() => {
                refreshDataBtn.innerHTML = originalContent;
            }, 2000);
            
            // Show toast notification
            showToast('Dashboard data has been refreshed successfully!', 'success');
        }, 500);
    } else {
        // If button isn't available, just refresh the data
        loadDashboardData();
        updateCharts();
    }
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    // Set toast content
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Automatically remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Load all dashboard data
 */
function loadDashboardData() {
    // Get all orders (force fresh data)
    allOrders = storageManager.getOrders();
    
    // Update metrics
    updateMetrics();
    
    // Populate all order tables
    populateAllOrdersTable();
    populatePendingOrdersTable();
    populateCompletedOrdersTable();
    populateCancelledOrdersTable();
    
    // Apply filters (or show all orders)
    applyFilters();
    
    // Update charts
    updateCharts();
    
    // Update last refresh time
    updateLastRefreshTime();
}

/**
 * Update the last refresh time display
 */
function updateLastRefreshTime() {
    const lastRefreshEl = document.getElementById('last-refresh-time');
    if (lastRefreshEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        lastRefreshEl.textContent = timeString;
    }
}

/**
 * Update dashboard metrics
 */
function updateMetrics() {
    // Categorize orders by status
    const pendingOrders = allOrders.filter(order => order.status === 'pending');
    const completedOrders = allOrders.filter(order => order.status === 'completed' || order.status === 'ready');
    const cancelledOrders = allOrders.filter(order => order.status === 'cancelled');
    
    // Update count metrics
    if (pendingOrdersEl) {
        pendingOrdersEl.textContent = pendingOrders.length;
    }
    
    if (completedOrdersEl) {
        completedOrdersEl.textContent = completedOrders.length;
    }
    
    // Calculate total revenue
    let totalRevenue = 0;
    allOrders.forEach(order => {
        if (order.status !== 'cancelled') {
            const orderTotal = parseFloat(order.totalAmount || order.totalPrice || 0);
            totalRevenue += orderTotal;
        }
    });
    
    // Calculate average order value
    const avgOrderValue = allOrders.length > 0 ? totalRevenue / (completedOrders.length || 1) : 0;
    
    // Update revenue metrics
    if (totalRevenueEl) {
        totalRevenueEl.textContent = formatCurrency(totalRevenue, true);
    }
    
    if (avgOrderValueEl) {
        avgOrderValueEl.textContent = formatCurrency(avgOrderValue, true);
    }
    
    // Set count elements for tabs
    if (allCountEl) allCountEl.textContent = allOrders.length;
    if (pendingCountEl) pendingCountEl.textContent = pendingOrders.length;
    if (completedCountEl) completedCountEl.textContent = completedOrders.length;
    if (cancelledCountEl) cancelledCountEl.textContent = cancelledOrders.length;
}

/**
 * Initialize charts
 */
function initCharts() {
    initSalesChart();
    initCategoryChart();
}

/**
 * Initialize sales chart
 */
function initSalesChart() {
    const ctx = document.getElementById('sales-chart');
    if (!ctx) return;
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Revenue (KSh)',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Orders',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Initialize category chart
 */
function initCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Breakfast', 'Main Courses', 'Desserts', 'Drinks'],
            datasets: [
                {
                    label: 'Items Ordered',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(241, 196, 15, 0.7)',
                        'rgba(231, 76, 60, 0.7)',
                        'rgba(142, 68, 173, 0.7)',
                        'rgba(52, 152, 219, 0.7)'
                    ],
                    borderColor: [
                        'rgb(241, 196, 15)',
                        'rgb(231, 76, 60)',
                        'rgb(142, 68, 173)',
                        'rgb(52, 152, 219)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Update chart data based on current orders
 */
function updateCharts() {
    updateSalesChart();
    updateCategoryChart();
}

/**
 * Update the sales chart with current data
 */
function updateSalesChart() {
    if (!salesChart) return;

    // Get the last 7 days
    const dates = [];
    const revenues = [];
    const orderCounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // Get orders for this date
        const dateOrders = allOrders.filter(order => {
            const orderDate = new Date(order.orderTime || order.date);
            return orderDate.toISOString().split('T')[0] === dateString;
        });
        
        // Calculate revenue for the day
        let dailyRevenue = 0;
        dateOrders.forEach(order => {
            if (order.status !== 'cancelled') {
                dailyRevenue += parseFloat(order.totalAmount || order.totalPrice || 0);
            }
        });
        
        dates.push(formatDate(date));
        revenues.push(dailyRevenue);
        orderCounts.push(dateOrders.length);
    }
    
    salesChart.data.labels = dates;
    salesChart.data.datasets[0].data = revenues;
    salesChart.data.datasets[1].data = orderCounts;
    salesChart.update();
}

/**
 * Update the category chart with current data
 */
function updateCategoryChart() {
    if (!categoryChart) return;
    
    // Count items ordered by category
        const categoryCounts = {
            'appetizers': 0,
            'main-courses': 0,
            'desserts': 0,
            'drinks': 0
        };
        
    allOrders.forEach(order => {
        if (order.status === 'cancelled') return;
        
        if (order.items && Array.isArray(order.items)) {
            // Multi-item order
            order.items.forEach(item => {
                const category = item.category || 'main-courses';
                if (categoryCounts[category] !== undefined) {
                    categoryCounts[category] += item.quantity || 1;
                }
            });
        } else if (order.item) {
            // Single item order
            const category = order.item.category || 'main-courses';
            if (categoryCounts[category] !== undefined) {
                categoryCounts[category] += order.quantity || 1;
            }
        }
    });
    
    categoryChart.data.datasets[0].data = [
        categoryCounts['appetizers'],
        categoryCounts['main-courses'],
        categoryCounts['desserts'],
        categoryCounts['drinks']
    ];
    
    categoryChart.update();
}

/**
 * Apply filters to orders
 */
function applyFilters() {
    const dateValue = dateFilter ? dateFilter.value : 'all';
    const searchValue = searchOrders ? searchOrders.value.toLowerCase() : '';
    
    // Start with all orders
    filteredOrders = [...allOrders];
    
    // Apply date filter
    if (dateValue !== 'all') {
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderTime || order.date);
            const now = new Date();
            
            switch (dateValue) {
                case 'today':
                    return isSameDay(orderDate, now);
                case 'yesterday':
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return isSameDay(orderDate, yesterday);
                case 'week':
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - 7);
                    return orderDate >= weekStart;
                case 'month':
                    const monthStart = new Date();
                    monthStart.setMonth(monthStart.getMonth() - 1);
                    return orderDate >= monthStart;
                default:
                    return true;
            }
        });
    }
    
    // Apply search filter
    if (searchValue) {
        filteredOrders = filteredOrders.filter(order => {
            // Search by order ID
            if (order.id && order.id.toLowerCase().includes(searchValue)) {
                return true;
            }
            
            // Search by order code
            if (order.orderCode && order.orderCode.toLowerCase().includes(searchValue)) {
                return true;
            }
            
            // Search by customer name
            if (order.customerName && order.customerName.toLowerCase().includes(searchValue)) {
                return true;
            }
            
            // Search by admission number
            if (order.admissionNumber && order.admissionNumber.toLowerCase().includes(searchValue)) {
                return true;
            }
            
            // Search by item name
            if (order.item && order.item.name && order.item.name.toLowerCase().includes(searchValue)) {
                return true;
            }
            
            return false;
        });
    }
    
    // Update all tables
    updateOrdersTable();
    updatePendingOrdersTable();
    updateCompletedOrdersTable();
    updateCancelledOrdersTable();
}

/**
 * Clear all filters
 */
function clearFilters() {
    if (dateFilter) dateFilter.value = 'today';
    if (searchOrders) searchOrders.value = '';
    
    applyFilters();
}

/**
 * Update the orders table with filtered orders
 */
function updateOrdersTable() {
    if (!allOrdersBody) return;
    
    // Clear table
    allOrdersBody.innerHTML = '';
    
    // Check if there are orders
    if (filteredOrders.length === 0) {
        if (noOrdersMessage) {
            noOrdersMessage.style.display = 'block';
        }
        return;
    }
    
    // Hide empty message
    if (noOrdersMessage) {
        noOrdersMessage.style.display = 'none';
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => 
        new Date(b.orderTime || b.date) - new Date(a.orderTime || a.date)
    );
    
    // Render orders
    sortedOrders.forEach(order => {
        const row = createOrderRow(order, 'all');
        allOrdersBody.appendChild(row);
    });
    
    // Attach event listeners
    attachOrderActionListeners('all');
}

/**
 * Update the pending orders table
 */
function updatePendingOrdersTable() {
    if (!pendingOrdersBody) return;
    
    // Clear table
    pendingOrdersBody.innerHTML = '';
    
    // Filter pending orders
    const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
    
    // Check if there are pending orders
    if (pendingOrders.length === 0) {
        if (noPendingOrders) {
            noPendingOrders.style.display = 'block';
        }
        
        // Disable batch actions
        if (completeAllPendingBtn) {
            completeAllPendingBtn.disabled = true;
        }
        
        return;
    }
    
    // Hide empty message
    if (noPendingOrders) {
        noPendingOrders.style.display = 'none';
    }
    
    // Sort orders by date (oldest first for pending)
    const sortedOrders = [...pendingOrders].sort((a, b) => 
        new Date(a.orderTime || a.date) - new Date(b.orderTime || b.date)
    );
    
    // Render orders
    sortedOrders.forEach(order => {
        const row = createOrderRow(order, 'pending');
        pendingOrdersBody.appendChild(row);
    });
    
    // Attach event listeners
    attachOrderActionListeners('pending');
}

/**
 * Update the completed orders table
 */
function updateCompletedOrdersTable() {
    if (!completedOrdersBody) return;
    
    // Clear table
    completedOrdersBody.innerHTML = '';
    
    // Filter completed orders
    const completedOrders = filteredOrders.filter(order => 
        order.status === 'completed' || order.status === 'ready'
    );
    
    // Check if there are completed orders
    if (completedOrders.length === 0) {
        if (noCompletedOrders) {
            noCompletedOrders.style.display = 'block';
        }
        return;
    }
    
    // Hide empty message
    if (noCompletedOrders) {
        noCompletedOrders.style.display = 'none';
    }
    
                // Sort orders by date (newest first)
    const sortedOrders = [...completedOrders].sort((a, b) => 
                    new Date(b.orderTime || b.date) - new Date(a.orderTime || a.date)
                );
                
    // Render orders
    sortedOrders.forEach(order => {
        const row = createOrderRow(order, 'completed');
        completedOrdersBody.appendChild(row);
    });
    
    // Attach event listeners
    attachOrderActionListeners('completed');
}

/**
 * Update the cancelled orders table
 */
function updateCancelledOrdersTable() {
    if (!cancelledOrdersBody) return;
    
    // Clear table
    cancelledOrdersBody.innerHTML = '';
    
    // Filter cancelled orders
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');
    
    // Check if there are cancelled orders
    if (cancelledOrders.length === 0) {
        if (noCancelledOrders) {
            noCancelledOrders.style.display = 'block';
        }
        
        // Disable batch actions
        if (clearCancelledBtn) {
            clearCancelledBtn.disabled = true;
        }
        
        return;
    }
    
    // Hide empty message
    if (noCancelledOrders) {
        noCancelledOrders.style.display = 'none';
    }
    
    // Enable batch actions
    if (clearCancelledBtn) {
        clearCancelledBtn.disabled = false;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...cancelledOrders].sort((a, b) => 
        new Date(b.orderTime || b.date) - new Date(a.orderTime || a.date)
    );
    
    // Render orders
    sortedOrders.forEach(order => {
        const row = createOrderRow(order, 'cancelled');
        cancelledOrdersBody.appendChild(row);
    });
    
    // Attach event listeners
    attachOrderActionListeners('cancelled');
}

/**
 * Create a table row for an order
 * @param {Object} order - Order object
 * @param {string} type - Type of table (all, pending, completed, cancelled)
 * @returns {HTMLElement} - Table row element
 */
function createOrderRow(order, type) {
                    const row = document.createElement('tr');
                    
                    // Format date
                    const orderDate = new Date(order.orderTime || order.date);
    const formattedDate = formatDate(orderDate);
                    
                    // Get item name and price
    let itemName = 'Unknown';
    let orderTotal = 0;
    
    if (order.items && Array.isArray(order.items)) {
        // Multi-item order
        itemName = `${order.items.length} items`;
        orderTotal = parseFloat(order.totalAmount || order.totalPrice || 0);
    } else if (order.item) {
        // Single item order
        itemName = order.item.name;
        orderTotal = order.item.price * (order.quantity || 1);
    }
                    
                    // Get customer information
                    const customerName = order.customerName || 'Guest';
                    const admissionNumber = order.admissionNumber ? `(${order.admissionNumber})` : '';
                    const phoneNumber = order.phoneNumber || 'N/A';
                    
                    // Add payment code if available
                    const orderIdDisplay = order.orderCode ? 
        `#${order.id.substring(0, 6)}... <span class="order-code">${order.orderCode}</span>` : 
        `#${order.id.substring(0, 8)}...`;
    
    // Time information based on type
    let timeInfo = formattedDate;
    
    if (type === 'pending') {
        // Calculate time elapsed
        const now = new Date();
        const elapsed = now - orderDate;
        const minutes = Math.floor(elapsed / 60000);
        
        if (minutes < 60) {
            timeInfo = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(minutes / 60);
            timeInfo = `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes % 60} min`;
        }
    }
    
    // Start building row HTML
    let rowHtml = '';
    
    // Checkbox for selectable rows
    if (type !== 'completed') {
        rowHtml += `<td class="checkbox-cell">
            <input type="checkbox" class="order-checkbox" data-id="${order.id}">
        </td>`;
    }
    
    // Common columns
    rowHtml += `
                        <td>${orderIdDisplay}</td>
                        <td>${customerName}</td>
                        <td>${escapeHtml(itemName)}</td>
                        <td>${formatCurrency(orderTotal, true)}</td>
    `;
    
    // Status column (only for all orders)
    if (type === 'all') {
        rowHtml += `<td>
                            <span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span>
        </td>`;
    }
    
    // Time column
    rowHtml += `<td>${timeInfo}</td>`;
    
    // Actions column
    rowHtml += `<td class="actions">
                            <button class="btn btn-small btn-primary view-order" data-id="${order.id}" title="View Order">
                                <i class="fas fa-eye"></i>
        </button>`;
    
    // Add specific actions based on status
    if (type === 'pending' || (type === 'all' && order.status === 'pending')) {
        rowHtml += `
                            <button class="btn btn-small btn-success complete-order" data-id="${order.id}" title="Mark as Ready">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-small btn-danger cancel-order" data-id="${order.id}" title="Cancel Order">
                                <i class="fas fa-times"></i>
                            </button>
        `;
    } else if (type === 'cancelled' || (type === 'all' && order.status === 'cancelled')) {
        rowHtml += `
            <button class="btn btn-small btn-danger delete-order" data-id="${order.id}" title="Delete Order">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }
    
    rowHtml += `</td>`;
    
    // Set row HTML
    row.innerHTML = rowHtml;
    
    return row;
}

/**
 * Attach event listeners to order action buttons
 * @param {string} type - Type of table (all, pending, completed, cancelled)
 */
function attachOrderActionListeners(type) {
    // Get the appropriate table body
    let tableBody;
    switch (type) {
        case 'all':
            tableBody = allOrdersBody;
            break;
        case 'pending':
            tableBody = pendingOrdersBody;
            break;
        case 'completed':
            tableBody = completedOrdersBody;
            break;
        case 'cancelled':
            tableBody = cancelledOrdersBody;
            break;
        default:
            return;
    }
    
    if (!tableBody) return;
    
    // View order buttons
    tableBody.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', () => viewOrderDetails(btn.dataset.id));
    });
    
    // Complete order buttons
    tableBody.querySelectorAll('.complete-order').forEach(btn => {
        btn.addEventListener('click', () => completeOrder(btn.dataset.id));
    });
    
    // Cancel order buttons
    tableBody.querySelectorAll('.cancel-order').forEach(btn => {
        btn.addEventListener('click', () => promptCancelOrderById(btn.dataset.id));
    });
    
    // Delete order buttons
    tableBody.querySelectorAll('.delete-order').forEach(btn => {
        btn.addEventListener('click', () => promptDeleteOrderById(btn.dataset.id));
    });
    
    // Order checkboxes
    tableBody.querySelectorAll('.order-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => updateBatchActionButtons(type));
    });
}

/**
 * View order details
 * @param {string} orderId - Order ID
 */
function viewOrderDetails(orderId) {
    // Find order
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Save current order
    currentOrder = order;
    
    // Format date
    const orderDate = new Date(order.orderTime || order.date);
    const formattedDate = formatDate(orderDate, true);
    
    // Get customer information
    const customerName = order.customerName || 'Guest';
    const admissionNumber = order.admissionNumber || 'N/A';
    const phoneNumber = order.phoneNumber || 'N/A';
    
    // Get items information
    let itemsHtml = '';
    let orderTotal = 0;
    
    if (order.items && Array.isArray(order.items)) {
        // Multi-item order
        itemsHtml = `<ul class="order-items-list">`;
        
        order.items.forEach(item => {
            const itemTotal = item.price * (item.quantity || 1);
            orderTotal += itemTotal;
            
            itemsHtml += `
                <li>
                    <div class="order-item-name">${escapeHtml(item.name)}</div>
                    <div class="order-item-qty">x${item.quantity || 1}</div>
                    <div class="order-item-price">${formatCurrency(item.price, true)}</div>
                    <div class="order-item-total">${formatCurrency(itemTotal, true)}</div>
                </li>
            `;
        });
        
        itemsHtml += `</ul>`;
        
        // Use totalAmount if available
        orderTotal = parseFloat(order.totalAmount || order.totalPrice || orderTotal);
    } else if (order.item) {
        // Single item order
        const item = order.item;
        const quantity = order.quantity || 1;
        const itemTotal = item.price * quantity;
        orderTotal = itemTotal;
        
        itemsHtml = `
            <ul class="order-items-list">
                <li>
                    <div class="order-item-name">${escapeHtml(item.name)}</div>
                    <div class="order-item-qty">x${quantity}</div>
                    <div class="order-item-price">${formatCurrency(item.price, true)}</div>
                    <div class="order-item-total">${formatCurrency(itemTotal, true)}</div>
                </li>
            </ul>
        `;
        
        // Use totalAmount if available
        orderTotal = parseFloat(order.totalAmount || order.totalPrice || orderTotal);
    }
    
    // Set modal content
    const modalContent = `
        <div class="order-details">
            <div class="order-header">
                <div class="order-id">
                    <strong>Order ID:</strong> #${order.id}
                    ${order.orderCode ? `<span class="order-code">(${order.orderCode})</span>` : ''}
                </div>
                <div class="order-status">
                    <span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span>
                </div>
            </div>
            
            <div class="order-section">
                <h3>Customer Information</h3>
                <div class="customer-info">
                    <p><strong>Name:</strong> ${escapeHtml(customerName)}</p>
                    <p><strong>Admission #:</strong> ${escapeHtml(admissionNumber)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(phoneNumber)}</p>
                </div>
            </div>
            
            ${order.collectionMethod ? `
            <div class="order-section">
                <h3>Collection Information</h3>
                <div class="collection-info">
                    <p><strong>Method:</strong> ${order.collectionMethod === 'table' ? 'Serve at Table' : 'Pickup at Counter'}</p>
                    <p><strong>Location:</strong> <span class="highlight">${order.collectionLocation || 'Not specified'}</span></p>
                    ${order.collectionMethod === 'table' 
                        ? `<p><i class="fas fa-info-circle"></i> Order to be served at the table.</p>` 
                        : `<p><i class="fas fa-info-circle"></i> Customer will collect from Counter 3 (Outgoing Orders).</p>`
                    }
                </div>
            </div>
            ` : ''}
            
            <div class="order-section">
                <h3>Order Items</h3>
                ${itemsHtml}
                
                <div class="order-summary">
                    <div class="order-total">
                        <strong>Total:</strong> ${formatCurrency(orderTotal, true)}
                    </div>
                </div>
            </div>
            
            <div class="order-section">
                <h3>Order Information</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
            </div>
        </div>
    `;
    
    // Set modal content
    if (orderDetailsContent) {
        orderDetailsContent.innerHTML = modalContent;
    }
    
    // Show/hide action buttons based on status
    if (markReadyBtn) {
        markReadyBtn.style.display = order.status === 'pending' ? 'inline-block' : 'none';
    }
    
    if (cancelOrderBtn) {
        cancelOrderBtn.style.display = order.status === 'pending' ? 'inline-block' : 'none';
    }
    
    // Show modal
    if (orderDetailsModal) {
        orderDetailsModal.style.display = 'block';
    }
}

/**
 * Mark current order as ready
 */
function markOrderReady() {
    if (!currentOrder) return;
    
    // Update order status
    storageManager.updateOrderStatus(currentOrder.id, 'ready');
    
    // Close modal
    closeModals();
    
    // Refresh data
    refreshData();
}

/**
 * Prompt for cancellation of current order
 */
function promptCancelOrder() {
    if (!currentOrder) return;
    
    // Set up confirmation
    confirmMessage.textContent = `Are you sure you want to cancel order #${currentOrder.id}?`;
    currentAction = 'cancel';
    
    // Hide order details modal
    orderDetailsModal.style.display = 'none';
    
    // Show confirmation modal
    confirmModal.style.display = 'block';
}

/**
 * Prompt for cancellation of order by ID
 * @param {string} orderId - Order ID
 */
function promptCancelOrderById(orderId) {
    // Find order
    currentOrder = allOrders.find(o => o.id === orderId);
    if (!currentOrder) return;
    
    // Set up confirmation
    confirmMessage.textContent = `Are you sure you want to cancel order #${currentOrder.id}?`;
    currentAction = 'cancel';
    
    // Show confirmation modal
    confirmModal.style.display = 'block';
}

/**
 * Prompt for deletion of order by ID
 * @param {string} orderId - Order ID
 */
function promptDeleteOrderById(orderId) {
    // Find order
    currentOrder = allOrders.find(o => o.id === orderId);
    if (!currentOrder) return;
    
    // Set up confirmation
    confirmMessage.textContent = `Are you sure you want to delete order #${currentOrder.id}? This action cannot be undone.`;
    currentAction = 'delete';
    
    // Show confirmation modal
    confirmModal.style.display = 'block';
}

/**
 * Execute confirmed action
 */
function executeConfirmedAction() {
    if (!currentOrder || !currentAction) return;
    
    switch (currentAction) {
        case 'cancel':
            // Cancel order
            storageManager.updateOrderStatus(currentOrder.id, 'cancelled');
            break;
        case 'delete':
            // Delete order
            deleteOrder(currentOrder.id);
            break;
        default:
            break;
    }
    
    // Reset state
    currentOrder = null;
    currentAction = null;
    
    // Close modal
    closeModals();
    
    // Refresh data
    refreshData();
}

/**
 * Close all modals
 */
function closeModals() {
    if (orderDetailsModal) {
        orderDetailsModal.style.display = 'none';
    }
    
    if (confirmModal) {
        confirmModal.style.display = 'none';
    }
}

/**
 * Complete an order
 * @param {string} orderId - Order ID
 */
function completeOrder(orderId) {
        // Update order status
    storageManager.updateOrderStatus(orderId, 'ready');
    
    // Refresh data
    refreshData();
}

/**
 * Delete an order
 * @param {string} orderId - Order ID
 */
function deleteOrder(orderId) {
    // Filter out the order to delete
    const updatedOrders = allOrders.filter(order => order.id !== orderId);
    
    // Save to localStorage
    localStorage.setItem('campus_cafe_orders', JSON.stringify(updatedOrders));
    
    // Refresh data
    refreshData();
    
    // Check if all orders are empty or if all orders of certain type are empty
    const noOrdersRemain = updatedOrders.length === 0;
    const noCancelledOrdersRemain = !updatedOrders.some(order => order.status === 'cancelled');
    
    // Show appropriate empty states
    if (noOrdersRemain) {
        if (noOrdersMessage) noOrdersMessage.style.display = 'block';
    }
    
    if (noCancelledOrdersRemain) {
        if (noCancelledOrders) noCancelledOrders.style.display = 'block';
    }
}

/**
 * Toggle select all checkboxes
 * @param {boolean} checked - Whether to check or uncheck all
 * @param {string} type - Type of table (all, pending, cancelled)
 */
function toggleSelectAll(checked, type) {
    let checkboxes;
    
    switch (type) {
        case 'all':
            checkboxes = allOrdersBody.querySelectorAll('.order-checkbox');
            break;
        case 'pending':
            checkboxes = pendingOrdersBody.querySelectorAll('.order-checkbox');
            break;
        case 'cancelled':
            checkboxes = cancelledOrdersBody.querySelectorAll('.order-checkbox');
            break;
        default:
            return;
    }
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
    });
    
    updateBatchActionButtons(type);
}

/**
 * Update batch action buttons based on selection
 * @param {string} type - Type of table (all, pending, cancelled)
 */
function updateBatchActionButtons(type) {
    let checkboxes;
    let anyChecked = false;
    
    switch (type) {
        case 'all':
            checkboxes = allOrdersBody.querySelectorAll('.order-checkbox');
            anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            if (deleteSelectedBtn) {
                deleteSelectedBtn.disabled = !anyChecked;
            }
            break;
        case 'pending':
            checkboxes = pendingOrdersBody.querySelectorAll('.order-checkbox');
            anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            if (completeAllPendingBtn) {
                completeAllPendingBtn.disabled = !anyChecked;
            }
            break;
        case 'cancelled':
            checkboxes = cancelledOrdersBody.querySelectorAll('.order-checkbox');
            anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            if (clearCancelledBtn) {
                clearCancelledBtn.disabled = !anyChecked;
            }
            break;
        default:
            return;
    }
}

/**
 * Delete selected orders
 */
function deleteSelectedOrders() {
    const checkboxes = allOrdersBody.querySelectorAll('.order-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${checkboxes.length} selected order(s)? This cannot be undone.`)) {
        const orderIds = Array.from(checkboxes).map(checkbox => checkbox.dataset.id);
        
        // Filter out the selected orders
        const updatedOrders = allOrders.filter(order => !orderIds.includes(order.id));
        
        // Save to localStorage
        localStorage.setItem('campus_cafe_orders', JSON.stringify(updatedOrders));
        
        // Refresh data
        refreshData();
        
        // Show empty state if no orders remain
        if (updatedOrders.length === 0 && noOrdersMessage) {
            noOrdersMessage.style.display = 'block';
        }
    }
}

/**
 * Complete all selected pending orders
 */
function completeAllPendingOrders() {
    const checkboxes = pendingOrdersBody.querySelectorAll('.order-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    const orderIds = Array.from(checkboxes).map(checkbox => checkbox.dataset.id);
    
    // Update status for each order
    orderIds.forEach(id => {
        storageManager.updateOrderStatus(id, 'ready');
    });
    
    // Refresh data
    refreshData();
    
    // Check if there are any pending orders left
    const pendingOrdersRemain = allOrders.some(order => order.status === 'pending');
    
    // Show empty state if no pending orders remain
    if (!pendingOrdersRemain && noPendingOrders) {
        noPendingOrders.style.display = 'block';
    }
}

/**
 * Clear all selected cancelled orders
 */
function clearCancelledOrders() {
    const checkboxes = cancelledOrdersBody.querySelectorAll('.order-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    if (confirm('Are you sure you want to delete the selected cancelled orders? This cannot be undone.')) {
        const orderIds = Array.from(checkboxes).map(checkbox => checkbox.dataset.id);
        
        // Filter out the selected orders
        const updatedOrders = allOrders.filter(order => !orderIds.includes(order.id));
        
        // Save to localStorage
        localStorage.setItem('campus_cafe_orders', JSON.stringify(updatedOrders));
        
        // Refresh data
        refreshData();
        
        // Check if there are any cancelled orders left
        const cancelledOrdersRemain = updatedOrders.some(order => order.status === 'cancelled');
        
        // Show empty state if no cancelled orders remain
        if (!cancelledOrdersRemain && noCancelledOrders) {
            noCancelledOrders.style.display = 'block';
        }
    }
}

/**
 * Export orders to CSV
 * @param {string} type - Type of orders to export (all, pending, completed, cancelled)
 */
function exportOrders(type) {
    let ordersToExport;
    
    switch (type) {
        case 'all':
            ordersToExport = filteredOrders;
            break;
        case 'pending':
            ordersToExport = filteredOrders.filter(order => order.status === 'pending');
            break;
        case 'completed':
            ordersToExport = filteredOrders.filter(order => 
                order.status === 'completed' || order.status === 'ready'
            );
            break;
        case 'cancelled':
            ordersToExport = filteredOrders.filter(order => order.status === 'cancelled');
            break;
        default:
            ordersToExport = filteredOrders;
    }
    
    if (ordersToExport.length === 0) {
        alert('No orders to export');
        return;
    }
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += 'Order ID,Order Code,Customer Name,Admission Number,Phone Number,Items,Total,Status,Date\n';
    
    // Add rows
    ordersToExport.forEach(order => {
        const orderId = order.id;
        const orderCode = order.orderCode || '';
        const customerName = order.customerName || 'Guest';
        const admissionNumber = order.admissionNumber || '';
        const phoneNumber = order.phoneNumber || '';
        
        // Get items
        let itemsText = '';
        let orderTotal = 0;
        
        if (order.items && Array.isArray(order.items)) {
            itemsText = order.items.map(item => `${item.name} (x${item.quantity || 1})`).join('; ');
            orderTotal = parseFloat(order.totalAmount || order.totalPrice || 0);
        } else if (order.item) {
            itemsText = `${order.item.name} (x${order.quantity || 1})`;
            orderTotal = order.item.price * (order.quantity || 1);
        }
        
        // Format date
        const orderDate = new Date(order.orderTime || order.date);
        const formattedDate = orderDate.toISOString().split('T')[0];
        
        // Add row
        csvContent += `"${orderId}","${orderCode}","${customerName}","${admissionNumber}","${phoneNumber}","${itemsText}",${orderTotal.toFixed(2)},"${order.status || 'pending'}","${formattedDate}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus-cafe-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Download file
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - Whether the dates are the same day
 */
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * Format a date
 * @param {Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} - Formatted date
 */
function formatDate(date, includeTime = false) {
    if (includeTime) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} unsafe - Unsafe string
 * @returns {string} - Safe string
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Format a currency
 * @param {number} value - Value to format
 * @param {boolean} includeSymbol - Whether to include the currency symbol
 * @returns {string} - Formatted currency
 */
function formatCurrency(value, includeSymbol = true) {
    if (typeof value !== 'number' || isNaN(value)) return '';
    
    const formattedValue = value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'KES'
    });
    
    return includeSymbol ? formattedValue : formattedValue.replace(/[^0-9.,]/g, '');
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
