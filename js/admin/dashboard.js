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
let currentSearchTerm = '';

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
    
    // Initialize item statistics
    initItemStatistics();
    
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
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Tab navigation
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Refresh data button
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', () => refreshData(true));
    }
    
    // Apply filters button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Search input and clear button setup
    if (searchOrders) {
        const clearSearchBtn = document.getElementById('clear-search-admin');
        
        // Show/hide clear button based on input
        searchOrders.addEventListener('input', () => {
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchOrders.value ? 'flex' : 'none';
            }
        });
        
        // Apply filters on Enter key
        searchOrders.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
        
        // Add click handler for clear button
        if (clearSearchBtn) {
            // Initialize clear button visibility
            clearSearchBtn.style.display = searchOrders.value ? 'flex' : 'none';
            
            // Add click handler
            clearSearchBtn.addEventListener('click', () => {
                searchOrders.value = '';
                searchOrders.focus();
                clearSearchBtn.style.display = 'none';
                applyFilters();
            });
        }
    }
    
    // Reset filters button (in no orders message)
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Date filter - automatically apply when changed
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    // Collection type filter - automatically apply when changed
    const collectionTypeFilter = document.getElementById('collection-type-filter');
    if (collectionTypeFilter) {
        collectionTypeFilter.addEventListener('change', applyFilters);
    }
    
    // Add event listeners for batch actions
    setupBatchActionListeners();
    
    // Select all checkbox functionality
    setupSelectAllCheckboxes();
    
    // Add event listeners for modal close buttons
    setupModalCloseListeners();
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
 * Refresh all dashboard data
 * @param {boolean} showToast - Whether to show a toast notification
 * @returns {Promise} - Promise that resolves when data is refreshed
 */
function refreshData(showToast = true) {
    console.log('Refreshing dashboard data...');
    
    // Show loading indicator
    const refreshButton = document.getElementById('refresh-data');
    if (refreshButton) {
        refreshButton.innerHTML = '<i class="fas fa-sync fa-spin"></i> Refreshing...';
        refreshButton.disabled = true;
    }
    
    return new Promise((resolve) => {
        // Update last refresh time
        updateLastRefreshTime();
        
        // Load orders
        allOrders = storageManager.getOrders();
        filteredOrders = [...allOrders];
        
        // Update metrics
        updateMetrics();
        
        // Update orders tables
        updateOrdersTable();
        
        // Update charts
        updateCharts();
        
        // Show toast notification if enabled
        if (showToast) {
            showToast('Dashboard data refreshed successfully', 'success');
        }
        
        // Reset refresh button
        if (refreshButton) {
            refreshButton.innerHTML = '<i class="fas fa-sync"></i> Refresh Data';
            refreshButton.disabled = false;
        }
        
        // Setup auto-refresh
        setupAutoRefresh();
        
        resolve();
    });
}

/**
 * Setup auto-refresh for real-time updates
 */
function setupAutoRefresh() {
    // Clear any existing auto-refresh
    if (window.dashboardRefreshTimer) {
        clearInterval(window.dashboardRefreshTimer);
    }
    
    // Set auto-refresh timer (every 10 seconds for more real-time updates)
    window.dashboardRefreshTimer = setInterval(() => {
        // Only refresh if page is visible to save resources
        if (!document.hidden) {
            refreshData(false); // Don't show toast for auto-refresh
        }
    }, 10000); // 10 seconds for more real-time feel
    
    // Add visibility listener to refresh when tab becomes visible
    if (!window.hasVisibilityListener) {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                refreshData(false);
            }
        });
        window.hasVisibilityListener = true;
    }
    
    // Add storage listener to refresh when orders change
    if (!window.hasStorageListener) {
        window.addEventListener('storage', (e) => {
            if (e.key === 'campus_cafe_orders') {
                refreshData(false);
            }
        });
        window.hasStorageListener = true;
    }
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
 * Filters orders based on date, search term and status
 */
function applyFilters() {
    console.log('Applying filters to orders...');
    
    // Get filter values
    const dateValue = dateFilter ? dateFilter.value : '';
    const searchValue = searchOrders ? searchOrders.value.toLowerCase().trim() : '';
    const collectionTypeFilter = document.getElementById('collection-type-filter');
    const collectionType = collectionTypeFilter ? collectionTypeFilter.value : 'all';
    
    // Save current search term
    currentSearchTerm = searchValue;
    
    // Reset to all orders first
    filteredOrders = [...allOrders];
    
    // Filter orders
    filteredOrders = allOrders.filter(order => {
        // Filter by date if selected
        if (dateValue) {
            const orderDate = new Date(order.orderTime);
            const filterDate = new Date(dateValue);
            if (!isSameDay(orderDate, filterDate)) {
                return false;
            }
        }
        
        // Filter by collection type
        if (collectionType !== 'all' && order.collectionMethod !== collectionType) {
            return false;
        }
        
        // Filter by search term
        if (searchValue) {
            // Search by various fields
            const orderId = (order.id || order.orderId || '').toLowerCase();
            const orderCode = (order.orderCode || '').toLowerCase();
            const customerName = (order.customerName || '').toLowerCase();
            const admissionNumber = (order.admissionNumber || '').toLowerCase();
            
            // Match against normalized search value
            const normalizedSearch = searchValue.replace(/[-\s]/g, '');
            const normalizedOrderId = orderId.replace(/[-\s]/g, '');
            const normalizedOrderCode = orderCode.replace(/[-\s]/g, '');
            
            // Check for matches with or without formatting
            const orderIdMatch = orderId.includes(searchValue) || normalizedOrderId.includes(normalizedSearch);
            const orderCodeMatch = orderCode.includes(searchValue) || normalizedOrderCode.includes(normalizedSearch);
            const customerNameMatch = customerName.includes(searchValue);
            const admissionNumberMatch = admissionNumber.includes(searchValue);
            
            if (!orderIdMatch && !orderCodeMatch && !customerNameMatch && !admissionNumberMatch) {
                return false;
            }
        }
        
        return true;
    });
    
    // Update tables with filtered orders
    updateOrdersTable();
    updatePendingOrdersTable();
    updateCompletedOrdersTable();
    updateCancelledOrdersTable();
    
    // Show toast notification
    showToast(`Filtered to ${filteredOrders.length} order(s)`, 'info');
    
    // Update active filters indicator
    updateActiveFiltersIndicator();
}

/**
 * Update active filters indicator
 */
function updateActiveFiltersIndicator() {
    const filtersContainer = document.querySelector('.order-filters');
    if (!filtersContainer) return;
    
    // Remove any existing indicator
    const existingIndicator = document.querySelector('.active-filters-badge');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Check if filters are active
    const dateValue = dateFilter ? dateFilter.value : '';
    const searchValue = searchOrders ? searchOrders.value : '';
    const collectionTypeFilter = document.getElementById('collection-type-filter');
    const collectionType = collectionTypeFilter ? collectionTypeFilter.value : 'all';
    
    // Count active filters
    const activeFiltersCount = (dateValue ? 1 : 0) + 
                           (searchValue ? 1 : 0) + 
                           (collectionType !== 'all' ? 1 : 0);
    
    // Add indicator if filters are active
    if (activeFiltersCount > 0) {
        const indicator = document.createElement('span');
        indicator.className = 'active-filters-badge';
        indicator.textContent = activeFiltersCount;
        indicator.title = `${activeFiltersCount} active filter(s)`;
        
        filtersContainer.appendChild(indicator);
    }
}

/**
 * Clear all filters
 */
function clearFilters() {
    console.log('Clearing all filters...');
    
    // Reset date filter
    if (dateFilter) dateFilter.value = '';
    
    // Reset search filter
    if (searchOrders) searchOrders.value = '';
    
    // Reset collection type filter
    const collectionTypeFilter = document.getElementById('collection-type-filter');
    if (collectionTypeFilter) collectionTypeFilter.value = 'all';
    
    // Reset search term and reapply filters
    currentSearchTerm = '';
    
    // Load all orders
    filteredOrders = [...allOrders];
    
    // Update all tables
    updateOrdersTable();
    updatePendingOrdersTable();
    updateCompletedOrdersTable();
    updateCancelledOrdersTable();
    
    // Clear any filter indicators
    updateActiveFiltersIndicator();
    
    // Show toast notification
    showToast('Filters cleared', 'info');
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
        
        // Add empty message to the table body itself to maintain structure
        pendingOrdersBody.innerHTML = `<tr class="empty-row">
            <td colspan="7" class="text-center">
                <div class="table-empty-state">
                    <p>No pending orders at the moment!</p>
                </div>
            </td>
        </tr>`;
        
        return;
    }
    
    // Hide empty message
    if (noPendingOrders) {
        noPendingOrders.style.display = 'none';
    }
    
    // Enable batch actions
    if (completeAllPendingBtn) {
        completeAllPendingBtn.disabled = false;
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
        
        // Add empty message to the table body itself to maintain structure
        completedOrdersBody.innerHTML = `<tr class="empty-row">
            <td colspan="6" class="text-center">
                <div class="table-empty-state">
                    <p>No completed orders yet.</p>
                </div>
            </td>
        </tr>`;
        
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
 * @param {string} type - Table type (all, pending, completed, cancelled)
 * @returns {HTMLElement} - Table row element
 */
function createOrderRow(order, type) {
    const row = document.createElement('tr');
    row.dataset.orderId = order.id || order.orderId;
    
    // Checkbox cell
    const checkboxCell = document.createElement('td');
    checkboxCell.className = 'checkbox-cell';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = `select-order select-${type}`;
    checkbox.dataset.orderId = order.id || order.orderId;
    checkboxCell.appendChild(checkbox);
    
    // Format date
    const orderDate = new Date(order.orderTime || order.date);
    const formattedDate = formatDate(orderDate, true);
    
    // Format total with currency symbol
    const formattedTotal = formatCurrency(order.total || "0.00");
    
    // Customer information with admission number
    const customerName = order.customerName || 'Guest';
    const admissionNumber = order.admissionNumber ? `<div class="customer-admission">#${order.admissionNumber}</div>` : '';
    
    // Collection information
    const collectionType = order.collectionMethod === 'table' ? 'Table' : 'Pickup';
    const collectionLocation = order.collectionLocation || 'Not specified';
    const collectionInfo = `<div class="collection-type">${collectionType}</div>
                          <div class="collection-location">${escapeHtml(collectionLocation)}</div>`;
    
    // Order code for reference
    const orderCode = order.orderCode ? 
        `<span class="order-code">${order.orderCode}</span>` : '';
    
    // Status badge
    const statusClass = order.status === 'pending' ? 'status-pending' : 
                      order.status === 'ready' ? 'status-ready' :
                      order.status === 'completed' ? 'status-completed' : 
                      'status-cancelled';
    const statusText = order.status === 'pending' ? 'Pending' : 
                      order.status === 'ready' ? 'Ready' :
                      order.status === 'completed' ? 'Completed' : 
                      'Cancelled';
    
    // Items summary
    let itemsSummary = '';
    if (order.items) {
        const itemsList = order.items.map(item => {
            const itemName = typeof item.item === 'object' ? item.item.name : item.name;
            const qty = item.quantity || 1;
            return `${qty}x ${itemName}`;
        }).join(', ');
        
        itemsSummary = itemsList;
    }
    
    // Set row HTML based on the table type
    row.innerHTML = `
        <td class="checkbox-cell">${checkboxCell.innerHTML}</td>
        <td class="order-id-cell">
            <div>${order.id || order.orderId}</div>
            ${orderCode}
        </td>
        <td class="customer-cell">
            <div class="customer-name">${escapeHtml(customerName)}</div>
            ${admissionNumber}
        </td>
        <td class="date-cell">${formattedDate}</td>
        <td class="collection-cell">${collectionInfo}</td>
        <td class="items-cell" title="${escapeHtml(itemsSummary)}">
            ${escapeHtml(itemsSummary.length > 40 ? itemsSummary.substring(0, 40) + '...' : itemsSummary)}
        </td>
        <td class="total-cell">${formattedTotal}</td>
        <td class="status-cell">
            <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td class="actions-cell">
            <button class="btn btn-icon btn-sm view-order" title="View Details" data-order-id="${order.id || order.orderId}">
                <i class="fas fa-eye"></i>
            </button>
            ${order.status === 'pending' ? 
                `<button class="btn btn-icon btn-sm mark-ready" title="Mark Ready" data-order-id="${order.id || order.orderId}">
                    <i class="fas fa-check"></i>
                </button>` : ''}
            ${order.status !== 'cancelled' && order.status !== 'completed' ? 
                `<button class="btn btn-icon btn-sm btn-danger cancel-order" title="Cancel Order" data-order-id="${order.id || order.orderId}">
                    <i class="fas fa-times"></i>
                </button>` : ''}
            <button class="btn btn-icon btn-sm btn-danger delete-order" title="Delete Order" data-order-id="${order.id || order.orderId}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
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
        btn.addEventListener('click', () => viewOrderDetails(btn.dataset.orderId));
    });
    
    // Complete order buttons
    tableBody.querySelectorAll('.mark-ready').forEach(btn => {
        btn.addEventListener('click', () => completeOrder(btn.dataset.orderId));
    });
    
    // Cancel order buttons
    tableBody.querySelectorAll('.cancel-order').forEach(btn => {
        btn.addEventListener('click', () => promptCancelOrderById(btn.dataset.orderId));
    });
    
    // Delete order buttons
    tableBody.querySelectorAll('.delete-order').forEach(btn => {
        btn.addEventListener('click', () => promptDeleteOrderById(btn.dataset.orderId));
    });
    
    // Order checkboxes
    tableBody.querySelectorAll('.select-order').forEach(checkbox => {
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
            checkboxes = allOrdersBody.querySelectorAll('.select-order');
            break;
        case 'pending':
            checkboxes = pendingOrdersBody.querySelectorAll('.select-order');
            break;
        case 'cancelled':
            checkboxes = cancelledOrdersBody.querySelectorAll('.select-order');
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
            checkboxes = allOrdersBody.querySelectorAll('.select-order');
            anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            if (deleteSelectedBtn) {
                deleteSelectedBtn.disabled = !anyChecked;
            }
            break;
        case 'pending':
            checkboxes = pendingOrdersBody.querySelectorAll('.select-order');
            anyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            if (completeAllPendingBtn) {
                completeAllPendingBtn.disabled = !anyChecked;
            }
            break;
        case 'cancelled':
            checkboxes = cancelledOrdersBody.querySelectorAll('.select-order');
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
    const checkboxes = allOrdersBody.querySelectorAll('.select-order:checked');
    if (checkboxes.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${checkboxes.length} selected order(s)? This cannot be undone.`)) {
        const orderIds = Array.from(checkboxes).map(checkbox => checkbox.dataset.orderId);
        
        // Filter out the selected orders
        const updatedOrders = allOrders.filter(order => !orderIds.includes(order.id || order.orderId));
        
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
    const checkboxes = pendingOrdersBody.querySelectorAll('.select-order:checked');
    if (checkboxes.length === 0) return;
    
    const orderIds = Array.from(checkboxes).map(checkbox => checkbox.dataset.orderId);
    
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
    const checkboxes = cancelledOrdersBody.querySelectorAll('.select-order:checked');
    if (checkboxes.length === 0) return;
    
    if (confirm('Are you sure you want to delete the selected cancelled orders? This cannot be undone.')) {
        const orderIds = Array.from(checkboxes).map(checkbox => checkbox.dataset.orderId);
        
        // Filter out the selected orders
        const updatedOrders = allOrders.filter(order => !orderIds.includes(order.id || order.orderId));
        
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
 * Set up event listeners for batch actions
 */
function setupBatchActionListeners() {
    // Export orders
    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener('click', () => exportOrders('all'));
    }
    
    // Delete selected orders
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedOrders);
    }
    
    // Complete all pending orders
    if (completeAllPendingBtn) {
        completeAllPendingBtn.addEventListener('click', completeAllPendingOrders);
    }
    
    // Clear cancelled orders
    if (clearCancelledBtn) {
        clearCancelledBtn.addEventListener('click', clearCancelledOrders);
    }
}

/**
 * Set up event listeners for select all checkboxes
 */
function setupSelectAllCheckboxes() {
    // Select all orders
    const selectAllOrders = document.getElementById('select-all-orders');
    if (selectAllOrders) {
        selectAllOrders.addEventListener('change', e => toggleSelectAll(e.target.checked, 'all'));
    }
    
    // Select all pending
    const selectAllPending = document.getElementById('select-all-pending');
    if (selectAllPending) {
        selectAllPending.addEventListener('change', e => toggleSelectAll(e.target.checked, 'pending'));
    }
    
    // Select all cancelled
    const selectAllCancelled = document.getElementById('select-all-cancelled');
    if (selectAllCancelled) {
        selectAllCancelled.addEventListener('change', e => toggleSelectAll(e.target.checked, 'cancelled'));
    }
}

/**
 * Set up event listeners for modal close buttons and actions
 */
function setupModalCloseListeners() {
    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Mark ready button
    if (markReadyBtn) {
        markReadyBtn.addEventListener('click', markOrderReady);
    }
    
    // Cancel order button
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', promptCancelOrder);
    }
    
    // Confirm action button
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
 * Initialize Item Statistics
 */
function initItemStatistics() {
    loadPopularItems();
    loadLowStockItems();
    loadCategoryPerformance();
    loadRevenueByItem();
    initItemPerformanceChart();
    
    // Add event listener for refresh button
    const refreshItemStatsBtn = document.getElementById('refresh-item-stats');
    if (refreshItemStatsBtn) {
        refreshItemStatsBtn.addEventListener('click', () => {
            // Show loading spinners
            document.querySelectorAll('.item-metrics .metric-content').forEach(el => {
                el.innerHTML = '<div class="loader"></div>';
            });
            
            // Refresh data
            setTimeout(() => {
                loadPopularItems();
                loadLowStockItems();
                loadCategoryPerformance();
                loadRevenueByItem();
                initItemPerformanceChart();
                
                // Show toast notification
                showToast('Item statistics refreshed', 'success');
            }, 800);
        });
    }
}

/**
 * Load most popular items based on order frequency
 */
function loadPopularItems() {
    const popularItemsList = document.getElementById('popular-items-list');
    if (!popularItemsList) return;
    
    // Get all orders
    const orders = storageManager.getOrders() || [];
    
    // Count item frequency
    const itemFrequency = {};
    orders.forEach(order => {
        if (order.item && order.item.id) {
            const itemId = order.item.id;
            itemFrequency[itemId] = (itemFrequency[itemId] || 0) + 1;
        }
    });
    
    // Convert to array and sort by frequency
    const sortedItems = Object.entries(itemFrequency)
        .map(([itemId, count]) => {
            // Find item details
            const itemDetails = findMenuItem(itemId);
            return {
                id: itemId,
                name: itemDetails ? itemDetails.name : 'Unknown Item',
                category: itemDetails ? itemDetails.category : 'Unknown',
                count: count
            };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 items
    
    // Create HTML
    if (sortedItems.length === 0) {
        popularItemsList.innerHTML = '<div class="empty-data">No order data available yet</div>';
        return;
    }
    
    let html = '<ul class="stat-list">';
    sortedItems.forEach(item => {
        html += `
            <li>
                <span class="item-name">${item.name}</span>
                <span class="item-count">${item.count} orders</span>
            </li>
        `;
    });
    html += '</ul>';
    
    popularItemsList.innerHTML = html;
}

/**
 * Load items with low stock
 */
function loadLowStockItems() {
    const lowStockItems = document.getElementById('low-stock-items');
    if (!lowStockItems) return;
    
    // Get all menu items
    const menuItems = storageManager.getMenuItems() || [];
    
    // Filter items with stock < 10 (or your threshold)
    const lowStock = menuItems
        .filter(item => item.stock !== undefined && item.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5); // Top 5 low stock items
    
    // Create HTML
    if (lowStock.length === 0) {
        lowStockItems.innerHTML = '<div class="empty-data">No low stock items</div>';
        return;
    }
    
    let html = '<ul class="stat-list">';
    lowStock.forEach(item => {
        html += `
            <li>
                <span class="item-name">${item.name}</span>
                <span class="item-stock ${item.stock < 5 ? 'critical' : 'warning'}">
                    ${item.stock} left
                </span>
            </li>
        `;
    });
    html += '</ul>';
    
    lowStockItems.innerHTML = html;
}

/**
 * Load category performance metrics
 */
function loadCategoryPerformance() {
    const categoryPerformance = document.getElementById('category-performance');
    if (!categoryPerformance) return;
    
    // Get all orders
    const orders = storageManager.getOrders() || [];
    
    // Count by category
    const categoryCount = {};
    orders.forEach(order => {
        if (order.item && order.item.category) {
            const category = order.item.category;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
    });
    
    // Convert to array and sort
    const sortedCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    
    // Create HTML
    if (sortedCategories.length === 0) {
        categoryPerformance.innerHTML = '<div class="empty-data">No category data available</div>';
        return;
    }
    
    let html = '<ul class="stat-list">';
    sortedCategories.forEach(cat => {
        html += `
            <li>
                <span class="category-name">${capitalizeFirstLetter(cat.category)}</span>
                <span class="category-count">${cat.count} orders</span>
            </li>
        `;
    });
    html += '</ul>';
    
    categoryPerformance.innerHTML = html;
}

/**
 * Load revenue by item
 */
function loadRevenueByItem() {
    const revenueByItem = document.getElementById('revenue-by-item');
    if (!revenueByItem) return;
    
    // Get all orders
    const orders = storageManager.getOrders() || [];
    
    // Calculate revenue by item
    const itemRevenue = {};
    orders.forEach(order => {
        if (order.item && order.item.id && order.status !== 'cancelled') {
            const itemId = order.item.id;
            const price = order.item.price || 0;
            const quantity = order.quantity || 1;
            const revenue = price * quantity;
            
            itemRevenue[itemId] = (itemRevenue[itemId] || 0) + revenue;
        }
    });
    
    // Convert to array and sort by revenue
    const sortedItems = Object.entries(itemRevenue)
        .map(([itemId, revenue]) => {
            // Find item details
            const itemDetails = findMenuItem(itemId);
            return {
                id: itemId,
                name: itemDetails ? itemDetails.name : 'Unknown Item',
                revenue: revenue
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5 items by revenue
    
    // Create HTML
    if (sortedItems.length === 0) {
        revenueByItem.innerHTML = '<div class="empty-data">No revenue data available yet</div>';
        return;
    }
    
    let html = '<ul class="stat-list">';
    sortedItems.forEach(item => {
        html += `
            <li>
                <span class="item-name">${item.name}</span>
                <span class="item-revenue">${formatCurrency(item.revenue, true)}</span>
            </li>
        `;
    });
    html += '</ul>';
    
    revenueByItem.innerHTML = html;
}

/**
 * Initialize Item Performance Chart
 */
function initItemPerformanceChart() {
    const ctx = document.getElementById('items-performance-chart');
    if (!ctx) return;
    
    // Get all orders
    const orders = storageManager.getOrders() || [];
    
    // Calculate data by item
    const itemData = {};
    orders.forEach(order => {
        if (order.item && order.item.id && order.status !== 'cancelled') {
            const itemId = order.item.id;
            const name = order.item.name || 'Unknown Item';
            const price = order.item.price || 0;
            const quantity = order.quantity || 1;
            
            if (!itemData[itemId]) {
                itemData[itemId] = {
                    name: name,
                    orders: 0,
                    revenue: 0,
                    quantities: 0
                };
            }
            
            itemData[itemId].orders += 1;
            itemData[itemId].revenue += price * quantity;
            itemData[itemId].quantities += quantity;
        }
    });
    
    // Convert to arrays for chart
    const sortedItems = Object.values(itemData)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 7); // Top 7 items
    
    const labels = sortedItems.map(item => item.name);
    const revenueData = sortedItems.map(item => item.revenue);
    const quantityData = sortedItems.map(item => item.quantities);
    
    // If chart already exists, destroy it
    if (window.itemsPerformanceChart) {
        window.itemsPerformanceChart.destroy();
    }
    
    // Create new chart
    window.itemsPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue (KSh)',
                    data: revenueData,
                    backgroundColor: 'rgba(231, 76, 60, 0.6)',
                    borderColor: '#e74c3c',
                    borderWidth: 1,
                    yAxisID: 'y-revenue'
                },
                {
                    label: 'Quantity Sold',
                    data: quantityData,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    yAxisID: 'y-quantity'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top Items Performance',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataset.yAxisID === 'y-revenue') {
                                label += formatCurrency(context.raw, true);
                            } else {
                                label += context.raw;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                'y-revenue': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue (KSh)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, false);
                        }
                    }
                },
                'y-quantity': {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Quantity Sold'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

/**
 * Find menu item by ID
 * @param {string} itemId - Item ID to find
 * @returns {Object|null} - Menu item or null if not found
 */
function findMenuItem(itemId) {
    const menuItems = storageManager.getMenuItems() || [];
    return menuItems.find(item => item.id === itemId) || null;
}

/**
 * Capitalize first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} - Capitalized string
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
