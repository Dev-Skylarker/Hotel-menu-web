# Campus Cafe System Documentation

## 1. Executive Summary

The Campus Cafe System is a web application for university food services. It delivers digital menu management, ordering capabilities, and customer engagement through dynamic statistics. Built with modern web technologies and local storage for data persistence, the system features a responsive interface with Kenyan currency integration, theme options, and administrative tools.

## 2. Project Overview

### 2.1 Authors
1. ERIC MAINA - B135/25514/2023  
2. ROY MBECHE - B135/25628/2023 
3. DERRICK MAINA - B135/25499/2023 
4. KIPKOGEI FORTUNE - B135/25608/2023 
5. BARASA JUMA JAMIL - B135/25617/2023

### 2.2 Purpose
The Campus Cafe System digitizes ordering processes at university eateries, providing students and faculty with a convenient platform for browsing menus, placing orders, and tracking order status. The system improves operational efficiency through a modern interface and intuitive features.

### 2.3 Scope
This documentation covers the complete Campus Cafe System implementation, including features, architecture, requirements, and technical specifications. The system is designed for Kenyan university cafes but can be adapted for similar contexts.

### 2.4 Target Audience
- Students and faculty members
- Cafe staff and management
- System administrators

## 3. System Requirements

### 3.1 Functional Requirements

1. **User Interface Requirements**
   - FR1.1: Responsive interface compatible with multiple device types
   - FR1.2: Navigation to all core pages (Home, Menu, About, Contact, Orders)
   - FR1.3: Theme switching between light and dark modes
   - FR1.4: Display of dynamic customer statistics

2. **Menu Display Requirements**
   - FR2.1: Categorized menu with item details and images
   - FR2.2: Category-based filtering
   - FR2.3: Keyword search functionality
   - FR2.4: Featured dishes on the home page

3. **Order Processing Requirements**
   - FR3.1: Item selection and order placement
   - FR3.2: Unique order number generation
   - FR3.3: Order confirmation with pickup time estimation
   - FR3.4: Order status tracking
   - FR3.5: Payment instructions for pickup
   - FR3.6: Order history access

4. **Data Management Requirements**
   - FR4.1: Local storage for menu items, orders, and credentials
   - FR4.2: Statistical data tracking
   - FR4.3: Multi-admin credential configuration

5. **Administration Requirements**
   - FR5.1: Secure admin authentication
   - FR5.2: Support for multiple admin users
   - FR5.3: Menu and order management
   - FR5.4: Admin credential configuration

### 3.2 Non-Functional Requirements

1. **Performance Requirements**
   - NFR1.1: Page load under 3 seconds on standard connections
   - NFR1.2: Support for 100+ concurrent users
   - NFR1.3: Variable refresh rates for statistics counters

2. **Usability Requirements**
   - NFR2.1: Intuitive interface for new users
   - NFR2.2: Compliance with WCAG 2.1 Level AA
   - NFR2.3: Consistent navigation across pages

3. **Reliability Requirements**
   - NFR3.1: Cross-browser compatibility
   - NFR3.2: Offline functionality with local data storage
   - NFR3.3: Clear error handling

4. **Security Requirements**
   - NFR4.1: Input sanitization to prevent XSS
   - NFR4.2: Password hashing for admin accounts
   - NFR4.3: Minimal sensitive data storage

5. **Maintainability Requirements**
   - NFR5.1: Modular code structure
   - NFR5.2: Comprehensive documentation
   - NFR5.3: Customization options for menus and styling

## 4. System Architecture

### 4.1 Architecture Overview

The Campus Cafe System uses a client-side architecture with:

1. **Presentation Layer**: HTML and CSS for UI rendering
2. **Application Layer**: JavaScript modules for business logic
3. **Data Layer**: LocalStorage-based persistence

```
┌─────────────────────────────────────────────────┐
│                 Client Browser                   │
├─────────────┬─────────────────┬─────────────────┤
│ Presentation│   Application   │      Data       │
│    Layer    │      Layer      │     Layer       │
│  (HTML/CSS) │   (JavaScript)  │  (LocalStorage) │
└─────────────┴─────────────────┴─────────────────┘
```

### 4.2 Component Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Campus Cafe System                             │
│                                                                      │
│  ┌───────────────┐     ┌───────────────┐     ┌──────────────────┐    │
│  │User Interface │◄────┤ Menu Manager  │◄────┤  Storage Manager │    │
│  │  Components   │     │               │     │                  │    │
│  └───────┬───────┘     └──────┬────────┘     └────────┬─────────┘    │
│          │                    │                       │               │
│          ▼                    ▼                       ▼               │
│  ┌─────────────┐      ┌────────────────┐     ┌─────────────────┐     │
│  │Theme Manager│      │Order Processor │     │LocalStorage API │     │
│  └─────────────┘      └────────┬───────┘     └─────────────────┘     │
│          │                     │                      ▲               │
│          │                     ▼                      │               │
│          │             ┌────────────────┐     ┌───────────────┐      │
│          └────────────►│Stats Manager   │────►│Config Manager │      │
│                        └────────────────┘     └───────────────┘      │
│                                │                      ▲               │
│                                ▼                      │               │
│                        ┌────────────────┐     ┌───────────────┐      │
│                        │Auth Manager    │────►│Admin Interface│      │
│                        └────────────────┘     └───────────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 Data Flow Diagram

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│    User     │ ─────►   │    Menu     │ ─────►   │   Order     │
│  Interface  │          │  Browsing   │          │ Processing  │
└─────────────┘          └─────────────┘          └─────────────┘
      ▲                        │                        │
      │                        ▼                        ▼
      │                  ┌─────────────┐          ┌─────────────┐
      └──────────────── │   Storage    │ ◄────── │   Order     │
                │       │   Manager    │          │Confirmation │
                │       └─────────────┘          └─────────────┘
                │              │                       │
                │              ▼                       │
          ┌─────────────┐    ┌─────────────┐          │
          │  Admin      │◄───┤   Auth      │◄─────────┘
          │  Interface  │    │   Manager   │
          └─────────────┘    └─────────────┘
                │                  ▲
                ▼                  │
          ┌─────────────┐    ┌─────────────┐
          │  Stats      │───►│   Config    │
          │  Manager    │    │   Manager   │
          └─────────────┘    └─────────────┘
```

### 4.4 Class Diagram

```
┌───────────────────────┐     ┌───────────────────────┐
│     StorageManager    │     │      CartManager      │
├───────────────────────┤     ├───────────────────────┤
│ - MENU_ITEMS_KEY      │     │ - CART_KEY            │
│ - ORDERS_KEY          │     ├───────────────────────┤
│ - MESSAGES_KEY        │     │ + getCart()           │
├───────────────────────┤     │ + addToCart()         │
│ + initStorage()       │     │ + removeFromCart()    │
│ + getMenuItems()      │     │ + updateQuantity()    │
│ + getMenuItemById()   │     │ + clearCart()         │
│ + saveMenuItem()      │     │ + getTotalPrice()     │
│ + getOrders()         │     │ + getTotalItems()     │
│ + saveOrder()         │     └───────────┬───────────┘
│ + updateOrderStatus() │                 │
└─────────┬─────────────┘                 │
          │                               │
          │                               │
┌─────────▼─────────────┐     ┌───────────▼───────────┐
│     StatsManager      │     │      AuthManager      │
├───────────────────────┤     ├───────────────────────┤
│ - STATS_KEY           │     │ - USER_KEY            │
│ - DEFAULT_STATS       │     │ - TOKEN_KEY           │
│ - INCREMENT_RATES     │     ├───────────────────────┤
├───────────────────────┤     │ + init()              │
│ + initStats()         │     │ + login()             │
│ + getStats()          │     │ + isLoggedIn()        │
│ + incrementCompleteOrder() │ │ + getCurrentUser()   │
│ + incrementOrderSubmitted()│ │ + logout()           │
│ + updateStatsDisplay()│     │ + addAdmin()          │
└───────────────────────┘     └───────────────────────┘
          │                               ▲
          │                               │
┌─────────▼─────────────┐     ┌───────────┴───────────┐
│    ConfigManager      │     │     MenuManager       │
├───────────────────────┤     ├───────────────────────┤
│ - ENV                 │     │ + loadMenuItems()     │
├───────────────────────┤     │ + displayMenuItems()  │
│ + getAdminCredentials()│    │ + filterByCategory()  │
│ + isDevelopment()     │     │ + searchMenuItems()   │
│ + updateAdminCredential()│  │ + placeOrder()        │
│ + removeAdminCredential()│  │ + showItemDetails()   │
└───────────────────────┘     └───────────────────────┘
```

## 5. System Components

### 5.1 Frontend Components

| Component | File(s) | Description |
|-----------|---------|-------------|
| Home Page | index.html, js/main.js | Landing page with featured dishes |
| Menu Page | menu.html, js/menu.js | Browse and filter food items |
| About Page | about.html | Cafe information |
| Contact Page | contact.html, js/contact.js | Contact form and info |
| My Orders Page | my-orders.html, js/my-orders.js | Order history and tracking |
| Order Details Page | order-details.html, js/order-details.js | Detailed order view |
| Cart Page | cart.html, js/cart.js | Shopping cart and checkout |
| Storage Manager | js/utils/storage.js | LocalStorage data handling |
| Auth Manager | js/utils/auth.js | Authentication |
| Cart Manager | js/utils/storage.js | Cart operations |
| Stats Manager | js/utils/stats.js | Statistical counters |
| Config Manager | js/utils/config.js | System configuration |
| Theme Manager | js/utils/theme.js | Theme switching |
| Stylesheets | css/styles.css, css/admin.css | UI styling |

### 5.2 Data Models

#### 5.2.1 Menu Item Model
```javascript
{
    id: String,               // Unique identifier
    name: String,             // Item name
    price: Number,            // Price in KSh
    category: String,         // Category
    description: String,      // Description
    ingredients: Array,       // Ingredients list
    imageUrl: String,         // Image URL
    featured: Boolean         // Featured status
}
```

#### 5.2.2 Order Model
```javascript
{
    id: String,               // Order number
    item: Object,             // Menu item
    quantity: Number,         // Quantity
    status: String,           // Status
    orderTime: String,        // Order time
    estimatedPickupTime: String, // Pickup time
    paymentMethod: String,    // Payment method
    paymentStatus: String,    // Payment status
    notes: String             // Order notes
}
```

#### 5.2.3 User Model (Admin)
```javascript
{
    email: String,            // Email
    passwordHash: String      // Hashed password
}
```

#### 5.2.4 Stats Model
```javascript
{
    customersServedToday: Number,  // Daily customers
    customersEverServed: Number,   // Total customers
    ordersSubmitted: Number,       // Total orders
    lastResetDate: String,         // Last reset date
    lastUpdateTime: Number         // Last update time
}
```

## 6. User Interface Design

### 6.1 Page Flow Diagram

```
                          ┌───────────┐
                          │  Home     │
                          │  Page     │
                          └─────┬─────┘
                                │
           ┌──────────────┬────┼────┬──────────────┐
           │              │    │    │              │
      ┌─────────┐    ┌─────────┐    │         ┌─────────┐
      │ About   │    │  Menu   │    │         │ Contact │
      │ Page    │    │  Page   │    │         │ Page    │
      └─────────┘    └────┬────┘    │         └─────────┘
                          │         │
                     ┌────┴────┐    │
                     │  Item   │    │
                     │ Details │    │
                     └────┬────┘    │
                          │         │
                     ┌────┴────┐    │
                     │  Cart   │◄───┘
                     │  Page   │
                     └────┬────┘
                          │
                     ┌────┴────┐
                     │ Checkout│
                     │         │
                     └────┬────┘
                          │
               ┌──────────┴──────────┐
               │                     │
          ┌────┴────┐          ┌─────┴────┐
          │My Orders│          │  Order   │
          │  Page   │────────►│  Details │
          └─────────┘          └──────────┘
```

### 6.2 Sequence Diagram - Placing an Order

```
┌─────┐          ┌─────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│User │          │Menu │          │ItemDetails│          │  Cart    │          │Checkout  │
└──┬──┘          └──┬──┘          └────┬─────┘          └────┬─────┘          └────┬─────┘
   │     Browse     │                  │                     │                     │
   │────────────────>                  │                     │                     │
   │                │                  │                     │                     │
   │  Select Item   │                  │                     │                     │
   │────────────────>                  │                     │                     │
   │                │                  │                     │                     │
   │                │    Show Item     │                     │                     │
   │                │─────────────────>│                     │                     │
   │                │                  │                     │                     │
   │                │                  │    Add to Cart      │                     │
   │                │                  │────────────────────>│                     │
   │                │                  │                     │                     │
   │                │                  │                     │  Go to Checkout     │
   │                │                  │                     │<────────────────────│
   │                │                  │                     │                     │
   │                │                  │                     │   Place Order       │
   │                │                  │                     │────────────────────>│
   │                │                  │                     │                     │
   │                │                  │                     │    Show Payment     │
   │                │                  │                     │    Instructions     │
   │<────────────────────────────────────────────────────────────────────────────│
   │                │                  │                     │                     │
┌──┴──┐          ┌──┴──┐          ┌────┴─────┐          ┌────┴─────┐          ┌────┴─────┐
│User │          │Menu │          │ItemDetails│          │  Cart    │          │Checkout  │
└─────┘          └─────┘          └──────────┘          └──────────┘          └──────────┘
```

### 6.3 Sequence Diagram - Admin Authentication

```
┌─────┐          ┌───────────┐          ┌───────────┐          ┌───────────┐
│Admin│          │Login Page │          │AuthManager│          │ConfigMgr  │
└──┬──┘          └─────┬─────┘          └─────┬─────┘          └─────┬─────┘
   │  Enter Login      │                      │                      │
   │  Credentials      │                      │                      │
   │─────────────────> │                      │                      │
   │                   │                      │                      │
   │                   │  Attempt Login       │                      │
   │                   │─────────────────────>│                      │
   │                   │                      │                      │
   │                   │                      │  Get Admin           │
   │                   │                      │  Credentials         │
   │                   │                      │─────────────────────>│
   │                   │                      │                      │
   │                   │                      │  Return              │
   │                   │                      │  Credentials         │
   │                   │                      │<─────────────────────│
   │                   │                      │                      │
   │                   │                      │ Validate             │
   │                   │                      │ Credentials          │
   │                   │                      │───┐                  │
   │                   │                      │<──┘                  │
   │                   │                      │                      │
   │                   │  Authentication      │                      │
   │                   │  Result              │                      │
   │                   │<─────────────────────│                      │
   │                   │                      │                      │
   │  Redirect to      │                      │                      │
   │  Dashboard        │                      │                      │
   │<──────────────────│                      │                      │
   │                   │                      │                      │
┌──┴──┐          ┌─────┴─────┐          ┌─────┴─────┐          ┌─────┴─────┐
│Admin│          │Login Page │          │AuthManager│          │ConfigMgr  │
└─────┘          └───────────┘          └───────────┘          └───────────┘
```

## 7. Key Features Explained

### 7.1 Dynamic Statistics System

The statistics feature displays counters for:
- Customers served today
- Total customers served
- Orders submitted

Implementation details:
- Baseline starting values (38, 18540, 22098)
- Variable increment intervals
- Daily counter reset
- Threshold-based rate adjustment
- Animated value changes
- LocalStorage persistence
- Order-triggered updates

The statistics enhance user engagement by showcasing cafe activity.

### 7.2 Admin Credentials System

The multi-admin system provides:
- Secure credential storage
- Multiple admin account support
- Password security
- Development mode toggle
- Credential management interface

This allows multiple staff members to access administrative functions.

### 7.3 Payment Instructions System

The payment system includes:
- Clear paybill instructions
- Order number generation
- Payment reference tracking
- Payment status management

These features guide users through the payment process.

## 8. Database Schema

The application uses localStorage for data persistence:

### 8.1 Storage Keys

| Key | Description |
|-----|-------------|
| campus_cafe_menu_items | Menu items |
| campus_cafe_orders | Orders |
| campus_cafe_users | Admin users |
| campus_cafe_stats | Statistics |
| campus_cafe_cart | User's cart |
| campus_cafe_user | Current admin |
| campus_cafe_token | Auth token |
| campus_cafe_last_visit | Last visit timestamp |

### 8.2 Local Storage Schema Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     localStorage                            │
├────────────────────┬───────────────────────────────────────┤
│ campus_cafe_menu_items │ [                                 │
│                    │   { id, name, price, category, ... }, │
│                    │   { id, name, price, category, ... }, │
│                    │   ...                                 │
│                    │ ]                                     │
├────────────────────┼───────────────────────────────────────┤
│ campus_cafe_orders │ [                                     │
│                    │   { id, item, quantity, status, ... },│
│                    │   { id, item, quantity, status, ... },│
│                    │   ...                                 │
│                    │ ]                                     │
├────────────────────┼───────────────────────────────────────┤
│ campus_cafe_users  │ [                                     │
│                    │   { email, passwordHash },            │
│                    │   { email, passwordHash },            │
│                    │   ...                                 │
│                    │ ]                                     │
├────────────────────┼───────────────────────────────────────┤
│ campus_cafe_stats  │ {                                     │
│                    │   customersServedToday,               │
│                    │   customersEverServed,                │
│                    │   ordersSubmitted,                    │
│                    │   lastResetDate,                      │
│                    │   lastUpdateTime                      │
│                    │ }                                     │
├────────────────────┼───────────────────────────────────────┤
│ campus_cafe_cart   │ [                                     │
│                    │   { item, quantity },                 │
│                    │   { item, quantity },                 │
│                    │   ...                                 │
│                    │ ]                                     │
└────────────────────┴───────────────────────────────────────┘
```

## 9. Deployment

### 9.1 System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection for initial load
- WebStorage API support

### 9.2 Deployment Steps
1. Copy all files to a web server or local directory
2. Access index.html to launch the application
3. For admin access, navigate to admin/login.html

### 9.3 Testing
The system should be tested across multiple browsers and devices to ensure compatibility and responsive design functionality.

## 10. Maintenance and Support

### 10.1 Menu Updates
To update menu items, modify the `getDefaultMenuItems()` function in `js/utils/storage.js`.

### 10.2 Admin Credential Management
Admin credentials can be managed through:
1. Direct modification of `js/utils/config.js`
2. Using the admin configuration interface

### 10.3 Troubleshooting
Common issues:
- LocalStorage cleared: System will reset to defaults
- Theme not saving: Check browser cookie permissions
- Statistics reset: May occur when changing browsers

## 11. Appendices

### 11.1 Default Admin Credentials
- Email: admin@campuscafe.com
- Password: admin123

### 11.2 Glossary
- **KSh**: Kenyan Shilling
- **LocalStorage**: Browser-based data storage mechanism
- **Paybill**: Kenyan mobile payment system identifier

### 11.3 Reference Documents
- Modern JavaScript specifications
- HTML5 and CSS3 standards
- Web Content Accessibility Guidelines (WCAG) 2.1 