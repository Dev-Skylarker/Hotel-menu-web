/**
 * Account Management for Campus Cafe
 * Handles user registration, login, and profile management
 */

// Account page script
document.addEventListener('DOMContentLoaded', function() {
    initAccountPage();
});

// Define DOM element variables
const userNameDisplay = document.getElementById('user-name-display');
const logoutBtn = document.getElementById('logout-btn');
const orderHistoryContainer = document.getElementById('order-history-container');

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');
const accountSection = document.getElementById('account-section');
const loginSection = document.getElementById('login-section');

/**
 * Initialize the account page
 */
function initAccountPage() {
    // Check if user is logged in
    const userData = localStorage.getItem('campus_cafe_user');
    
    if (!userData) {
        // If not logged in, show not logged in message
        if (document.getElementById('account-section')) {
            document.getElementById('account-section').style.display = 'none';
        }
        if (document.getElementById('not-logged-in')) {
            document.getElementById('not-logged-in').style.display = 'block';
        }
        return;
    }

    const currentUser = JSON.parse(userData);
    
    // Get complete user data from users collection
    const completeUserData = getUserCompleteData(currentUser.email);

    // Display user information
    displayUserInfo(currentUser, completeUserData);
    
    // Set up logout functionality
    setupLogout();
    
    // Load order history
    loadOrderHistory(currentUser);
    
    // Calculate and display user statistics
    calculateUserStats(currentUser);
}

/**
 * Get complete user data from users collection
 * @param {string} email - User email to find
 * @returns {Object} Complete user data
 */
function getUserCompleteData(email) {
    const usersData = localStorage.getItem('campus_cafe_users');
    if (!usersData) return null;
    
    const users = JSON.parse(usersData);
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Display user information on the page
 */
function displayUserInfo(user, completeUser) {
    // Update username in welcome message
    if (userNameDisplay) {
        userNameDisplay.textContent = user.user_metadata?.name || completeUser?.name || 'User';
    }
    
    // Update account details
    const accountName = document.getElementById('account-name');
    if (accountName) {
        accountName.textContent = user.user_metadata?.name || completeUser?.name || 'N/A';
    }
    
    const accountEmail = document.getElementById('account-email');
    if (accountEmail) {
        accountEmail.textContent = user.email || 'N/A';
    }
    
    const accountAdmission = document.getElementById('account-admission');
    if (accountAdmission) {
        accountAdmission.textContent = user.user_metadata?.admissionNumber || completeUser?.admissionNumber || 'N/A';
    }
    
    const accountRegistered = document.getElementById('account-registered');
    if (accountRegistered && completeUser?.registeredAt) {
        const registeredDate = new Date(completeUser.registeredAt);
        accountRegistered.textContent = registeredDate.toLocaleDateString();
    } else if (accountRegistered) {
        accountRegistered.textContent = 'N/A';
    }
}

/**
 * Calculate and display user statistics
 */
function calculateUserStats(user) {
    // Get all orders for this user
    const allOrders = JSON.parse(localStorage.getItem('campus_cafe_orders')) || [];
    const userOrders = allOrders.filter(order => {
        // Handle both formats: direct email or user property
        if (order.userEmail) {
            return order.userEmail.toLowerCase() === user.email.toLowerCase();
        } else if (order.user && order.user.email) {
            return order.user.email.toLowerCase() === user.email.toLowerCase();
        }
        return false;
    });
    
    // Calculate total orders
    const totalOrders = userOrders.length;
    const totalOrdersElement = document.getElementById('user-total-orders');
    if (totalOrdersElement) {
        totalOrdersElement.textContent = totalOrders;
    }
    
    // Calculate completed orders
    const completedOrders = userOrders.filter(order => 
        order.status && order.status.toLowerCase() === 'completed'
    ).length;
    const completedOrdersElement = document.getElementById('user-completed-orders');
    if (completedOrdersElement) {
        completedOrdersElement.textContent = completedOrders;
    }
    
    // Calculate total spent
    let totalSpent = 0;
    userOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            // New format with items array
            order.items.forEach(item => {
                totalSpent += (item.price || 0) * (item.quantity || 1);
            });
        } else if (order.item) {
            // Old format with single item
            totalSpent += (order.item.price || 0) * (order.quantity || 1);
        }
    });
    
    const totalSpentElement = document.getElementById('user-total-spent');
    if (totalSpentElement) {
        totalSpentElement.textContent = formatCurrency(totalSpent);
    }
    
    // Calculate favorite category
    const categoryCount = {};
    userOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            // New format with items array
            order.items.forEach(item => {
                const category = item.category || 'Unknown';
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
        } else if (order.item) {
            // Old format with single item
            const category = order.item.category || 'Unknown';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
    });
    
    let favoriteCategory = 'N/A';
    let maxCount = 0;
    
    for (const category in categoryCount) {
        if (categoryCount[category] > maxCount) {
            maxCount = categoryCount[category];
            favoriteCategory = category.charAt(0).toUpperCase() + category.slice(1);
        }
    }
    
    const favoriteCategoryElement = document.getElementById('user-favorite-category');
    if (favoriteCategoryElement) {
        favoriteCategoryElement.textContent = favoriteCategory;
    }
}

/**
 * Set up logout button functionality
 */
function setupLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Confirm before logout
            if (confirm('Are you sure you want to log out?')) {
                // Remove user from localStorage
                localStorage.removeItem('campus_cafe_user');
                
                // Show logout notification
                if (window.showToast) {
                    showToast('You have been logged out successfully', 'success');
                }
                
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }
}

/**
 * Load user's order history
 */
function loadOrderHistory(user) {
    if (!orderHistoryContainer) return;
    
    // Try to get orders from localStorage
    let orders = [];
    try {
        const allOrders = JSON.parse(localStorage.getItem('campus_cafe_orders')) || [];
        // Filter orders by user email
        orders = allOrders.filter(order => {
            // Handle both formats: direct email or user property
            if (order.userEmail) {
                return order.userEmail.toLowerCase() === user.email.toLowerCase();
            } else if (order.user && order.user.email) {
                return order.user.email.toLowerCase() === user.email.toLowerCase();
            }
            return false;
        });
        
        orders.sort((a, b) => {
            const dateA = a.orderDate || a.orderTime || '';
            const dateB = b.orderDate || b.orderTime || '';
            return new Date(dateB) - new Date(dateA); // Sort by date (newest first)
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        orderHistoryContainer.innerHTML = '<p>Error loading orders. Please try again later.</p>';
        return;
    }
    
    // Remove loader
    orderHistoryContainer.innerHTML = '';
    
    if (orders.length === 0) {
        orderHistoryContainer.innerHTML = '<p>You have no orders yet. <a href="menu.html">Browse our menu</a> to place your first order!</p>';
        return;
    }
    
    // Display orders
    orders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-history-item';
        
        const orderDate = new Date(order.orderDate || order.orderTime || new Date());
        const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
        
        // Define status class based on order status
        const statusClass = getStatusClass(order.status || 'pending');
        
        // Calculate order total
        let total = 0;
        let itemsCount = 0;
        
        if (order.items && Array.isArray(order.items)) {
            // New format with items array
            order.items.forEach(item => {
                total += (item.price || 0) * (item.quantity || 1);
            });
            itemsCount = order.items.length;
        } else if (order.item) {
            // Old format with single item
            total += (order.item.price || 0) * (order.quantity || 1);
            itemsCount = 1;
        }
        
        // Create order HTML
        orderItem.innerHTML = `
            <div class="order-history-header">
                <div>
                    <strong>Order #${order.orderId || order.id || 'Unknown'}</strong> - ${formattedDate}
                </div>
                <span class="order-status ${statusClass}">${order.status || 'pending'}</span>
            </div>
            <div class="order-history-details">
                <p><strong>Items:</strong> ${itemsCount}</p>
                <p><strong>Total:</strong> ${formatCurrency(total)}</p>
                ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
            </div>
            <div class="order-history-actions">
                <button class="btn btn-sm btn-primary view-order-details" data-order-id="${order.orderId || order.id || 'Unknown'}">View Details</button>
            </div>
        `;
        
        orderHistoryContainer.appendChild(orderItem);
        
        // Add event listener to view order details button
        orderItem.querySelector('.view-order-details').addEventListener('click', function() {
            showOrderDetails(order);
        });
    });
}

/**
 * Get CSS class for order status
 */
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'pending':
            return 'status-pending';
        case 'ready':
            return 'status-ready';
        case 'completed':
            return 'status-completed';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return '';
    }
}

/**
 * Show order details in a modal
 */
function showOrderDetails(order) {
    // Create modal element
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalContainer.style.display = 'flex';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.zIndex = '1000';
    
    // Calculate total amount
    let total = 0;
    order.items.forEach(item => {
        total += item.price * item.quantity;
    });
    
    // Format date
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
    
    // Build modal content
    modalContainer.innerHTML = `
        <div class="modal-content" style="background-color: var(--bg-card); border-radius: 8px; padding: 2rem; max-width: 600px; width: 90%; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="margin: 0;">Order #${order.orderId}</h2>
                <button class="close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-color);">&times;</button>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Status:</strong> <span class="order-status ${getStatusClass(order.status)}" style="padding: 0.25rem 0.5rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600;">${order.status}</span></p>
                ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
            </div>
            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin-top: 0; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">Item</th>
                            <th style="text-align: right; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">Price</th>
                            <th style="text-align: center; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">Qty</th>
                            <th style="text-align: right; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${item.name}</td>
                                <td style="text-align: right; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${formatCurrency(item.price)}</td>
                                <td style="text-align: center; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${item.quantity}</td>
                                <td style="text-align: right; padding: 0.5rem; border-bottom: 1px solid var(--border-color);">${formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 0.5rem; font-weight: bold;">Total:</td>
                            <td style="text-align: right; padding: 0.5rem; font-weight: bold;">${formatCurrency(total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div style="text-align: right;">
                <button class="close-modal btn btn-secondary" style="margin-right: 0.5rem;">Close</button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listeners to close buttons
    modalContainer.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            document.body.removeChild(modalContainer);
        });
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(event) {
        if (event.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
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
 * Add event listeners
 */
function addEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Check if the user is authenticated
 */
async function checkAuthStatus() {
    try {
        let isLoggedIn = false;
        
        // Try Supabase authentication if available
        if (typeof supabaseManager !== 'undefined') {
            const { user, error } = await supabaseManager.getUser();
            
            if (!error && user) {
                isLoggedIn = true;
                displayUserInfo(user);
            }
        } else {
            // Fallback to localStorage
            const userData = localStorage.getItem('campus_cafe_user');
            if (userData) {
                const user = JSON.parse(userData);
                isLoggedIn = true;
                displayUserInfo(user);
            }
        }
        
        // Update UI based on auth status
        updateUIBasedOnAuth(isLoggedIn);
        
        // If logged in, load order history
        if (isLoggedIn) {
            loadUserOrders();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateUIBasedOnAuth(false);
    }
}

/**
 * Update UI based on authentication status
 * @param {boolean} isLoggedIn - Whether user is logged in
 */
function updateUIBasedOnAuth(isLoggedIn) {
    if (accountSection && loginSection) {
        if (isLoggedIn) {
            accountSection.style.display = 'block';
            loginSection.style.display = 'none';
        } else {
            accountSection.style.display = 'none';
            loginSection.style.display = 'block';
        }
    }
    
    // Update logout button visibility
    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submission event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    // Clear previous error
    if (loginError) {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }
    
    // Get form data
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showLoginError('Please fill in all fields');
        return;
    }
    
    try {
        let loginSuccess = false;
        
        // Try using Supabase authentication if available
        if (typeof supabaseManager !== 'undefined') {
            console.log('Using Supabase authentication');
            const { data, error } = await supabaseManager.signIn(email, password);
            
            if (error) {
                showLoginError(error.message || 'Login failed. Please check your credentials.');
                return;
            }
            
            // Login successful
            loginSuccess = true;
            showMessage('Login successful!', 'success');
        } else {
            // Fallback to localStorage (simplified for demo)
            console.log('Using localStorage authentication');
            const userData = localStorage.getItem('campus_cafe_users');
            const users = userData ? JSON.parse(userData) : [];
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                showLoginError('Invalid email or password');
                return;
            }
            
            // Store current user in localStorage
            const currentUser = {
                email: user.email,
                user_metadata: {
                    name: user.name,
                    admissionNumber: user.admissionNumber
                }
            };
            
            localStorage.setItem('campus_cafe_user', JSON.stringify(currentUser));
            loginSuccess = true;
            showMessage('Login successful!', 'success');
        }
        
        if (loginSuccess) {
            // Update UI
            checkAuthStatus();
            
            // Check if there's a redirect URL saved
            const redirectUrl = localStorage.getItem('redirect_after_login');
            if (redirectUrl) {
                localStorage.removeItem('redirect_after_login'); // Clear the stored URL
                window.location.href = redirectUrl;
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('An error occurred during login. Please try again.');
    }
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submission event
 */
async function handleRegister(e) {
    e.preventDefault();
    
    // Clear previous errors
    if (registerError) {
        registerError.textContent = '';
        registerError.style.display = 'none';
    }
    
    if (registerSuccess) {
        registerSuccess.textContent = '';
        registerSuccess.style.display = 'none';
    }
    
    // Get form data
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const admissionNumber = document.getElementById('register-admission').value.trim();
    
    // Validate form data
    if (!name || !email || !password || !confirmPassword || !admissionNumber) {
        showRegisterError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showRegisterError('Passwords do not match');
        return;
    }
    
    if (!/^\d{5}$/.test(admissionNumber)) {
        showRegisterError('Admission number must be exactly 5 digits');
        return;
    }
    
    try {
        if (typeof supabaseManager !== 'undefined') {
            // Use Supabase authentication
            const { data, error } = await supabaseManager.signUp(email, password, {
                name: name,
                admissionNumber: admissionNumber
            });
            
            if (error) {
                showRegisterError(error.message || 'Registration failed.');
                return;
            }
            
            // Registration successful
            console.log('Registration successful:', data);
            showRegisterSuccess('Registration successful! You can now log in.');
            
            // Switch to login tab after successful registration
            const loginTab = document.getElementById('login-tab');
            if (loginTab) {
                setTimeout(() => {
                    loginTab.click();
                }, 1500);
            }
            
            // Clear the registration form
            registerForm.reset();
            
        } else {
            // Fallback to localStorage (simplified for demo)
            const userData = localStorage.getItem('campus_cafe_users');
            const users = userData ? JSON.parse(userData) : [];
            
            // Check if email already exists
            if (users.some(u => u.email === email)) {
                showRegisterError('Email already registered');
                return;
            }
            
            // Add new user
            const newUser = {
                name,
                email,
                password, // Note: In a real app, this should be hashed
                admissionNumber
            };
            
            users.push(newUser);
            localStorage.setItem('campus_cafe_users', JSON.stringify(users));
            
            // Registration successful
            showRegisterSuccess('Registration successful! You can now log in.');
            
            // Switch to login tab after successful registration
            const loginTab = document.getElementById('login-tab');
            if (loginTab) {
                setTimeout(() => {
                    loginTab.click();
                }, 1500);
            }
            
            // Clear the registration form
            registerForm.reset();
        }
    } catch (error) {
        console.error('Registration error:', error);
        showRegisterError('An error occurred during registration. Please try again.');
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        if (typeof supabaseManager !== 'undefined') {
            // Use Supabase authentication
            const { error } = await supabaseManager.signOut();
            
            if (error) {
                console.error('Logout error:', error);
                showMessage('An error occurred during logout. Please try again.', 'error');
                return;
            }
        }
        
        // Always clear localStorage user data
        localStorage.removeItem('campus_cafe_user');
        
        // Show success message
        showMessage('Logged out successfully', 'success');
        
        // Update UI
        updateUIBasedOnAuth(false);
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('An error occurred during logout. Please try again.', 'error');
    }
}

/**
 * Show login error
 * @param {string} message - Error message
 */
function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
}

/**
 * Show registration error
 * @param {string} message - Error message
 */
function showRegisterError(message) {
    if (registerError) {
        registerError.textContent = message;
        registerError.style.display = 'block';
    }
}

/**
 * Show registration success
 * @param {string} message - Success message
 */
function showRegisterSuccess(message) {
    if (registerSuccess) {
        registerSuccess.textContent = message;
        registerSuccess.style.display = 'block';
    }
}

/**
 * Show message to user
 * @param {string} message - Message to show
 * @param {string} type - Message type (success or error)
 */
function showMessage(message, type = 'success') {
    // Create message element if it doesn't exist
    if (!document.getElementById('message-alert')) {
        const messageElement = document.createElement('div');
        messageElement.id = 'message-alert';
        messageElement.className = 'message-alert';
        document.body.appendChild(messageElement);
    }
    
    // Get message element
    const messageAlert = document.getElementById('message-alert');
    
    // Set message text and class
    messageAlert.textContent = message;
    messageAlert.className = `message-alert ${type}`;
    
    // Show message
    messageAlert.classList.add('show');
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageAlert.classList.remove('show');
    }, 3000);
} 