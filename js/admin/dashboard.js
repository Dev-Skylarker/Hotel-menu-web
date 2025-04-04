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
const markCompletedBtn = document.createElement('button'); // Will be added to DOM later
markCompletedBtn.className = 'btn btn-primary';
markCompletedBtn.id = 'mark-completed-btn';
markCompletedBtn.innerText = 'Mark as Completed';
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

// User management
const userManagementTab = document.querySelector('.tab-item[data-tab="users"]');
const userManagementContent = document.getElementById('users-tab');
const userListBody = document.getElementById('users-list-body');
const noUsersMessage = document.getElementById('no-users-message');
const userCountEl = document.getElementById('user-count');

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
    
    // Attach modal event listeners
    attachModalEventListeners();
    
    // Initialize tabs
    initTabs();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load user data if admin has access
    loadUserData();
    
    // Initialize charts
    initCharts();
    
    // Setup regular auth status check
    setupAuthCheck();
    
    // Start real-time sync if available
    if (typeof realtimeManager !== 'undefined') {
        // Register listeners for real-time updates
        realtimeManager.on('onOrdersUpdate', handleRealtimeOrdersUpdate);
        realtimeManager.on('onOrderStatusChange', handleOrderStatusChange);
        
        // Start real-time sync
        realtimeManager.startSync(5000); // 5 second interval
        
        console.log('Real-time sync initialized for dashboard');
    } else {
        console.warn('Real-time sync not available');
    }
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
    
    // Log the user out with redirect to welcome page
    authManager.logout(true);
    
    // Note: The redirect is now handled by the auth.js logout function
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
 * @param {string} type - Type of notification (success, error, info, warning)
 * @param {number} duration - Duration in ms to show the toast (default: 5000ms)
 */
function showToast(message, type = 'info', duration = 5000) {
    // Check if toast container exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        case 'error':
            icon = 'times-circle';
            break;
        default:
            icon = 'info-circle';
    }
    
    // Create toast content
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="toast-content">
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeToast(toast);
        });
    }
    
    // Auto-close after duration
    if (duration) {
        setTimeout(() => {
            closeToast(toast);
        }, duration);
    }
    
    // Return the toast element for potential further manipulation
    return toast;
}

/**
 * Close a toast notification
 * @param {HTMLElement} toast - Toast element to close
 */
function closeToast(toast) {
    if (!toast) return;
    
    // Add fade-out animation
    toast.style.animation = 'fade-out 0.3s forwards';
    
    // Remove after animation completes
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
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
    const dateFilterEl = document.getElementById('date-filter');
    const statusFilterEl = document.getElementById('status-filter');
    const searchOrdersEl = document.getElementById('search-orders');
    
    if (!dateFilterEl || !searchOrdersEl || !statusFilterEl) return;
    
    const dateFilter = dateFilterEl.value;
    const statusFilter = statusFilterEl.value;
    const searchQuery = searchOrdersEl.value.trim().toLowerCase();
    
    console.log('Applying filters:', { dateFilter, statusFilter, searchQuery });
    
    // Start with all orders
    filteredOrders = [...allOrders];
    
    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        let filterDate = new Date();
        
        switch (dateFilter) {
            case 'today':
                // Already set to today
                break;
            case 'yesterday':
                filterDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                filterDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                filterDate.setDate(now.getDate() - 30);
                break;
            default:
                break;
        }
        
        filterDate.setHours(0, 0, 0, 0);
        
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderTime);
            return orderDate >= filterDate;
        });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredOrders = filteredOrders.filter(order => {
            return (
                order.id.toLowerCase().includes(searchQuery) ||
                (order.customerName && order.customerName.toLowerCase().includes(searchQuery)) ||
                (order.admissionNumber && order.admissionNumber.toLowerCase().includes(searchQuery)) ||
                (order.orderCode && order.orderCode.toLowerCase().includes(searchQuery))
            );
        });
    }
    
    // Update order tables with filtered orders
    updateOrdersTable();
    
    // Show message if no orders match filters
    const noOrdersMessage = document.getElementById('no-orders-message');
    const ordersTable = document.getElementById('all-orders-table');
    
    if (noOrdersMessage && ordersTable) {
        if (filteredOrders.length === 0) {
            noOrdersMessage.style.display = 'block';
            ordersTable.style.display = 'none';
        } else {
            noOrdersMessage.style.display = 'none';
            ordersTable.style.display = 'table';
        }
    }
    
    // Update filter count
    if (allCountEl) {
        allCountEl.textContent = filteredOrders.length;
    }
    
    // Update URL with filters for bookmarking/sharing
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('date', dateFilter);
    if (statusFilter !== 'all') urlParams.set('status', statusFilter);
    if (searchQuery) urlParams.set('q', searchQuery);
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
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
 * @param {string} orderId - Order ID to view
 */
function viewOrderDetails(orderId) {
    // Find the order
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        console.error(`Order not found with ID: ${orderId}`);
        return;
    }
    
    // Store current order reference
    currentOrder = order;
    
    // Clear the modal content
    if (orderDetailsContent) {
        orderDetailsContent.innerHTML = '';
    }
    
    // Format order date
    const orderDate = new Date(order.orderTime);
    const formattedDate = formatDate(orderDate, true);
    
    // Calculate time elapsed
    const timeElapsed = getTimeElapsed(orderDate);
    
    // Create order details HTML
    const orderDetailsHTML = `
        <div class="order-details">
            <div class="order-header">
                <div class="order-id">
                    <h3>Order #${order.id}</h3>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div class="order-timestamp">
                    <p>${formattedDate}</p>
                    <p>${timeElapsed}</p>
                </div>
            </div>
            
            <div class="customer-info">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> ${escapeHtml(order.customerName || 'Not provided')}</p>
                ${order.admissionNumber ? `<p><strong>Admission #:</strong> ${escapeHtml(order.admissionNumber)}</p>` : ''}
                ${order.collectionMethod ? `<p><strong>Collection:</strong> ${order.collectionMethod === 'table' ? 'Serve at Table' : 'Pickup at Counter'}</p>` : ''}
                ${order.collectionLocation ? `<p><strong>Location:</strong> ${escapeHtml(order.collectionLocation)}</p>` : ''}
            </div>
            
            <div class="order-items">
                <h4>Order Items</h4>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items ? 
                            order.items.map(entry => `
                                <tr>
                                    <td>${escapeHtml(entry.item.name)}</td>
                                    <td>${entry.quantity}</td>
                                    <td>${formatCurrency(entry.item.price)}</td>
                                    <td>${formatCurrency(entry.item.price * entry.quantity)}</td>
                                </tr>
                            `).join('') :
                            `<tr>
                                <td>${escapeHtml(order.item.name)}</td>
                                <td>${order.quantity || 1}</td>
                                <td>${formatCurrency(order.item.price)}</td>
                                <td>${formatCurrency(order.item.price * (order.quantity || 1))}</td>
                            </tr>`
                        }
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-right"><strong>Total:</strong></td>
                            <td>${formatCurrency(order.total || calculateOrderTotal(order))}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="payment-info">
                <h4>Payment Information</h4>
                <p><strong>Method:</strong> ${order.paymentMethod || 'Not specified'}</p>
                <p><strong>Status:</strong> ${order.paymentStatus || 'Not specified'}</p>
                ${order.orderCode ? `<p><strong>Order Code:</strong> <span class="order-code">${order.orderCode}</span></p>` : ''}
            </div>
            
            ${order.notes ? `
                <div class="order-notes">
                    <h4>Notes</h4>
                    <p>${escapeHtml(order.notes)}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    // Set the HTML content
    if (orderDetailsContent) {
        orderDetailsContent.innerHTML = orderDetailsHTML;
    }
    
    // Add buttons based on order status
    const modalFooter = orderDetailsModal.querySelector('.modal-footer');
    
    // Clear existing action buttons (keeping close button)
    const actionButtons = modalFooter.querySelectorAll('.btn:not(.close-modal)');
    actionButtons.forEach(btn => btn.remove());
    
    // Button configurations based on status
    if (order.status === 'pending') {
        // Add mark as ready button
        modalFooter.appendChild(markReadyBtn);
        
        // Add cancel order button
        modalFooter.appendChild(cancelOrderBtn);
    } else if (order.status === 'ready') {
        // Add mark as completed button
        modalFooter.appendChild(markCompletedBtn);
        
        // Add cancel order button
        modalFooter.appendChild(cancelOrderBtn);
    } else if (order.status === 'completed') {
        // No action buttons for completed orders
    } else if (order.status === 'cancelled') {
        // Create restore button for cancelled orders
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'btn btn-warning';
        restoreBtn.id = 'restore-order-btn';
        restoreBtn.innerText = 'Restore Order';
        restoreBtn.addEventListener('click', () => promptRestoreOrder());
        modalFooter.appendChild(restoreBtn);
    }
    
    // Open the modal
    orderDetailsModal.classList.add('show');
}

/**
 * Mark current order as completed
 */
function markOrderCompleted() {
    if (!currentOrder) return;
    
    // Use the notifications system if available
    if (typeof notificationsManager !== 'undefined') {
        notificationsManager.confirm(
            `Are you sure you want to mark order #${currentOrder.id} as completed?`,
            () => {
                // Complete the order
                completeOrder(currentOrder.id);
                
                // Close the modal
                closeModals();
                
                // Show success message
                showToast(`Order #${currentOrder.id} has been completed`, 'success');
                
                // Send notification to user
                sendOrderNotification(currentOrder.id, 'completed');
            },
            null,
            'Complete Order',
            'Yes, Complete Order',
            'Cancel'
        );
    } else {
        // Original implementation
        completeOrder(currentOrder.id);
        closeModals();
    }
}

/**
 * Attach event listeners to buttons in the order details modal
 */
function attachModalEventListeners() {
    // Close modal buttons
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Mark as ready button
    if (markReadyBtn) {
        markReadyBtn.addEventListener('click', markOrderReady);
    }
    
    // Mark as completed button
    if (markCompletedBtn) {
        markCompletedBtn.addEventListener('click', markOrderCompleted);
    }
    
    // Cancel order button
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', promptCancelOrder);
    }
    
    // Confirm action button
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', executeConfirmedAction);
    }
}

/**
 * Mark order as ready (change status from pending to ready)
 */
function markOrderReady() {
    if (!currentOrder) return;
    
    // Use the notifications system if available
    if (typeof notificationsManager !== 'undefined') {
        notificationsManager.confirm(
            `Are you sure you want to mark order #${currentOrder.id} as ready for pickup?`,
            () => {
                // Update order status
                storageManager.updateOrderStatus(currentOrder.id, 'ready');
                
                // Close the modal
                closeModals();
                
                // Refresh tables
                updateOrdersTable();
                updatePendingOrdersTable();
                
                // Show success message
                showToast(`Order #${currentOrder.id} marked as ready for pickup`, 'success');
                
                // Send notification to user
                sendOrderNotification(currentOrder.id, 'ready');
            },
            null,
            'Mark Order Ready',
            'Yes, Mark as Ready',
            'Cancel'
        );
    } else {
        // Original implementation
        storageManager.updateOrderStatus(currentOrder.id, 'ready');
        closeModals();
        updateOrdersTable();
        updatePendingOrdersTable();
        showToast(`Order ${currentOrder.id} marked as ready`, 'success');
    }
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
    
    // Use the notifications system if available
    if (typeof notificationsManager !== 'undefined') {
        notificationsManager.confirm(
            `Are you sure you want to cancel order #${currentOrder.id}?`,
            () => {
                // Cancel order
                storageManager.updateOrderStatus(currentOrder.id, 'cancelled');
                
                // Refresh data
                refreshData();
                
                // Show success message
                showToast(`Order #${currentOrder.id} has been cancelled`, 'success');
            },
            null,
            'Cancel Order',
            'Yes, Cancel Order',
            'No, Keep Order'
        );
    } else {
        // Fall back to old system
        confirmMessage.textContent = `Are you sure you want to cancel order #${currentOrder.id}?`;
        currentAction = 'cancel';
        confirmModal.style.display = 'block';
    }
}

/**
 * Prompt for deletion of order by ID
 * @param {string} orderId - Order ID
 */
function promptDeleteOrderById(orderId) {
    // Find order
    currentOrder = allOrders.find(o => o.id === orderId);
    if (!currentOrder) return;
    
    // Use the notifications system if available
    if (typeof notificationsManager !== 'undefined') {
        notificationsManager.confirm(
            `Are you sure you want to delete order #${currentOrder.id}? This action cannot be undone.`,
            () => {
                // Delete order
                deleteOrder(currentOrder.id);
                
                // Show success message
                showToast(`Order #${currentOrder.id} has been deleted`, 'success');
            },
            null,
            'Delete Order',
            'Yes, Delete Order',
            'No, Keep Order'
        );
    } else {
        // Fall back to old system
        confirmMessage.textContent = `Are you sure you want to delete order #${currentOrder.id}? This action cannot be undone.`;
        currentAction = 'delete';
        confirmModal.style.display = 'block';
    }
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
 * Complete an order (change status to completed)
 * @param {string} orderId - Order ID to complete
 */
function completeOrder(orderId) {
    // If realtimeManager is available, use it to update order status
    if (typeof realtimeManager !== 'undefined') {
        realtimeManager.updateOrderStatus(orderId, 'completed');
    } else {
        // Fall back to storage manager
        storageManager.updateOrderStatus(orderId, 'completed');
    }
    
    // Refresh the orders tables
    updateOrdersTable();
    updatePendingOrdersTable();
    updateCompletedOrdersTable();
    
    // Show success message
    showToast(`Order ${orderId} marked as completed`, 'success');
    
    // Update metrics and charts
    updateMetrics();
    updateCharts();
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
    const pendingOrders = allOrders.filter(order => order.status === 'pending' || order.status === 'ready');
    
    if (pendingOrders.length === 0) {
        showToast('No pending orders to complete', 'info');
        return;
    }
    
    // Use the notifications system if available
    if (typeof notificationsManager !== 'undefined') {
        notificationsManager.confirm(
            `Are you sure you want to mark all ${pendingOrders.length} pending orders as completed?`,
            () => {
                let completedCount = 0;
                
                // Complete each order
                pendingOrders.forEach(order => {
                    storageManager.updateOrderStatus(order.id, 'completed');
                    completedCount++;
                    
                    // Send notification to user
                    sendOrderNotification(order.id, 'completed');
                });
                
                // Refresh data
                refreshData();
                
                // Show success message
                showToast(`${completedCount} orders marked as completed`, 'success');
            },
            null,
            'Complete All Pending Orders',
            'Yes, Complete All',
            'Cancel'
        );
    } else {
        // Original implementation
        let completedCount = 0;
        
        pendingOrders.forEach(order => {
            storageManager.updateOrderStatus(order.id, 'completed');
            completedCount++;
        });
        
        refreshData();
        showToast(`${completedCount} orders marked as completed`, 'success');
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

/**
 * Handle real-time order updates
 * @param {Array} orders - Updated orders array
 */
function handleRealtimeOrdersUpdate(orders) {
    console.log('Real-time order update received', orders.length);
    
    // Update allOrders reference
    allOrders = orders;
    
    // Update UI
    updateOrdersTable();
    updatePendingOrdersTable();
    updateCompletedOrdersTable();
    updateCancelledOrdersTable();
    
    // Update metrics
    updateMetrics();
    
    // Update charts if needed
    updateCharts();
    
    // Show toast notification
    showToast('Orders updated in real-time', 'info');
}

/**
 * Handle order status change
 * @param {Object} data - Status change data {orderId, status, order}
 */
function handleOrderStatusChange(data) {
    console.log('Order status changed:', data.orderId, 'to', data.status);
    
    // Show toast notification
    showToast(`Order ${data.orderId} marked as ${data.status}`, 'success');
    
    // Refresh order view if this is the currently viewed order
    if (currentOrder && currentOrder.id === data.orderId) {
        viewOrderDetails(data.orderId);
    }
}

/**
 * Load user data for admin dashboard
 */
function loadUserData() {
    // Check if user tab exists
    if (!userManagementTab || !userManagementContent || !userListBody) {
        console.log('User management UI elements not found');
        return;
    }
    
    // Ensure user tab is visible for superadmins
    const isSuperAdmin = authManager.isSuperAdmin();
    if (isSuperAdmin) {
        userManagementTab.style.display = '';
    } else {
        userManagementTab.style.display = 'none';
        return;
    }
    
    // Get users from storage
    let users = [];
    try {
        // First try to get from local storage
        const usersData = localStorage.getItem('campus_cafe_users');
        if (usersData) {
            users = JSON.parse(usersData);
        }
        
        // If Supabase is available, try to get from there too
        if (typeof supabaseManager !== 'undefined') {
            supabaseManager.getAllUsers()
                .then(result => {
                    if (!result.error && result.data && result.data.length > 0) {
                        // Merge users, prioritizing Supabase data
                        const existingEmails = users.map(u => u.email.toLowerCase());
                        result.data.forEach(supabaseUser => {
                            const email = supabaseUser.email.toLowerCase();
                            if (!existingEmails.includes(email)) {
                                users.push(supabaseUser);
                            }
                        });
                        
                        populateUserTable(users);
                    }
                })
                .catch(err => {
                    console.error('Error fetching Supabase users:', err);
                });
        }
    } catch (error) {
        console.error('Error loading users:', error);
        users = [];
    }
    
    // Populate user table
    populateUserTable(users);
}

/**
 * Populate user table with data
 * @param {Array} users - Array of user objects
 */
function populateUserTable(users) {
    if (!userListBody) return;
    
    // Clear existing content
    userListBody.innerHTML = '';
    
    // Update user count
    if (userCountEl) {
        userCountEl.textContent = users.length;
    }
    
    // Check if users exist
    if (!users || users.length === 0) {
        if (noUsersMessage) {
            noUsersMessage.style.display = 'block';
        }
        return;
    }
    
    // Hide empty message
    if (noUsersMessage) {
        noUsersMessage.style.display = 'none';
    }
    
    // Sort users by role (superadmin first, then admin, then regular)
    users.sort((a, b) => {
        const roleA = a.role || '';
        const roleB = b.role || '';
        
        if (roleA === 'superadmin' && roleB !== 'superadmin') return -1;
        if (roleA !== 'superadmin' && roleB === 'superadmin') return 1;
        if (roleA === 'admin' && roleB !== 'admin') return -1;
        if (roleA !== 'admin' && roleB === 'admin') return 1;
        
        // Sort by email if roles are the same
        return a.email.localeCompare(b.email);
    });
    
    // Add each user to table
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Get user properties
        const email = user.email || '';
        const name = user.name || user.user_metadata?.name || email.split('@')[0];
        const role = user.role || 'user';
        const admissionNumber = user.admissionNumber || user.user_metadata?.admissionNumber || 'N/A';
        const ordersCount = getUserOrdersCount(user);
        
        // Create row content
        row.innerHTML = `
            <td>${name}</td>
            <td>${email}</td>
            <td>${admissionNumber}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(role)}">${role}</span>
            </td>
            <td>${ordersCount}</td>
            <td>
                <div class="actions">
                    <button class="action-btn view-btn" title="View User Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" title="Edit User" ${role === 'superadmin' ? 'disabled' : ''}>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete User" ${role === 'superadmin' ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Add to table
        userListBody.appendChild(row);
        
        // Add event listeners
        const viewBtn = row.querySelector('.view-btn');
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', () => viewUserDetails(user));
        }
        
        if (editBtn && role !== 'superadmin') {
            editBtn.addEventListener('click', () => editUser(user));
        }
        
        if (deleteBtn && role !== 'superadmin') {
            deleteBtn.addEventListener('click', () => promptDeleteUser(user));
        }
    });
}

/**
 * Get CSS class for role badge
 * @param {string} role - User role
 * @returns {string} - CSS class
 */
function getRoleBadgeClass(role) {
    switch (role) {
        case 'superadmin':
            return 'badge-danger';
        case 'admin':
            return 'badge-warning';
        default:
            return 'badge-info';
    }
}

/**
 * Get count of orders for a user
 * @param {Object} user - User object
 * @returns {number} - Order count
 */
function getUserOrdersCount(user) {
    if (!user || !allOrders || allOrders.length === 0) return 0;
    
    const email = user.email?.toLowerCase();
    const admissionNumber = user.admissionNumber || user.user_metadata?.admissionNumber;
    
    if (!email && !admissionNumber) return 0;
    
    return allOrders.filter(order => {
        // Match by email
        if (email && order.userEmail?.toLowerCase() === email) {
            return true;
        }
        
        // Match by admission number
        if (admissionNumber && order.admissionNumber === admissionNumber) {
            return true;
        }
        
        return false;
    }).length;
}

/**
 * View user details
 * @param {Object} user - User object
 */
function viewUserDetails(user) {
    // Implementation will depend on UI design
    console.log('View user details:', user);
    
    // Show toast for now
    showToast(`Viewing details for ${user.name || user.email}`, 'info');
}

/**
 * Edit user
 * @param {Object} user - User object
 */
function editUser(user) {
    // Implementation will depend on UI design
    console.log('Edit user:', user);
    
    // Show toast for now
    showToast(`Editing ${user.name || user.email}`, 'info');
}

/**
 * Prompt to delete user
 * @param {Object} user - User object
 */
function promptDeleteUser(user) {
    if (typeof notificationsManager !== 'undefined') {
        notificationsManager.confirm(
            `Are you sure you want to delete user ${user.name || user.email}? This action cannot be undone.`,
            () => deleteUser(user),
            null,
            'Delete User',
            'Yes, Delete User',
            'Cancel'
        );
    } else {
        // Fallback to alert
        if (confirm(`Are you sure you want to delete user ${user.name || user.email}? This action cannot be undone.`)) {
            deleteUser(user);
        }
    }
}

/**
 * Delete user
 * @param {Object} user - User object
 */
function deleteUser(user) {
    try {
        // Get users from localStorage
        const usersData = localStorage.getItem('campus_cafe_users');
        let users = usersData ? JSON.parse(usersData) : [];
        
        // Filter out the user to delete
        users = users.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
        
        // Save back to localStorage
        localStorage.setItem('campus_cafe_users', JSON.stringify(users));
        
        // If Supabase is available, try to delete there too
        if (typeof supabaseManager !== 'undefined') {
            supabaseManager.deleteUser(user.id || user.email)
                .catch(err => {
                    console.error('Error deleting Supabase user:', err);
                });
        }
        
        // Refresh user table
        loadUserData();
        
        // Show success message
        showToast(`User ${user.name || user.email} has been deleted`, 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error deleting user', 'error');
    }
}

/**
 * Send a notification to the user about their order
 * @param {string} orderId - Order ID
 * @param {string} status - New status of the order
 */
function sendOrderNotification(orderId, status) {
    // Find the order
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Get user email
    const userEmail = order.userEmail;
    const admissionNumber = order.admissionNumber;
    
    if (!userEmail && !admissionNumber) {
        console.log('No user identifier found for order:', orderId);
        return;
    }
    
    console.log(`Sending ${status} notification for order ${orderId} to user ${userEmail || admissionNumber}`);
    
    // Store notification in localStorage for demo
    const notificationsData = localStorage.getItem('campus_cafe_notifications') || '[]';
    const notifications = JSON.parse(notificationsData);
    
    // Create notification
    const notification = {
        id: Date.now().toString(),
        orderId: orderId,
        userEmail: userEmail,
        admissionNumber: admissionNumber,
        status: status,
        timestamp: new Date().toISOString(),
        message: getNotificationMessage(order, status),
        read: false
    };
    
    // Add to notifications
    notifications.push(notification);
    
    // Save back to localStorage
    localStorage.setItem('campus_cafe_notifications', JSON.stringify(notifications));
    
    console.log('Notification saved:', notification);
}

/**
 * Get notification message based on order status
 * @param {Object} order - Order object
 * @param {string} status - Order status
 * @returns {string} - Notification message
 */
function getNotificationMessage(order, status) {
    const orderNumber = order.id;
    
    switch (status) {
        case 'pending':
            return `Your order #${orderNumber} has been received and is pending processing.`;
        case 'ready':
            return `Good news! Your order #${orderNumber} is now ready for pickup.`;
        case 'completed':
            return `Your order #${orderNumber} has been completed. Thank you for your business!`;
        case 'cancelled':
            return `Your order #${orderNumber} has been cancelled.`;
        default:
            return `Your order #${orderNumber} status has been updated to: ${status}`;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
