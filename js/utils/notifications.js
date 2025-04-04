/**
 * Notifications System for Campus Cafe
 * Handles displaying toast notifications, alerts, and confirmation dialogs
 */

const notificationsManager = (function() {
    // DOM elements
    let toastContainer = null;
    let confirmationModal = null;
    
    /**
     * Initialize the notifications system
     */
    function init() {
        // Check if toast container exists, create it if not
        toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
            
            // Add CSS styles if needed
            if (!document.getElementById('toast-styles')) {
                const style = document.createElement('style');
                style.id = 'toast-styles';
                style.textContent = `
                    #toast-container {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 9999;
                        max-width: 320px;
                    }
                    .toast {
                        display: flex;
                        align-items: center;
                        padding: 12px 16px;
                        border-radius: 6px;
                        margin-bottom: 10px;
                        background-color: white;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        opacity: 0;
                        transform: translateX(50px);
                        animation: toast-in 0.3s forwards;
                    }
                    .toast.success {
                        border-left: 4px solid #2ecc71;
                    }
                    .toast.error {
                        border-left: 4px solid #e74c3c;
                    }
                    .toast.warning {
                        border-left: 4px solid #f39c12;
                    }
                    .toast.info {
                        border-left: 4px solid #3498db;
                    }
                    .toast-icon {
                        margin-right: 12px;
                        color: #555;
                    }
                    .toast-content {
                        flex: 1;
                    }
                    .toast-message {
                        margin: 0;
                        color: #333;
                    }
                    .toast-close {
                        background: none;
                        border: none;
                        color: #999;
                        cursor: pointer;
                        font-size: 18px;
                        padding: 0 4px;
                    }
                    @keyframes toast-in {
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    @keyframes fade-out {
                        to {
                            opacity: 0;
                            transform: translateX(50px);
                        }
                    }
                    .confirm-modal-backdrop {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        z-index: 9998;
                        align-items: center;
                        justify-content: center;
                    }
                    .confirm-modal {
                        background-color: white;
                        border-radius: 6px;
                        padding: 20px;
                        max-width: 400px;
                        width: 90%;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    }
                    .confirm-modal-title {
                        margin-top: 0;
                        color: #333;
                    }
                    .confirm-modal-message {
                        margin-bottom: 20px;
                    }
                    .confirm-modal-buttons {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Check if confirmation modal exists, create it if not
        confirmationModal = document.getElementById('confirmation-modal-backdrop');
        if (!confirmationModal) {
            confirmationModal = document.createElement('div');
            confirmationModal.id = 'confirmation-modal-backdrop';
            confirmationModal.className = 'confirm-modal-backdrop';
            confirmationModal.innerHTML = `
                <div class="confirm-modal">
                    <h3 class="confirm-modal-title">Confirm Action</h3>
                    <div class="confirm-modal-message">Are you sure you want to proceed?</div>
                    <div class="confirm-modal-buttons">
                        <button id="confirm-cancel-btn" class="btn btn-secondary">Cancel</button>
                        <button id="confirm-proceed-btn" class="btn btn-primary">Proceed</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmationModal);
            
            // Add event listeners for close button
            const cancelBtn = document.getElementById('confirm-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    confirmationModal.style.display = 'none';
                });
            }
            
            // Close when clicking on backdrop
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) {
                    confirmationModal.style.display = 'none';
                }
            });
        }
        
        console.log('Notifications system initialized');
    }
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type of notification: success, error, warning, or info
     * @param {number} duration - Duration in milliseconds
     * @returns {HTMLElement} - The toast element
     */
    function showToast(message, type = 'info', duration = 5000) {
        // Make sure the container exists
        if (!toastContainer) {
            init();
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
        
        // Return the toast element for further manipulation
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
     * Show a confirmation dialog
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - Callback when user confirms
     * @param {Function} onCancel - Callback when user cancels (optional)
     * @param {string} title - Title for the confirmation dialog (optional)
     * @param {string} confirmText - Text for confirm button (optional)
     * @param {string} cancelText - Text for cancel button (optional)
     */
    function confirm(message, onConfirm, onCancel, title = 'Confirm Action', confirmText = 'Confirm', cancelText = 'Cancel') {
        // Make sure the modal exists
        if (!confirmationModal) {
            init();
        }
        
        // Update content
        const titleEl = confirmationModal.querySelector('.confirm-modal-title');
        const messageEl = confirmationModal.querySelector('.confirm-modal-message');
        const confirmBtn = document.getElementById('confirm-proceed-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (confirmBtn) confirmBtn.textContent = confirmText;
        if (cancelBtn) cancelBtn.textContent = cancelText;
        
        // Remove old event listeners
        const oldConfirmBtn = document.getElementById('confirm-proceed-btn');
        if (oldConfirmBtn) {
            const newConfirmBtn = oldConfirmBtn.cloneNode(true);
            oldConfirmBtn.parentNode.replaceChild(newConfirmBtn, oldConfirmBtn);
        }
        
        // Add new event listeners
        const newConfirmBtn = document.getElementById('confirm-proceed-btn');
        if (newConfirmBtn) {
            newConfirmBtn.addEventListener('click', () => {
                confirmationModal.style.display = 'none';
                if (typeof onConfirm === 'function') {
                    onConfirm();
                }
            });
        }
        
        // Update cancel button
        const oldCancelBtn = document.getElementById('confirm-cancel-btn');
        if (oldCancelBtn) {
            const newCancelBtn = oldCancelBtn.cloneNode(true);
            oldCancelBtn.parentNode.replaceChild(newCancelBtn, oldCancelBtn);
        }
        
        // Add cancel handler
        const newCancelBtn = document.getElementById('confirm-cancel-btn');
        if (newCancelBtn) {
            newCancelBtn.addEventListener('click', () => {
                confirmationModal.style.display = 'none';
                if (typeof onCancel === 'function') {
                    onCancel();
                }
            });
        }
        
        // Show the modal
        confirmationModal.style.display = 'flex';
    }
    
    // Public API
    return {
        init,
        showToast,
        closeToast,
        confirm
    };
})();

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    notificationsManager.init();
});

// Make showToast available globally for backward compatibility
window.showToast = function(message, type, duration) {
    return notificationsManager.showToast(message, type, duration);
}; 