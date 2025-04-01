# Changelog

All notable changes to the Campus Cafe System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-05-24

### Added
- Order management system with real-time tracking
- "Mark as Collected" functionality for ready orders
- View Past Orders button to access order history
- Auto-refresh of orders every 10 seconds
- Enhanced empty state handling for no pending orders
- Clear action buttons to navigate to Menu or Cart
- Thank you modal after marking an order as collected
- Improved admission number validation and error handling
- Clear messaging for payment confirmation requirements

### Changed
- Updated My Orders page layout for better usability
- Improved order card design with more detailed information
- Enhanced order status display with visual indicators
- Better handling of page visibility for performance optimization
- Updated README.md with new features documentation
- Improved JSDoc comments for better code documentation

### Fixed
- Order refresh not working when page visibility changes
- Missing error handling in order status updates
- Inconsistent display of collection information
- Admission number validation not providing proper feedback
- Storage functions returning inconsistent results

## [1.1.0] - 2024-05-01

### Added
- Collection options (Table service vs Counter pickup)
- M-Pesa payment instructions
- Admission number tracking for orders
- Order code generation for payment reference

### Changed
- Improved checkout flow with clearer instructions
- Enhanced cart summary display
- Updated order confirmation with collection details

## [1.0.0] - 2024-04-15

### Added
- Initial release of Campus Cafe System
- Basic menu browsing and ordering
- Cart functionality
- Admin dashboard for order management
- Theme switching (light/dark mode)
- Responsive design for mobile and desktop 