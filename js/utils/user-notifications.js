/**
 * User Notifications System for Campus Cafe
 * Displays notifications to users about their orders
 */

const userNotificationsManager = (function() {
    // DOM elements
    let notificationsContainer = null;
    let notificationsIcon = null;
    let notificationsCount = null;
    let notificationsDropdown = null;
    
    // State
    let notifications = [];
    let unreadCount = 0;
    
    /**
     * Initialize the notifications system
     */
    function init() {
        // Load user notifications
        loadNotifications();
        
        // Setup UI components
        setupUI();
        
        // Start polling for new notifications
        startPolling();
        
        console.log('User notifications system initialized');
    }
    
    /**
     * Setup UI components for notifications
     */
    function setupUI() {
        // Check if header exists
        const header = document.querySelector('header');
        if (!header) return;
        
        // Check if notifications icon already exists
        notificationsIcon = document.getElementById('notifications-icon');
        
        if (!notificationsIcon) {
            // Create notifications icon
            const navItems = header.querySelector('nav ul');
            if (!navItems) return;
            
            // Create notifications menu item
            const notificationsLi = document.createElement('li');
            notificationsLi.className = 'notifications-menu';
            
            // Create icon with counter
            notificationsLi.innerHTML = `
                <a href="#" id="notifications-icon" class="nav-link">
                    <i class="fas fa-bell"></i>
                    <span id="notifications-count" class="notifications-badge">0</span>
                </a>
                <div id="notifications-dropdown" class="notifications-dropdown">
                    <div class="notifications-header">
                        <h3>Notifications</h3>
                        <button id="mark-all-read" class="btn btn-sm">Mark all as read</button>
                    </div>
                    <div id="notifications-list" class="notifications-list">
                        <div class="no-notifications">No notifications</div>
                    </div>
                </div>
            `;
            
            // Add to nav
            navItems.appendChild(notificationsLi);
            
            // Get references to elements
            notificationsIcon = document.getElementById('notifications-icon');
            notificationsCount = document.getElementById('notifications-count');
            notificationsDropdown = document.getElementById('notifications-dropdown');
            
            // Add event listeners
            notificationsIcon.addEventListener('click', function(e) {
                e.preventDefault();
                toggleNotificationsDropdown();
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (notificationsDropdown && notificationsDropdown.style.display === 'block') {
                    if (!notificationsDropdown.contains(e.target) && e.target !== notificationsIcon) {
                        notificationsDropdown.style.display = 'none';
                    }
                }
            });
            
            // Mark all as read button
            const markAllReadBtn = document.getElementById('mark-all-read');
            if (markAllReadBtn) {
                markAllReadBtn.addEventListener('click', function() {
                    markAllNotificationsAsRead();
                });
            }
            
            // Add CSS styles
            if (!document.getElementById('notifications-styles')) {
                const style = document.createElement('style');
                style.id = 'notifications-styles';
                style.textContent = `
                    .notifications-menu {
                        position: relative;
                    }
                    .notifications-badge {
                        position: absolute;
                        top: -5px;
                        right: -5px;
                        background-color: #e74c3c;
                        color: white;
                        border-radius: 50%;
                        min-width: 18px;
                        height: 18px;
                        font-size: 11px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                    }
                    .notifications-dropdown {
                        display: none;
                        position: absolute;
                        right: 0;
                        top: 40px;
                        background-color: white;
                        border-radius: 6px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                        width: 320px;
                        max-height: 400px;
                        z-index: 1000;
                        overflow: hidden;
                    }
                    .notifications-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 15px;
                        border-bottom: 1px solid #eee;
                    }
                    .notifications-header h3 {
                        margin: 0;
                        font-size: 16px;
                        font-weight: 600;
                    }
                    .notifications-list {
                        max-height: 350px;
                        overflow-y: auto;
                    }
                    .notification-item {
                        padding: 12px 15px;
                        border-bottom: 1px solid #eee;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }
                    .notification-item:hover {
                        background-color: #f9f9f9;
                    }
                    .notification-item.unread {
                        background-color: #f0f7ff;
                    }
                    .notification-title {
                        font-weight: 600;
                        margin-bottom: 4px;
                        font-size: 14px;
                    }
                    .notification-message {
                        font-size: 13px;
                        margin-bottom: 5px;
                        color: #333;
                    }
                    .notification-time {
                        font-size: 11px;
                        color: #888;
                    }
                    .no-notifications {
                        padding: 15px;
                        text-align: center;
                        color: #888;
                        font-style: italic;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Update notification count badge
        updateNotificationBadge();
    }
    
    /**
     * Toggle notifications dropdown
     */
    function toggleNotificationsDropdown() {
        if (notificationsDropdown) {
            const isVisible = notificationsDropdown.style.display === 'block';
            notificationsDropdown.style.display = isVisible ? 'none' : 'block';
            
            // Mark as read when opening
            if (!isVisible) {
                // Update UI with notifications
                renderNotifications();
            }
        }
    }
    
    /**
     * Load notifications for current user
     */
    function loadNotifications() {
        // Check if user is logged in
        const userData = localStorage.getItem('campus_cafe_user');
        if (!userData) return;
        
        const user = JSON.parse(userData);
        const userEmail = user.email?.toLowerCase();
        const admissionNumber = user.user_metadata?.admissionNumber || user.admissionNumber;
        
        if (!userEmail && !admissionNumber) return;
        
        // Get all notifications
        const notificationsData = localStorage.getItem('campus_cafe_notifications');
        if (!notificationsData) return;
        
        const allNotifications = JSON.parse(notificationsData);
        
        // Filter notifications for this user
        notifications = allNotifications.filter(n => {
            const notifEmail = n.userEmail?.toLowerCase();
            const notifAdmission = n.admissionNumber;
            
            return (userEmail && notifEmail === userEmail) || 
                  (admissionNumber && notifAdmission === admissionNumber);
        });
        
        // Calculate unread count
        unreadCount = notifications.filter(n => !n.read).length;
        
        // Update UI
        updateNotificationBadge();
    }
    
    /**
     * Update notification badge count
     */
    function updateNotificationBadge() {
        if (notificationsCount) {
            notificationsCount.textContent = unreadCount;
            notificationsCount.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }
    
    /**
     * Render notifications in the dropdown
     */
    function renderNotifications() {
        if (!notificationsDropdown) return;
        
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        // Clear existing notifications
        notificationsList.innerHTML = '';
        
        // If no notifications, show message
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<div class="no-notifications">No notifications</div>';
            return;
        }
        
        // Sort notifications by timestamp (newest first)
        const sortedNotifications = [...notifications].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Render each notification
        sortedNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationItem.dataset.id = notification.id;
            
            // Format time
            const timestamp = new Date(notification.timestamp);
            const timeAgo = formatTimeAgo(timestamp);
            
            // Create notification content
            notificationItem.innerHTML = `
                <div class="notification-title">Order #${notification.orderId} ${notification.status}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${timeAgo}</div>
            `;
            
            // Add click event to mark as read
            notificationItem.addEventListener('click', function() {
                markNotificationAsRead(notification.id);
                notificationItem.classList.remove('unread');
                
                // Navigate to order details if available
                const orderDetailsPage = `order-details.html?id=${notification.orderId}`;
                window.location.href = orderDetailsPage;
            });
            
            // Add to list
            notificationsList.appendChild(notificationItem);
        });
    }
    
    /**
     * Mark a notification as read
     * @param {string} notificationId - Notification ID
     */
    function markNotificationAsRead(notificationId) {
        // Find the notification
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index === -1) return;
        
        // Mark as read
        notifications[index].read = true;
        
        // Update unread count
        unreadCount = notifications.filter(n => !n.read).length;
        
        // Save to localStorage
        saveNotifications();
        
        // Update UI
        updateNotificationBadge();
    }
    
    /**
     * Mark all notifications as read
     */
    function markAllNotificationsAsRead() {
        // Mark all as read
        notifications.forEach(n => {
            n.read = true;
        });
        
        // Update unread count
        unreadCount = 0;
        
        // Save to localStorage
        saveNotifications();
        
        // Update UI
        updateNotificationBadge();
        renderNotifications();
    }
    
    /**
     * Save notifications to localStorage
     */
    function saveNotifications() {
        // Get all notifications
        const notificationsData = localStorage.getItem('campus_cafe_notifications');
        if (!notificationsData) return;
        
        const allNotifications = JSON.parse(notificationsData);
        
        // Update notifications
        notifications.forEach(updatedNotif => {
            const index = allNotifications.findIndex(n => n.id === updatedNotif.id);
            if (index !== -1) {
                allNotifications[index] = updatedNotif;
            }
        });
        
        // Save back to localStorage
        localStorage.setItem('campus_cafe_notifications', JSON.stringify(allNotifications));
    }
    
    /**
     * Start polling for new notifications
     */
    function startPolling() {
        // Poll every 30 seconds
        setInterval(() => {
            loadNotifications();
            
            // Update UI if dropdown is open
            if (notificationsDropdown && notificationsDropdown.style.display === 'block') {
                renderNotifications();
            }
        }, 30000); // 30 seconds
    }
    
    /**
     * Format time ago
     * @param {Date} date - Date to format
     * @returns {string} - Formatted time
     */
    function formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) {
            return 'just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            // Format date
            return date.toLocaleDateString();
        }
    }
    
    // Public API
    return {
        init,
        loadNotifications
    };
})();

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    userNotificationsManager.init();
}); 