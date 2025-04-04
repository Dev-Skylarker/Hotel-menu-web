/**
 * Cart Manager Utility
 * Handles cart operations for the Campus Cafe application
 */

const cartManager = (function() {
    // Constants
    const CART_STORAGE_KEY = 'campus_cafe_cart';
    
    /**
     * Get the current cart from localStorage
     * @returns {Array} - Cart items
     */
    function getCart() {
        try {
            const cartData = localStorage.getItem(CART_STORAGE_KEY);
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Error getting cart:', error);
            return [];
        }
    }
    
    /**
     * Save the cart to localStorage
     * @param {Array} cart - Cart items
     */
    function saveCart(cart) {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }
    
    /**
     * Add an item to the cart
     * @param {Object} item - Item to add
     */
    function addItem(item) {
        if (!item || !item.id) {
            console.error('Invalid item');
            return;
        }
        
        const cart = getCart();
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex !== -1) {
            // Item already exists, increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item with quantity 1
            cart.push({
                ...item,
                quantity: 1
            });
        }
        
        saveCart(cart);
    }
    
    /**
     * Remove an item from the cart
     * @param {string} itemId - ID of the item to remove
     */
    function removeItem(itemId) {
        if (!itemId) {
            console.error('Invalid item ID');
            return;
        }
        
        const cart = getCart();
        const updatedCart = cart.filter(item => item.id !== itemId);
        
        saveCart(updatedCart);
    }
    
    /**
     * Update an item's quantity in the cart
     * @param {string} itemId - ID of the item to update
     * @param {number} quantity - New quantity
     */
    function updateItemQuantity(itemId, quantity) {
        if (!itemId) {
            console.error('Invalid item ID');
            return;
        }
        
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }
        
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity = quantity;
            saveCart(cart);
        }
    }
    
    /**
     * Clear the entire cart
     */
    function clearCart() {
        saveCart([]);
    }
    
    /**
     * Get the total price of all items in the cart
     * @returns {number} - Total price
     */
    function getTotalPrice() {
        const cart = getCart();
        return cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    /**
     * Get the total number of items in the cart
     * @returns {number} - Total items
     */
    function getTotalItems() {
        const cart = getCart();
        return cart.reduce((total, item) => {
            return total + item.quantity;
        }, 0);
    }
    
    // Public API
    return {
        getCart,
        saveCart,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems
    };
})(); 