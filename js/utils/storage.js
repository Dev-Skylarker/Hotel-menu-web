/**
 * Storage Manager for Kenyan Delights Restaurant
 * Handles localStorage operations for menu items and orders
 */

const storageManager = (function() {
    // Storage keys
    const MENU_ITEMS_KEY = 'kenyan_delights_menu_items';
    const ORDERS_KEY = 'kenyan_delights_orders';
    
    /**
     * Initialize storage with default data if empty
     */
    function initStorage() {
        // Check if menu items exist
        const menuItems = localStorage.getItem(MENU_ITEMS_KEY);
        
        if (!menuItems) {
            // Initialize with default menu items
            const defaultMenuItems = getDefaultMenuItems();
            localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(defaultMenuItems));
        }
        
        // Check if orders exist
        const orders = localStorage.getItem(ORDERS_KEY);
        
        if (!orders) {
            // Initialize with empty orders array
            localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
        }
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
        // Validate item
        if (!item || !item.id || !item.name || !item.category || item.price === undefined) {
            throw new Error('Invalid menu item data');
        }
        
        // Get current menu items
        const menuItems = getMenuItems();
        
        // Check if item exists
        const existingIndex = menuItems.findIndex(i => i.id === item.id);
        
        if (existingIndex !== -1) {
            // Update existing item
            menuItems[existingIndex] = item;
        } else {
            // Add new item
            menuItems.push(item);
        }
        
        // Save to localStorage
        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(menuItems));
    }
    
    /**
     * Delete menu item by ID
     * @param {string} id - Item ID to delete
     */
    function deleteMenuItem(id) {
        // Get current menu items
        const menuItems = getMenuItems();
        
        // Filter out the item to delete
        const updatedItems = menuItems.filter(item => item.id !== id);
        
        // Save to localStorage
        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(updatedItems));
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
     * Save a new order
     * @param {Object} order - Order to save
     * @returns {Object} - Saved order with ID
     */
    function saveOrder(order) {
        // Validate order
        if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
            throw new Error('Invalid order data');
        }
        
        // Get current orders
        const orders = getOrders();
        
        // Add ID and date if not present
        if (!order.id) {
            order.id = generateOrderId();
        }
        
        if (!order.date) {
            order.date = new Date().toISOString();
        }
        
        // Add order to list
        orders.push(order);
        
        // Save to localStorage
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        
        return order;
    }
    
    /**
     * Generate a unique order ID
     * @returns {string} - Unique order ID
     */
    function generateOrderId() {
        // Get existing orders
        const orders = getOrders();
        
        // Find highest order number
        let highestNum = 0;
        
        orders.forEach(order => {
            if (order.id) {
                // Extract number from order ID (format: ORDER-123)
                const match = order.id.match(/ORDER-(\d+)/);
                if (match && match[1]) {
                    const num = parseInt(match[1], 10);
                    if (num > highestNum) {
                        highestNum = num;
                    }
                }
            }
        });
        
        // Generate new ID
        return `ORDER-${highestNum + 1}`;
    }
    
    /**
     * Default menu items
     * @returns {Array} - Array of default menu items
     */
    function getDefaultMenuItems() {
        return [
            {
                id: 'item_1',
                name: 'Kenyan Samosas',
                category: 'appetizers',
                price: 250,
                featured: true,
                description: 'Crispy triangular pastries filled with spiced beef or vegetables. A popular Kenyan street food with Indian influence.',
                ingredients: ['Pastry dough', 'Beef or vegetables', 'Onions', 'Garlic', 'Kenyan spices', 'Coriander']
            },
            {
                id: 'item_2',
                name: 'Ugali with Sukuma Wiki',
                category: 'main-courses',
                price: 450,
                featured: true,
                description: 'Kenya\'s staple dish of firm maize meal porridge served with stewed collard greens. The ultimate comfort food that fuels the nation.',
                ingredients: ['Maize flour', 'Water', 'Collard greens', 'Onions', 'Tomatoes', 'Vegetable oil']
            },
            {
                id: 'item_3',
                name: 'Nyama Choma',
                category: 'main-courses',
                price: 850,
                featured: true,
                description: 'Succulent grilled meat (usually goat or beef) seasoned with salt and served with kachumbari. The king of Kenyan cuisine.',
                ingredients: ['Goat or beef', 'Salt', 'Black pepper', 'Served with tomato and onion salad']
            },
            {
                id: 'item_4',
                name: 'Mandazi',
                category: 'desserts',
                price: 150,
                featured: false,
                description: 'Lightly sweetened East African fried bread flavored with cardamom and coconut. Perfect with a cup of chai tea.',
                ingredients: ['Flour', 'Sugar', 'Coconut milk', 'Cardamom', 'Vegetable oil']
            },
            {
                id: 'item_5',
                name: 'Chai Masala',
                category: 'drinks',
                price: 120,
                featured: false,
                description: 'Spiced Kenyan tea brewed with milk and aromatic spices. A comforting beverage enjoyed throughout the day.',
                ingredients: ['Black tea', 'Milk', 'Cinnamon', 'Cardamom', 'Cloves', 'Sugar']
            },
            {
                id: 'item_6',
                name: 'Mbuzi Stew',
                category: 'main-courses',
                price: 650,
                featured: false,
                description: 'Slow-cooked goat stew with tomatoes, onions, and traditional Kenyan spices. A rich and flavorful dish.',
                ingredients: ['Goat meat', 'Tomatoes', 'Onions', 'Garlic', 'Ginger', 'Kenyan spices']
            },
            {
                id: 'item_7',
                name: 'Kachumbari',
                category: 'appetizers',
                price: 180,
                featured: false,
                description: 'Fresh tomato and onion salad with a squeeze of lime. A vibrant accompaniment to many Kenyan dishes.',
                ingredients: ['Tomatoes', 'Onions', 'Lime juice', 'Coriander', 'Salt']
            },
            {
                id: 'item_8',
                name: 'Mahamri',
                category: 'desserts',
                price: 180,
                featured: false,
                description: 'Triangle-shaped fried bread with coconut and cardamom flavors. A coastal Kenyan specialty.',
                ingredients: ['Flour', 'Coconut milk', 'Yeast', 'Cardamom', 'Sugar', 'Vegetable oil']
            }
        ];
    }
    
    // Public API
    return {
        initStorage,
        getMenuItems,
        getMenuItemById,
        saveMenuItem,
        deleteMenuItem,
        getOrders,
        saveOrder
    };
})();

