/**
 * Storage Manager for Campus Cafe
 * Handles localStorage operations for menu items and orders
 */

// Storage manager for managing localStorage operations
const storageManager = (function() {
    // Storage keys
    const MENU_ITEMS_KEY = 'campus_cafe_menu_items';
    const ORDERS_KEY = 'campus_cafe_orders';
    const MESSAGES_KEY = 'campus_cafe_messages';

    /**
     * Initialize storage with default data if empty
     */
    function initStorage() {
        // Check if menu items already exist
        if (!localStorage.getItem(MENU_ITEMS_KEY)) {
            // Initialize with default menu items
            localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(getDefaultMenuItems()));
        } else {
            // Update existing menu items with new pricing
            updateMenuItemPrices();
        }
    }

    /**
     * Update menu item prices by reducing by 200 if price > 250
     */
    function updateMenuItemPrices() {
        const menuItems = getMenuItems();
        let hasUpdates = false;

        menuItems.forEach(item => {
            // Special handling for Classic Burger to ensure it's 450
            if (item.name === "Classic Burger") {
                item.price = 450;
                hasUpdates = true;
            }
            // For other items, reduce by 200 if price > 250
            else if (item.price > 250) {
                item.price = item.price - 200;
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(menuItems));
            console.log('Menu prices updated to new pricing model.');
        }
    }

    /**
     * Clear all storage data
     * Note: For development purposes only - don't call this automatically
     */
    function clearStorage() {
        localStorage.removeItem(MENU_ITEMS_KEY);
        localStorage.removeItem(ORDERS_KEY);
        localStorage.removeItem(MESSAGES_KEY);
        console.log('Storage cleared');
    }

    /**
     * Get all menu items
     * @returns {Array} - Array of menu items
     */
    function getMenuItems() {
        const menuItems = localStorage.getItem(MENU_ITEMS_KEY);
        return menuItems ? JSON.parse(menuItems) : [];
    }

    /**
     * Get menu item by ID
     * @param {string} id - Item ID
     * @returns {Object|null} - Menu item or null if not found
     */
    function getMenuItemById(id) {
        const menuItems = getMenuItems();
        return menuItems.find(item => item.id === id) || null;
    }

    /**
     * Save menu item (create or update)
     * @param {Object} item - Menu item to save
     */
    function saveMenuItem(item) {
        if (!item || !item.id || !item.name || !item.price) {
            console.error('Invalid menu item data');
            return null;
        }

        const menuItems = getMenuItems();
        const existingIndex = menuItems.findIndex(i => i.id === item.id);

        if (existingIndex !== -1) {
            // Update existing item
            menuItems[existingIndex] = item;
        } else {
            // Add new item
            menuItems.push(item);
        }

        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(menuItems));
        return item;
    }

    /**
     * Delete menu item by ID
     * @param {string} id - Item ID to delete
     */
    function deleteMenuItem(id) {
        const menuItems = getMenuItems();
        const updatedItems = menuItems.filter(item => item.id !== id);

        if (updatedItems.length === menuItems.length) {
            return false; // No item was deleted
        }

        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(updatedItems));
        return true;
    }

   /**
     * Get all orders
     * @returns {Array} - Array of orders
     */
    function getOrders() {
        const orders = localStorage.getItem(ORDERS_KEY);
        return orders ? JSON.parse(orders) : [];
    }

    /**
     * Save an order
     * @param {Object} order - Order object to save
     * @returns {Object} - The saved order
     */
    function saveOrder(order) {
        // Validate order
        if (!order || !order.id) {
            console.error('Invalid order: Missing ID');
            throw new Error('Invalid order');
        }

        // Check if this is a new format order with items array or old format with single item
        if (!order.items && !order.item) {
            console.error('Invalid order: No items or item property');
            throw new Error('Invalid order');
        }

        // Convert new format (items array) to old format (single item) for backward compatibility
        // This is needed because the my-orders page expects single item orders
        if (order.items && order.items.length > 0) {
            // Get current orders
            const orders = getOrders();
            
            // For each item in the order, create a separate order in the old format
            for (const itemEntry of order.items) {
                const singleOrder = {
                    id: order.id + '-' + itemEntry.item.id,
                    item: itemEntry.item,
                    quantity: itemEntry.quantity,
                    status: order.status || 'pending',
                    customerName: order.customerName,
                    orderTime: order.orderTime,
                    estimatedPickupTime: order.estimatedPickupTime,
                    paymentMethod: order.paymentMethod || 'cash',
                    collectionMethod: order.collectionMethod,
                    collectionLocation: order.collectionLocation
                };
                
                // Add order to the orders list
                orders.push(singleOrder);
            }
            
            // Save to localStorage
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            
            // Save the last order ID for reference
            localStorage.setItem('last_order_id', order.id);
            
            // Return the original order
            return order;
        } else {
            // Old format with single item
        // Get current orders
        const orders = getOrders();

        // Add order to the orders list
        orders.push(order);

        // Save to localStorage
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            
            // Save the last order ID for reference
            localStorage.setItem('last_order_id', order.id);
            
            // Return the saved order
            return order;
        }
    }

    /**
     * Update order status
     * @param {string} id - Order ID to update
     * @param {string} status - New status (pending, ready, completed, cancelled)
     * @returns {Object|false} - Updated order object or false if not found
     */
    function updateOrderStatus(id, status) {
        try {
            const orders = getOrders();
            const orderIndex = orders.findIndex(function(order) {
                return order.id === id;
            });
            if (orderIndex === -1) {
                console.warn("Order not found with id: " + id);
                return false;
            }
            orders[orderIndex].status = status;
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            return orders[orderIndex]; // Return the updated order
        } catch (e) {
            console.error("Error updating order status", e);
            return false;
        }
    }

    /**
     * Get all contact messages
     * @returns {Array} - Array of messages
     */
    function getMessages() {
        const messages = localStorage.getItem(MESSAGES_KEY);
        return messages ? JSON.parse(messages) : [];
    }

    /**
     * Save a new contact message
     * @param {Object} message - Message to save
     * @returns {Object} - Saved message
     */
    function saveMessage(message) {
        if (!message || !message.name || !message.email || !message.message) {
            return null;
        }

        const messages = getMessages();
        const now = new Date();

        const newMessage = {
            id: 'msg_' + now.getTime(),
            name: message.name,
            email: message.email,
            subject: message.subject || '',
            message: message.message,
            date: now.toISOString(),
            read: false
        };

        messages.push(newMessage);
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

        return newMessage;
    }

    /**
     * Mark message as read
     * @param {string} id - Message ID
     * @returns {Object|null} - Updated message or null if not found
     */
    function markMessageAsRead(id) {
        const messages = getMessages();
        const messageIndex = messages.findIndex(msg => msg.id === id);

        if (messageIndex === -1) {
            return false;
        }

        messages[messageIndex].read = true;
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

        return true;
    }

    /**
     * Default menu items
     * @returns {Array} - Array of default menu items
     */
    function getDefaultMenuItems() {
        return [
            {
                "id": "burger1",
                "name": "Classic Burger",
                "price": 650, // Will be 450 after reduction
                "category": "main-courses",
                "description": "Juicy beef patty with lettuce, tomato, cheese, and special sauce on a toasted bun.",
                "ingredients": ["Beef Patty", "Lettuce", "Tomato", "Cheese", "Special Sauce", "Bun"],
                "imageUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                "featured": true
            },
            {
                "id": "breakfast1",
                "name": "Smocha",
                "price": 250, // Reduced from 450
                "category": "breakfast",
                "description": "A delicious combination of chapati, smokies, and kachumbari - a perfect campus breakfast.",
                "ingredients": ["Chapati", "Smokies", "Kachumbari", "Tomato Sauce"],
                "imageUrl": "https://cdn.standardmedia.co.ke/images/wysiwyg/images/TwRzggyrLJCEh7gwzsLlPZ90VHf4imSUigQh5aiv.jpg",
                "featured": true
            },
            {
                "id": "breakfast2",
                "name": "Pancake Stack",
                "price": 180,
                "category": "breakfast",
                "description": "Fluffy pancakes served with maple syrup and fresh berries.",
                "ingredients": ["Flour", "Eggs", "Milk", "Butter", "Maple Syrup", "Mixed Berries"],
                "imageUrl": "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                "featured": false
            },
             {
                "id": "lunch1",
                "name": "Chapo Beans",
                "price": 80,
                "category": "lunch",
                "description": "Kenyan chapati served with tasty beans, salad, and soup on the side.",
                "ingredients": ["Chapati", "Beans", "Salad", "Vegetable Soup"],
                "imageUrl": "https://www.shutterstock.com/image-photo/chapati-bean-curry-made-beans-600nw-2162323019.jpg",
                "featured": true
            },
            {
                "id": "lunch2",
                "name": "Beef Stir Fry",
                "price": 350,
                "category": "lunch",
                "description": "Tender strips of beef stir-fried with vegetables, served with rice.",
                "ingredients": ["Beef", "Mixed Vegetables", "Soy Sauce", "Rice"],
                "imageUrl": "https://images.unsplash.com/photo-1572715376701-98568319fd0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                "featured": false
            },
            {
                "id": "snack1",
                "name": "Samosa",
                "price": 40,
                "category": "snacks",
                "description": "Crispy triangular pastry filled with spiced potatoes and peas.",
                "ingredients": ["Pastry", "Potatoes", "Peas", "Spices"],
                "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                "featured": true
            },
            {
                "id": "drink1",
                "name": "Kenyan Tea",
                "price": 100,
                "category": "drinks",
                "description": "Traditional Kenyan tea brewed with milk and spices.",
                "ingredients": ["Tea Leaves", "Milk", "Sugar", "Spices"],
                "imageUrl": "https://media.istockphoto.com/id/880879684/photo/hot-chinese-tea-with-condensed-milk.jpg?s=612x612&w=0&k=20&c=BEBQwAcDvWb4xFJgMSPSFkOdK3jJXAUQVwfhlPVLdoI=",
                "featured": false,
                "available": true
            },
            {
                "id": "drink2",
                "name": "Fresh Fruit Juice",
                "price": 180,
                "category": "drinks",
                "description": "Freshly squeezed seasonal fruit juice.",
                "ingredients": ["Seasonal Fruits", "Ice"],
                "imageUrl": "https://media.istockphoto.com/id/537837754/photo/orange-juice-splash.jpg?s=612x612&w=0&k=20&c=twbr5N3vTUl9Qw_cerGXX9zQlkTVa7ICatdUqyxgsvg=",
                "featured": true,
                "available": true
            }
        ];
    }

    /**
     * Update customer stats when an order is placed
     */
    function updateCustomerStats() {
        // Check if statsManager exists
        if (typeof statsManager !== 'undefined') {
            statsManager.incrementOrderSubmitted();
        }
    }

    /**
     * Reset menu items to defaults
     * This will completely refresh the menu with updated pricing
     */
    function resetMenuItems() {
        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(getDefaultMenuItems()));
        console.log('Menu items reset to defaults with new pricing.');
    }

    // Public API
    return {
        initStorage,
        clearStorage,
        getMenuItems,
        getMenuItemById,
        saveMenuItem,
        deleteMenuItem,
        getOrders,
        saveOrder,
        updateOrderStatus,
        getMessages,
        saveMessage,
        markMessageAsRead,
        getDefaultMenuItems,
        updateCustomerStats,
        resetMenuItems,
        updateMenuItemPrices
    };
})();

// Initialize storage on page load
document.addEventListener('DOMContentLoaded', function() {
    storageManager.initStorage();
});

// Cart manager for managing cart operations
const cartManager = (function() {
    // Storage key
    const CART_KEY = 'campus_cafe_cart';

    /**
     * Get cart items
     * @returns {Array} - Array of cart items
     */
    function getCart() {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    }

    /**
     * Add item to cart
     * @param {Object} item - Menu item to add
     * @param {number} quantity - New quantity
     * @returns {Array} - Updated cart
     */
    function addToCart(item, quantity = 1) {
        // Validate item
        if (!item || !item.id || !item.name || !item.price) {
            throw new Error('Invalid menu item');
        }

        // Validate quantity
        if (quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        // Get current cart
        const cart = getCart();

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(cartItem => cartItem.item.id === item.id);

        if (existingItemIndex !== -1) {
            // Update quantity
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                item: item,
                quantity: quantity
            });
        }

        // Save to localStorage
        localStorage.setItem(CART_KEY, JSON.stringify(cart));

        // Update cart badge immediately
        updateCartBadge();

        return cart;
    }

    /**
     * Remove item from cart
     * @param {string} itemId - Item ID to remove
     * @returns {Array} - Updated cart
     */
    function removeFromCart(itemId) {
        // Get current cart
        const cart = getCart();

        // Remove item
        const updatedCart = cart.filter(cartItem => cartItem.item.id !== itemId);

        // Save to localStorage
        localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));

        // Update cart badge immediately
        updateCartBadge();

        return updatedCart;
    }

    /**
     * Update item quantity
     * @param {string} itemId - Item ID to update
     * @param {number} quantity - New quantity
     * @returns {Array} - Updated cart
     */
    function updateQuantity(itemId, quantity) {
        // Validate quantity
        if (quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }

        // Get current cart
        const cart = getCart();

        // Find item
        const itemIndex = cart.findIndex(cartItem => cartItem.item.id === itemId);

        if (itemIndex === -1) {
            throw new Error('Item not found in cart');
        }

        // Update quantity
        cart[itemIndex].quantity = quantity;

        // Save to localStorage
        localStorage.setItem(CART_KEY, JSON.stringify(cart));

        // Update cart badge immediately
        updateCartBadge();

        return cart;
    }

    /**
     * Clear cart
     * @returns {Array} - Empty cart
     */
    function clearCart() {
        localStorage.removeItem(CART_KEY);

        // Update cart badge immediately
        updateCartBadge();

        return [];
    }

    /**
     * Calculate the total price of items in the cart
     * @returns {number} - Total price
     */
    function getTotalPrice() {
        const cart = getCart();
        return cart.reduce((total, cartItem) => {
            return total + (cartItem.item.price * cartItem.quantity);
        }, 0);
    }

    /**
     * Apply discount to orders above a certain amount
     * @param {number} total - The total order amount
     * @returns {number} - Discounted total
     */
    function applyDiscount(total) {
        // No discount applied - return original total
        return total;
    }

    /**
     * Calculate the total number of items in the cart
     * @returns {number} - Total number of items
     */
    function getTotalItems() {
        const cart = getCart();
        return cart.reduce((total, cartItem) => {
            return total + cartItem.quantity;
        }, 0);
    }

    /**
     * Update the cart badge to show total items
     */
    function updateCartBadge() {
        const cartBadge = document.getElementById('cart-badge');
        if (!cartBadge) return;
        
        // Get the total number of items in the cart
        const totalItems = getTotalItems();
        
        // Update the badge
        cartBadge.textContent = totalItems;
        
        // Show or hide badge based on cart contents
        if (totalItems > 0) {
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }
    }
    
    // Initialize cart badge on page load
    document.addEventListener('DOMContentLoaded', updateCartBadge);
    
    // Public API
    return {
        getCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        applyDiscount,
        updateCartBadge
    };
})();
