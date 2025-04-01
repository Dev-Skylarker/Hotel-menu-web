/**
 * Currency utility functions for Campus Cafe
 * Provides consistent currency formatting across the application
 */

/**
 * Format a number as Kenyan Shillings (KES)
 * @param {number} amount - The amount to format
 * @param {boolean} useSymbol - Whether to use the currency symbol or code
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, useSymbol = false) {
    // Ensure amount is a number
    const numAmount = Number(amount);
    
    if (isNaN(numAmount)) {
        return 'Invalid amount';
    }
    
    // Format with 2 decimal places
    const formattedAmount = numAmount.toFixed(2);
    
    // Return with currency prefix
    return useSymbol ? `KSh ${formattedAmount}` : `KES ${formattedAmount}`;
}

// Create a global formatters object if it doesn't exist
if (typeof window.formatters === 'undefined') {
    window.formatters = {};
}

// Add currency formatter to global formatters
window.formatters.currency = formatCurrency; 