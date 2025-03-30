# Campus Cafe System Documentation

## 1. Executive Summary

The Campus Cafe System is a responsive web application designed for a university eatery. It provides digital menu management, online ordering capabilities, and customer engagement features with gamified statistics. The system is built with modern web technologies (HTML5, CSS3, JavaScript) and uses local storage for data persistence. The application features a user-friendly interface with Kenyan currency integration, theme customization options, and multiple administrator support.

## 2. Project Overview

### 2.1 Authors
1. ERIC MAINA - B135/25514/2023  
2. ROY MBECHE - B135/25628/2023 
3. DERRICK MAINA - B135/25499/2023 
4. KIPKOGEI FORTUNE - B135/25608/2023 
5. BARASA JUMA JAMIL - B135/25617/2023

### 2.2 Purpose
The Campus Cafe System aims to digitize the ordering experience at university eateries, providing students and faculty with a convenient way to browse menu items, place orders, and track order status. The system enhances operational efficiency while providing a modern user experience with engaging features.

### 2.3 Scope
This documentation covers the web-based Campus Cafe System implementation, including all features, architecture, requirements, and technical specifications. The system is designed for deployment at university cafes in Kenya but can be adapted for similar food service contexts.

### 2.4 Target Audience
- Students and faculty members at universities
- Campus cafe staff and management
- System administrators and technical support personnel

## 3. System Requirements

### 3.1 Functional Requirements

1. **User Interface Requirements**
   - FR1.1: The system shall display a responsive interface compatible with desktop, tablet, and mobile devices.
   - FR1.2: The system shall provide navigation to Home, Menu, About, Contact, and My Orders pages.
   - FR1.3: The system shall allow users to toggle between light and dark mode themes.
   - FR1.4: The system shall display gamified statistics showing customer metrics.

2. **Menu Display Requirements**
   - FR2.1: The system shall display a categorized menu of food items with name, description, price, and image.
   - FR2.2: The system shall allow users to filter menu items by category.
   - FR2.3: The system shall allow users to search for menu items by keyword.
   - FR2.4: The system shall display featured dishes on the home page.

3. **Order Processing Requirements**
   - FR3.1: The system shall allow users to select menu items and place orders.
   - FR3.2: The system shall generate a unique order number for each order.
   - FR3.3: The system shall provide order confirmation with estimated pickup time.
   - FR3.4: The system shall display current orders with status information.
   - FR3.5: The system shall provide payment instructions for the "pay on pickup" option.
   - FR3.6: The system shall allow users to track their order history.

4. **Data Management Requirements**
   - FR4.1: The system shall store menu items, orders, user messages, and admin credentials in localStorage.
   - FR4.2: The system shall maintain statistical data on customers served and orders submitted.
   - FR4.3: The system shall allow configuration of multiple admin credentials.

5. **Administration Requirements**
   - FR5.1: The system shall provide a secure login for administrators.
   - FR5.2: The system shall support multiple admin users with different credentials.
   - FR5.3: The system shall allow admins to manage menu items and view orders.
   - FR5.4: The system shall provide configuration options for admin credentials.

### 3.2 Non-Functional Requirements

1. **Performance Requirements**
   - NFR1.1: The system shall load pages within 3 seconds on standard broadband connections.
   - NFR1.2: The system shall support at least 100 concurrent users.
   - NFR1.3: The system shall update gamified statistics at varied intervals for a more natural feel.

2. **Usability Requirements**
   - NFR2.1: The system shall be usable by first-time visitors without training.
   - NFR2.2: The system shall follow web accessibility guidelines (WCAG 2.1 Level AA).
   - NFR2.3: The system shall maintain consistent navigation patterns across all pages.

3. **Reliability Requirements**
   - NFR3.1: The system shall function in all major browsers (Chrome, Firefox, Safari, Edge).
   - NFR3.2: The system shall gracefully handle network interruptions by storing data locally.
   - NFR3.3: The system shall provide error messages for failed operations.

4. **Security Requirements**
   - NFR4.1: The system shall sanitize all user inputs to prevent XSS attacks.
   - NFR4.2: The system shall implement password hashing for administrator accounts.
   - NFR4.3: The system shall not store sensitive customer information.

5. **Maintainability Requirements**
   - NFR5.1: The system shall use modular code structure for easy updates.
   - NFR5.2: The system shall be well-documented for future development.
   - NFR5.3: The system shall support easy customization of menu items and styling.

## 4. System Architecture

### 4.1 Architecture Overview

The Campus Cafe System uses a client-side architecture with the following components:

1. **Presentation Layer**: HTML and CSS responsible for UI rendering
2. **Application Layer**: JavaScript modules handling business logic
3. **Data Layer**: LocalStorage-based data persistence

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
| Home Page | index.html, js/main.js | Main landing page displaying featured dishes |
| Menu Page | menu.html, js/menu.js | Browse, search, and filter food items |
| About Page | about.html | Information about the cafe history and team |
| Contact Page | contact.html, js/contact.js | Contact form and information |
| My Orders Page | my-orders.html, js/my-orders.js | View and manage order history |
| Order Details Page | order-details.html, js/order-details.js | View detailed order information |
| Cart Page | cart.html, js/cart.js | View cart and checkout |
| Storage Manager | js/utils/storage.js | Data persistence using localStorage |
| Auth Manager | js/utils/auth.js | Authentication and user management |
| Cart Manager | js/utils/storage.js | Cart operations |
| Stats Manager | js/utils/stats.js | Manages statistical counters |
| Config Manager | js/utils/config.js | Configuration settings and admin credentials |
| Theme Manager | js/utils/theme.js | Handles light/dark mode switching |
| Stylesheets | css/styles.css, css/admin.css | Styling for the application |

### 5.2 Data Models

#### 5.2.1 Menu Item Model
```javascript
{
    id: String,               // Unique identifier
    name: String,             // Item name
    price: Number,            // Price in Kenyan Shillings
    category: String,         // Category (breakfast, lunch, snacks, drinks)
    description: String,      // Description text
    ingredients: Array,       // List of ingredients
    imageUrl: String,         // URL to item image
    featured: Boolean         // Whether item is featured on home page
}
```

#### 5.2.2 Order Model
```javascript
{
    id: String,               // Unique order number
    item: Object,             // Menu item object
    quantity: Number,         // Quantity ordered
    status: String,           // Order status (pending, ready, completed, cancelled)
    orderTime: String,        // ISO date string of order time
    estimatedPickupTime: String, // ISO date string of estimated pickup
    paymentMethod: String,    // Payment method (cash, mpesa, card, etc.)
    paymentStatus: String,    // Payment status (pending, processed, failed)
    notes: String             // Customer notes for the order
}
```

#### 5.2.3 User Model (Admin)
```javascript
{
    email: String,            // Admin email address
    passwordHash: String      // Hashed password
}
```

#### 5.2.4 Stats Model
```javascript
{
    customersServedToday: Number,  // Customers served today counter
    customersEverServed: Number,   // Total customers served counter
    ordersSubmitted: Number,       // Total orders submitted counter
    lastResetDate: String,         // Date when daily counter was last reset
    lastUpdateTime: Number         // Timestamp of last update
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

### 7.1 Gamified Statistics System

The Campus Cafe System implements a gamified statistics feature that displays dynamic counters for:
- Customers served today
- Total customers served since opening
- Total orders submitted

Key implementation details:
- Statistics start with predetermined baseline values (38, 18540, 22098)
- Counters automatically increase at different intervals to create a more engaging experience
- Daily counter resets at the start of each new day
- Increment rates slow down as values approach maximum thresholds
- Animations add visual appeal when values change
- System tracks statistics across user sessions using localStorage
- Both automatic increments and real order completion events affect counters

The statistics system enhances user engagement by providing a sense of community and popularity, showing that the cafe is actively serving customers.

### 7.2 Multiple Admin Credentials System

The Campus Cafe System supports multiple admin users with:

- Admin credential storage in a secure configuration
- Environment variables control system behavior
- Password hashing for enhanced security
- Development mode toggle for easier configuration during development
- Configuration page for adding, updating, and removing admin credentials

The multi-admin system allows different cafe staff members to have their own login credentials with the same level of access to the administrative functions.

### 7.3 Payment Instructions System

The payment system includes:

- Clear instructions for the "pay on pickup" option
- Integration with the Campus Cafe paybill system
- Display of auto-generated order numbers for payment reference
- Support for different payment methods (cash, M-Pesa, card, etc.)
- Payment status tracking in the order management system

This feature enhances the user experience by providing clear instructions on how to complete payment for their orders.

## 8. Database Schema

Since the application uses localStorage for data persistence instead of a traditional database, the schema is represented by the JavaScript objects stored in localStorage:

### 8.1 Storage Keys

| Key | Description |
|-----|-------------|
| campus_cafe_menu_items | Array of menu items |
| campus_cafe_orders | Array of customer orders |
| campus_cafe_users | Array of admin users |
| campus_cafe_stats | Statistics object |
| campus_cafe_cart | Current user's cart |
| campus_cafe_user | Currently logged-in admin |
| campus_cafe_token | Authentication token |
| campus_cafe_last_visit | Timestamp of last visit |

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

- Web server (Apache, Nginx, or any static file server)
- No database required (uses localStorage)
- No server-side language required
- Modern browsers (Chrome, Firefox, Safari, Edge)

### 9.2 Installation Steps

1. Copy all files to the web server's public directory
2. No configuration files or environment setup needed
3. Access the application through a web browser

### 9.3 Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 80+ | Full compatibility |
| Firefox | 75+ | Full compatibility |
| Safari | 13.1+ | Full compatibility |
| Edge | 80+ | Full compatibility |
| Opera | 67+ | Full compatibility |
| Mobile Chrome | 80+ | Fully responsive |
| Mobile Safari | 13.4+ | Fully responsive |

## 10. Future Improvements

### 10.1 Short-term Improvements

- Push notifications for order status updates
- Email confirmations for orders
- More detailed admin analytics dashboard
- Additional payment gateway integrations
- QR code generation for orders

### 10.2 Long-term Vision

- Backend server implementation for true persistence
- User account system with login and order history
- Real-time order tracking with WebSocket integration
- Mobile application for both customers and administrators
- Integration with university ID/payment systems

## 11. Appendix

### 11.1 Glossary

| Term | Definition |
|------|------------|
| KSh | Kenyan Shilling, the local currency |
| Paybill | Payment system commonly used in Kenya for mobile money transfers |
| M-Pesa | Popular mobile money transfer service in Kenya |
| localStorage | Web API that allows storage of key-value pairs in a web browser |

### 11.2 References

- HTML5 Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- CSS Flexbox Layout: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout
- JavaScript Modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules 