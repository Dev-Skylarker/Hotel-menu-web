/**
 * Realtime Data Sync Manager for Campus Cafe
 * Handles real-time updates for orders and admin dashboard
 */

const realtimeManager = (function() {
    // Configuration
    const DEFAULT_SYNC_INTERVAL = 5000; // 5 seconds
    let syncInterval = DEFAULT_SYNC_INTERVAL;
    let isActive = false;
    let timerId = null;
    
    // Callbacks
    const callbacks = {
        onOrdersUpdate: [],
        onOrderStatusChange: [],
        onMenuUpdate: []
    };
    
    // Last known states
    let lastOrdersHash = '';
    
    /**
     * Start real-time sync
     * @param {number} interval - Optional sync interval in milliseconds
     */
    function startSync(interval) {
        if (isActive) return;
        
        // Set sync interval
        syncInterval = interval || DEFAULT_SYNC_INTERVAL;
        isActive = true;
        
        // Start the sync loop
        checkForUpdates();
        timerId = setInterval(checkForUpdates, syncInterval);
        
        console.log(`Real-time sync started with ${syncInterval}ms interval`);
    }
    
    /**
     * Stop real-time sync
     */
    function stopSync() {
        if (!isActive) return;
        
        clearInterval(timerId);
        timerId = null;
        isActive = false;
        
        console.log('Real-time sync stopped');
    }
    
    /**
     * Check for data updates
     */
    function checkForUpdates() {
        // Check for order updates
        checkOrderUpdates();
        
        // Additional checks can be added here (menu updates, etc.)
    }
    
    /**
     * Check for order updates
     */
    function checkOrderUpdates() {
        // Get current orders
        const orders = storageManager.getOrders();
        
        // Generate a simple hash of the orders to detect changes
        const ordersHash = generateOrdersHash(orders);
        
        // If the hash has changed, trigger callbacks
        if (ordersHash !== lastOrdersHash) {
            lastOrdersHash = ordersHash;
            triggerCallbacks('onOrdersUpdate', orders);
        }
    }
    
    /**
     * Generate a simple hash for orders to detect changes
     * @param {Array} orders - Array of order objects
     * @returns {string} - Hash string
     */
    function generateOrdersHash(orders) {
        return orders.map(order => {
            return `${order.id}:${order.status}:${order.orderTime}`;
        }).join('|');
    }
    
    /**
     * Register a callback function for a specific event
     * @param {string} event - Event name (onOrdersUpdate, onOrderStatusChange, onMenuUpdate)
     * @param {Function} callback - Callback function
     */
    function on(event, callback) {
        if (!callbacks[event]) {
            console.error(`Unknown event: ${event}`);
            return;
        }
        
        callbacks[event].push(callback);
    }
    
    /**
     * Remove a callback function for a specific event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    function off(event, callback) {
        if (!callbacks[event]) {
            console.error(`Unknown event: ${event}`);
            return;
        }
        
        const index = callbacks[event].indexOf(callback);
        if (index !== -1) {
            callbacks[event].splice(index, 1);
        }
    }
    
    /**
     * Trigger all registered callbacks for an event
     * @param {string} event - Event name
     * @param {*} data - Data to pass to callbacks
     */
    function triggerCallbacks(event, data) {
        if (!callbacks[event]) {
            console.error(`Unknown event: ${event}`);
            return;
        }
        
        callbacks[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} callback:`, error);
            }
        });
    }
    
    /**
     * Update the status of an order and notify all clients
     * @param {string} orderId - Order ID
     * @param {string} status - New status (pending, ready, completed, cancelled)
     * @returns {boolean} - Success status
     */
    function updateOrderStatus(orderId, status) {
        // Use the storage manager to update the order
        const updatedOrder = storageManager.updateOrderStatus(orderId, status);
        
        if (updatedOrder) {
            // Trigger callbacks for status change
            triggerCallbacks('onOrderStatusChange', {
                orderId,
                status,
                order: updatedOrder
            });
            
            // Force an immediate check for updates
            checkOrderUpdates();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Mark an order as complete (status = 'completed')
     * @param {string} orderId - Order ID
     * @returns {boolean} - Success status
     */
    function markOrderAsCompleted(orderId) {
        return updateOrderStatus(orderId, 'completed');
    }
    
    // Public API
    return {
        startSync,
        stopSync,
        on,
        off,
        updateOrderStatus,
        markOrderAsCompleted
    };
})(); 