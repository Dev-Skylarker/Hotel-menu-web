// DOM Element references
const cartItemsContainer = document.getElementById('cart-items');
const cartEmptyElement = document.getElementById('cart-empty');
const cartSummaryElement = document.getElementById('cart-summary');
const cartSummaryList = document.getElementById('cart-summary-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');
const cancelCheckoutBtn = document.getElementById('cancel-checkout');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const successModal = document.getElementById('checkout-success-modal');
const closeSuccessModalBtn = document.getElementById('close-success-modal');
const orderNumbersContainer = document.getElementById('order-numbers');
const closeModalBtns = document.querySelectorAll('.close-modal');

/**
 * Show success modal after checkout
 * @param {Array} orders - Array of order objects
 * @param {string} mainOrderId - Main order ID
 * @param {string} totalAmount - Total order amount
 * @param {string} orderCode - Order code for reference
 */
function showSuccessModal(orders, mainOrderId, totalAmount, orderCode) {
    const successModal = document.getElementById('checkout-success-modal');
    const orderNumbersContainer = document.getElementById('order-numbers');
    const collectionInfoContainer = document.getElementById('collection-info');
    
    if (!successModal || !orderNumbersContainer) {
        console.error('Success modal or order numbers container not found');
        return;
    }
    
    // Clear previous order numbers
    orderNumbersContainer.innerHTML = '';
    
    // Create a paragraph for order number
    const orderPara = document.createElement('p');
    orderPara.innerHTML = `<strong>Order Number:</strong> ${mainOrderId}`;
    orderNumbersContainer.appendChild(orderPara);
    
    // Display collection information if available
    if (collectionInfoContainer && orders && orders.length > 0) {
        collectionInfoContainer.innerHTML = '';
        
        const order = orders[0];
        if (order.collectionMethod && order.collectionLocation) {
            const collectionTitle = document.createElement('h4');
            collectionTitle.textContent = 'Collection Information';
            collectionInfoContainer.appendChild(collectionTitle);
            
            const collectionMethodPara = document.createElement('p');
            collectionMethodPara.innerHTML = `<strong>Method:</strong> ${order.collectionMethod === 'table' ? 'Serve at Table' : 'Pickup at Counter'}`;
            collectionInfoContainer.appendChild(collectionMethodPara);
            
            const collectionLocationPara = document.createElement('p');
            collectionLocationPara.innerHTML = `<strong>Location:</strong> <span class="highlight">${order.collectionLocation}</span>`;
            collectionInfoContainer.appendChild(collectionLocationPara);
            
            if (order.collectionMethod === 'table') {
                const tablePara = document.createElement('p');
                tablePara.textContent = 'Your order will be served directly to your table once ready.';
                collectionInfoContainer.appendChild(tablePara);
            } else {
                const pickupPara = document.createElement('p');
                pickupPara.textContent = 'Please collect your order from Counter 3 when notified that it is ready.';
                collectionInfoContainer.appendChild(pickupPara);
            }
        }
    }
    
    // Update the account number in the payment instructions
    const accountNumberEl = document.getElementById('success-account-number');
    if (accountNumberEl) {
        accountNumberEl.textContent = orderCode;
    }
    
    // Update the amount in the payment instructions
    const amountEl = document.getElementById('checkout-amount');
    if (amountEl) {
        amountEl.textContent = `KSh ${parseFloat(totalAmount).toFixed(2)}`;
    }
    
    // Update continue button to redirect to order status
    const continueBtn = document.getElementById('close-success-modal');
    if (continueBtn) {
        // Remove previous event listeners by cloning the button
        const newBtn = continueBtn.cloneNode(true);
        continueBtn.parentNode.replaceChild(newBtn, continueBtn);
        
        // Add new event listener
        newBtn.addEventListener('click', function() {
            // Save current order ID to localStorage
            localStorage.setItem('last_order_id', mainOrderId);
            // Redirect to my-orders page
            window.location.href = 'my-orders.html';
        });
    }
    
    // Show the modal
    successModal.classList.add('show');
}

/**
 * Handle checkout form submission
 * @param {Event} e - Form submission event
 */
function handleCheckout(e) {
    console.log('Handling checkout form submission...');
    e.preventDefault();
    
    // Get customer information
    const customerName = document.getElementById('customer-name').value.trim();
    const admissionNumber = document.getElementById('admission-number').value.trim();
    const orderNotes = document.getElementById('order-notes').value.trim();
    
    // Get collection method
    const collectionMethod = document.getElementById('collection-method').value;
    let collectionLocation = '';
    
    if (collectionMethod === 'table') {
        collectionLocation = document.getElementById('table-number').value;
        if (!collectionLocation) {
            alert('Please select a table number');
            return;
        }
    } else if (collectionMethod === 'pickup') {
        collectionLocation = 'Counter 3 (Outgoing Orders)';
    } else {
        alert('Please select a collection method (Table or Pickup)');
        return;
    }
    
    console.log('Customer Name:', customerName);
    console.log('Admission Number:', admissionNumber);
    console.log('Collection Method:', collectionMethod);
    console.log('Collection Location:', collectionLocation);
    
    // Validate required fields
    if (!customerName) {
        alert('Please enter your full name');
        return;
    }
    
    // Validate admission number format (exactly 5 digits)
    if (!admissionNumber) {
        alert('Please enter your admission number');
        return;
    } else if (!/^\d{5}$/.test(admissionNumber)) {
        alert('Please enter exactly 5 digits for your admission number');
        document.getElementById('admission-number').focus();
        return;
    }
    
    console.log('Form validation passed, creating order...');
    
    // Get the order code
    const orderCode = localStorage.getItem('temp_order_code') || 
                      Math.floor(1000 + Math.random() * 9000).toString();
    
    // Create orders from cart with payment info
    const cart = cartManager.getCart();
    console.log('Cart items:', cart.length);
    
    // Generate a unique order ID using the order code
    const mainOrderId = 'ORD-' + orderCode + '-' + Date.now().toString().slice(-4);
    console.log('Order ID:', mainOrderId);
    
    // Calculate the total order amount WITHOUT discount
    const totalOrderAmount = cartManager.getTotalPrice();
    
    // Format the total amount to 2 decimal places
    const formattedTotal = totalOrderAmount.toFixed(2);
    console.log('Total amount:', formattedTotal);
    
    // Save admission number to localStorage for future use
    localStorage.setItem('saved_admission_number', admissionNumber);
    
    // Use the async/await pattern to get the current user if available
    (async function() {
        try {
            // Check if user is logged in
            let userId = null;
            let userEmail = null;
            let userName = null;
            
            // First check for user in localStorage (main source)
            const userData = localStorage.getItem('campus_cafe_user');
            if (userData) {
                const user = JSON.parse(userData);
                userId = user.id;
                userEmail = user.email;
                userName = user.user_metadata?.name;
                console.log('User is logged in from localStorage:', userEmail);
            }
            // Fallback to Supabase if available
            else if (typeof supabaseManager !== 'undefined') {
                const { user, error } = await supabaseManager.getCurrentUser();
                if (!error && user) {
                    userId = user.id;
                    userEmail = user.email;
                    userName = user.user_metadata?.name;
                    console.log('User is logged in from Supabase:', userEmail);
                }
            }
            
            // Get user details from registered users if available
            let userDetails = null;
            if (userEmail) {
                userDetails = getUserCompleteData(userEmail);
            }
            
            // Create the order object
            const order = {
                id: mainOrderId,
                orderCode: orderCode,
                items: cart.map(cartItem => ({
                    item: cartItem.item,
                    quantity: cartItem.quantity,
                    price: cartItem.item.price
                })),
                status: 'pending',
                orderTime: new Date().toISOString(),
                estimatedPickupTime: new Date(Date.now() + 20 * 60000).toISOString(), // 20 minutes from now
                notes: orderNotes || null,
                customerName: customerName,
                admissionNumber: admissionNumber,
                paymentMethod: 'counter_payment',
                paymentStatus: 'pending',
                total: formattedTotal,
                collectionMethod: collectionMethod,
                collectionLocation: collectionLocation,
                // Add created_at for Supabase timestamp
                created_at: new Date().toISOString(),
                // Add user details
                userId: userId,
                userEmail: userEmail || null,
                // Add user object for easier access
                user: userDetails ? {
                    id: userId,
                    email: userEmail,
                    name: userDetails.name || userName || customerName,
                    admissionNumber: userDetails.admissionNumber || admissionNumber
                } : null
            };
            
            // Update customer stats
            if (typeof storageManager !== 'undefined' && storageManager.updateCustomerStats) {
                storageManager.updateCustomerStats();
            }
            
            // Save the order to Supabase if available, otherwise fall back to localStorage
            console.log('Saving order...');
            
            // Check if supabaseManager is available
            if (typeof supabaseManager !== 'undefined') {
                console.log('Using Supabase to save order...');
                const { data, error, offlineOnly } = await supabaseManager.insertOrder(order);
                
                if (error) {
                    console.error('Error saving order to Supabase:', error);
                    // Fall back to localStorage only
                    storageManager.saveOrder(order);
                    console.log('Order saved to localStorage as fallback');
                } else if (offlineOnly) {
                    console.log('Order saved to localStorage only (offline mode)');
                } else {
                    console.log('Order successfully saved to Supabase:', data);
                }
            } else {
                // Use localStorage if supabaseManager is not available
                console.log('Supabase not available, using localStorage only');
                storageManager.saveOrder(order);
            }
            
            // Proceed with success flow regardless of storage method
            // Show success modal with the correct amount
            console.log('Showing success modal...');
            showSuccessModal([order], mainOrderId, formattedTotal, orderCode);
            
            // Clear cart
            cartManager.clearCart();
            
            // Store order ID in localStorage to access it on the order status page
            localStorage.setItem('last_order_id', mainOrderId);
            localStorage.removeItem('temp_order_code'); // Clean up
            
            // Close checkout modal
            console.log('Closing checkout modal...');
            checkoutModal.classList.remove('show');
            
            console.log('Checkout complete!');
        } catch (error) {
            console.error('Error during checkout process:', error);
            alert('There was an error processing your order. Please try again.');
        }
    })();
}

function openCheckoutModal() {
    // Check if cart is empty
    const cart = cartManager.getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Generate a 4-digit order code for payment reference
    const orderCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store order code temporarily
    localStorage.setItem('temp_order_code', orderCode);
    
    // Calculate total price WITHOUT applying discount
    const totalPrice = cartManager.getTotalPrice();
    const formattedTotal = totalPrice.toFixed(2);
    
    // Update the checkout total display
    if (checkoutTotalPrice) {
        checkoutTotalPrice.textContent = window.formatters?.currency 
            ? window.formatters.currency(totalPrice, true) 
            : `KSh ${formattedTotal}`;
    }
    
    // Update payment amount in instructions
    const checkoutAmountEl = document.getElementById('checkout-amount');
    if (checkoutAmountEl) {
        checkoutAmountEl.textContent = window.formatters?.currency 
            ? window.formatters.currency(totalPrice, true) 
            : `KSh ${formattedTotal}`;
    }
    
    // Update checkout amount in other places
    const checkoutAmount = document.getElementById('checkout-amount');
    if (checkoutAmount) {
        checkoutAmount.textContent = window.formatters?.currency 
            ? window.formatters.currency(totalPrice, true) 
            : `KSh ${formattedTotal}`;
    }
    
    // Update account/order number
    const accountNumberEl = document.getElementById('checkout-account-number');
    if (accountNumberEl) {
        accountNumberEl.textContent = orderCode;
    }
    
    // Show checkout modal
    if (checkoutModal) {
        checkoutModal.classList.add('show');
    }
}

/**
 * Initialize the cart page
 */
function initCart() {
    console.log('Initializing cart page...');
    
    // Debug element existence
    console.log('Checkout form exists:', !!checkoutForm);
    console.log('Checkout modal exists:', !!checkoutModal);
    console.log('Success modal exists:', !!document.getElementById('checkout-success-modal'));
    
    // Load cart items
    displayCartItems();
    
    // Add event listeners
    addEventListeners();
    
    // Check if user is logged in and pre-fill form
    prefillCheckoutForm();
    
    // Check if there's a checkout parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'true') {
        // Open checkout modal automatically after a short delay
        setTimeout(() => {
            openCheckoutModal();
        }, 500);
    }
    
    // Update cart badge
    updateCartBadge();
}

/**
 * Pre-fill checkout form with user information if logged in
 */
async function prefillCheckoutForm() {
    const nameInput = document.getElementById('customer-name');
    const admissionInput = document.getElementById('admission-number');
    
    if (!nameInput || !admissionInput) return;
    
    // First try to pre-fill from localStorage for convenience
    const savedAdmissionNumber = localStorage.getItem('saved_admission_number');
    if (savedAdmissionNumber) {
        admissionInput.value = savedAdmissionNumber;
    }
    
    // Try to get user data from stored user session
    const userData = localStorage.getItem('campus_cafe_user');
    if (userData) {
        const user = JSON.parse(userData);
        console.log('User is logged in, pre-filling checkout form from stored user data');
        
        // Get the complete user data from users collection which contains all registration info
        const completeUser = getUserCompleteData(user.email);
        
        if (completeUser) {
            // Use the complete user data from registration
            nameInput.value = completeUser.name || '';
            admissionInput.value = completeUser.admissionNumber || savedAdmissionNumber || '';
        } else {
            // Fallback to user session data
            nameInput.value = user.user_metadata?.name || '';
            admissionInput.value = user.user_metadata?.admissionNumber || savedAdmissionNumber || '';
        }
        
        return; // We've filled the form, no need to continue
    }
    
    // Try to get user data from Supabase if available
    if (typeof supabaseManager !== 'undefined') {
        try {
            const { user, error } = await supabaseManager.getCurrentUser();
            if (!error && user) {
                console.log('User is logged in, pre-filling checkout form from Supabase');
                
                // Try to get user metadata that contains name
                if (user.user_metadata) {
                    nameInput.value = user.user_metadata.name || '';
                }
                
                // Try to get admission number from profile
                const { data: profile, error: profileError } = await supabaseManager.getProfile();
                if (!profileError && profile) {
                    admissionInput.value = profile.admission_number || savedAdmissionNumber || '';
                }
            }
        } catch (error) {
            console.error('Error getting user data:', error);
        }
    }
}

/**
 * Get complete user data from users collection
 * @param {string} email - User email to find
 * @returns {Object} Complete user data
 */
function getUserCompleteData(email) {
    if (!email) return null;
    
    const usersData = localStorage.getItem('campus_cafe_users');
    if (!usersData) return null;
    
    const users = JSON.parse(usersData);
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Update the cart badge to show total items
 */
function updateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    if (!cartBadge) return;
    
    // Get the total number of items in the cart
    const totalItems = cartManager.getTotalItems();
    
    // Update the badge
    cartBadge.textContent = totalItems;
    
    // Show or hide badge based on cart contents
    if (totalItems > 0) {
        cartBadge.style.display = 'flex';
    } else {
        cartBadge.style.display = 'none';
    }
}

/**
 * Update the cart summary section
 */
function updateCartSummary() {
    if (!cartSummaryList || !cartTotalPrice) return;
    
    // Clear summary list
    cartSummaryList.innerHTML = '';
    
    // Get cart items
    const cart = cartManager.getCart();
    
    // Get total price
    let totalPrice = cartManager.getTotalPrice();
    
    // Add items to summary
    cart.forEach(cartItem => {
        const itemTotal = cartItem.item.price * cartItem.quantity;
        
        const summaryItem = document.createElement('div');
        summaryItem.className = 'cart-summary-item';
        
        summaryItem.innerHTML = `
            <span>${cartItem.item.name} x${cartItem.quantity}</span>
            <span>KSh ${itemTotal.toFixed(2)}</span>
        `;
        
        cartSummaryList.appendChild(summaryItem);
    });
    
    // Update total price
    cartTotalPrice.textContent = `KSh ${totalPrice.toFixed(2)}`;
    
    // Also update checkout total if visible
    if (checkoutTotalPrice) {
        checkoutTotalPrice.textContent = `KSh ${totalPrice.toFixed(2)}`;
    }
    
    // Update checkout amount in payment instructions if visible
    const checkoutAmount = document.getElementById('checkout-amount');
    if (checkoutAmount) {
        checkoutAmount.textContent = `KSh ${totalPrice.toFixed(2)}`;
    }
}

/**
 * Display cart items in the cart interface
 */
function displayCartItems() {
    // Get cart from localStorage
    const cart = cartManager.getCart();
    
    // Show/hide elements based on cart contents
    if (cart.length === 0) {
        // Empty cart
        if (cartItemsContainer) cartItemsContainer.style.display = 'none';
        if (cartSummaryElement) cartSummaryElement.style.display = 'none';
        if (cartEmptyElement) cartEmptyElement.style.display = 'block';
        return;
    } else {
        // Cart has items
        if (cartItemsContainer) cartItemsContainer.style.display = 'block';
        if (cartSummaryElement) cartSummaryElement.style.display = 'block';
        if (cartEmptyElement) cartEmptyElement.style.display = 'none';
    }
    
    // Clear container
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
        
        // Add each cart item
        cart.forEach(cartItem => {
            const item = cartItem.item;
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            
            // Create item HTML
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.imageUrl}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <div class="cart-item-price">KSh ${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
                        <span class="quantity-value">${cartItem.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add to container
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Add event listeners for quantity buttons
        const decreaseBtns = cartItemsContainer.querySelectorAll('.decrease-btn');
        const increaseBtns = cartItemsContainer.querySelectorAll('.increase-btn');
        const removeButtons = cartItemsContainer.querySelectorAll('.cart-item-remove');
        
        decreaseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                const quantityValue = e.target.nextElementSibling;
                let quantity = parseInt(quantityValue.textContent) - 1;
                
                if (quantity <= 0) {
                    // When quantity reaches zero, confirm if user wants to remove item
                    if (confirm("Remove this item from your cart?")) {
                        // User confirmed, remove item
                        cartManager.removeFromCart(itemId);
                        displayCartItems();
                    } else {
                        // User cancelled, keep quantity at 1
                        quantity = 1;
                        quantityValue.textContent = quantity;
                    }
                } else {
                    // Update quantity normally
                    quantityValue.textContent = quantity;
                    cartManager.updateQuantity(itemId, quantity);
                    updateCartSummary();
                }
            });
        });
        
        increaseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                const quantityValue = e.target.previousElementSibling;
                let quantity = parseInt(quantityValue.textContent) + 1;
                
                if (quantity > 99) {
                    quantity = 99;
                }
                
                quantityValue.textContent = quantity;
                cartManager.updateQuantity(itemId, quantity);
                updateCartSummary();
            });
        });
        
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.cart-item-remove').dataset.id;
                if (confirm("Remove this item from your cart?")) {
                    cartManager.removeFromCart(itemId);
                    displayCartItems();
                }
            });
        });
    }
    
    // Update cart summary
    updateCartSummary();
}

/**
 * Add event listeners
 */
function addEventListeners() {
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                cartManager.clearCart();
                displayCartItems();
            }
        });
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutModal);
    }
    
    // Cancel checkout button
    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('show');
        });
    }
    
    // Collection method selection
    const collectionMethodSelect = document.getElementById('collection-method');
    if (collectionMethodSelect) {
        collectionMethodSelect.addEventListener('change', (e) => {
            const tableSelection = document.getElementById('table-selection');
            const tableNumberSelect = document.getElementById('table-number');
            const pickupCounter = document.getElementById('pickup-counter');
            
            if (e.target.value === 'table') {
                tableSelection.style.display = 'block';
                tableNumberSelect.disabled = false;
                tableNumberSelect.required = true;
                pickupCounter.style.display = 'none';
            } else if (e.target.value === 'pickup') {
                tableSelection.style.display = 'none';
                tableNumberSelect.disabled = true;
                tableNumberSelect.required = false;
                pickupCounter.style.display = 'block';
            } else {
                tableSelection.style.display = 'none';
                pickupCounter.style.display = 'none';
                tableNumberSelect.disabled = true;
                tableNumberSelect.required = false;
            }
        });
    }
    
    // Checkout form
    if (checkoutForm) {
        console.log('Adding submit event listener to checkout form');
        checkoutForm.addEventListener('submit', handleCheckout);
    } else {
        console.error('Checkout form not found!');
    }
    
    // Close success modal
    if (closeSuccessModalBtn) {
        closeSuccessModalBtn.addEventListener('click', () => {
            window.location.href = 'my-orders.html';
        });
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });
}

// Initialize cart page when DOM is loaded
document.addEventListener('DOMContentLoaded', initCart); 