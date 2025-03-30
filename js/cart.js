function showSuccessModal(orders) {
    const orderNumbersEl = document.getElementById('order-numbers');
    orderNumbersEl.innerHTML = '';
    
    let totalAmount = 0;
    let firstOrderId = '';
    
    orders.forEach((order, index) => {
        if (index === 0) {
            firstOrderId = order.id;
        }
        const p = document.createElement('p');
        p.innerHTML = `<strong>Order #${index + 1}</strong>: ${order.id}`;
        orderNumbersEl.appendChild(p);
        
        totalAmount += parseFloat(order.totalPrice || 0);
    });
    
    // Update payment information
    document.getElementById('success-order-number').textContent = firstOrderId;
    document.getElementById('success-order-amount').textContent = `KSh ${totalAmount.toFixed(2)}`;
    
    // Show the modal
    const modal = document.getElementById('checkout-success-modal');
    modal.classList.add('show');
}

function handleCheckout(e) {
    e.preventDefault();
    
    // Get selected payment method
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Get order notes
    const orderNotes = document.getElementById('order-notes').value.trim();
    
    // Create orders from cart with payment info
    const cart = cartManager.getCart();
    const orders = [];
    
    // Create an order for each item
    cart.forEach(cartItem => {
        // Create unique order ID
        const orderId = 'ORD' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
        
        // Calculate item total
        const itemTotal = cartItem.quantity * cartItem.item.price;
        
        const order = {
            id: orderId,
            item: cartItem.item,
            quantity: cartItem.quantity,
            totalPrice: itemTotal.toFixed(2),
            status: 'pending',
            orderTime: new Date().toISOString(),
            estimatedPickupTime: new Date(Date.now() + 20 * 60000).toISOString(), // 20 minutes from now
            notes: orderNotes || null,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === 'cash' ? 'pending' : 'processed'
        };
        
        // Save order
        storageManager.saveOrder(order);
        orders.push(order);
    });
    
    // Clear cart
    cartManager.clearCart();
    
    // Close checkout modal
    checkoutModal.classList.remove('show');
    
    // Show success modal
    if (checkoutSuccessModal) {
        // Show modal with order information
        showSuccessModal(orders);
    }
    
    // Reset cart display
    displayCartItems();
}

function openCheckoutModal() {
    // Check if cart is empty
    const cart = cartManager.getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Update checkout total
    if (checkoutTotalPrice) {
        const total = cartManager.getTotalPrice();
        checkoutTotalPrice.textContent = `KSh ${total.toFixed(2)}`;
        
        // Update checkout amount in payment instructions
        const checkoutAmount = document.getElementById('checkout-amount');
        if (checkoutAmount) {
            checkoutAmount.textContent = `KSh ${total.toFixed(2)}`;
        }
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
    // Load cart items
    displayCartItems();
    
    // Add event listeners
    addEventListeners();
    
    // Update cart badge
    updateCartBadge();
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