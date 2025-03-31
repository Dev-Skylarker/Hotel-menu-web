# Campus Cafe System

<div align="center">
  <img src="assets/logo.png" alt="Campus Cafe Logo" width="200">
  <p><em>A comprehensive digital ordering platform for university food services</em></p>
</div>

## 📋 Table of Contents
- [Overview](#-overview)
- [Authors](#-authors)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Key Components](#-key-components)
- [Usage Guide](#-usage-guide)
- [Customization](#-customization)
- [Future Development](#-future-development)
- [License](#-license)

## 📝 Overview

The Campus Cafe System is a responsive web application designed for university food services. It provides digital menu management, online ordering capabilities, and customer engagement tools with real-time statistics. Built with modern web technologies, the system offers an intuitive interface with theme options and comprehensive administration features.

## 👥 Authors

<table>
  <tr>
    <th>Name</th>
    <th>Student ID</th>
  </tr>
  <tr>
    <td>ERIC MAINA</td>
    <td>B135/25514/2023</td>
  </tr>
  <tr>
    <td>ROY MBECHE</td>
    <td>B135/25628/2023</td>
  </tr>
  <tr>
    <td>DERRICK MAINA</td>
    <td>B135/25499/2023</td>
  </tr>
  <tr>
    <td>KIPKOGEI FORTUNE</td>
    <td>B135/25608/2023</td>
  </tr>
  <tr>
    <td>BARASA JUMA JAMIL</td>
    <td>B135/25617/2023</td>
  </tr>
</table>

## ✨ Features

<table>
  <tr>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/responsive.png" width="50" height="50" alt="Responsive"><br>
      <b>Responsive Design</b><br>
      <small>Optimized for all device sizes</small>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/restaurant-menu.png" width="50" height="50" alt="Menu"><br>
      <b>Interactive Menu</b><br>
      <small>Browse and filter by category</small>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/shopping-cart.png" width="50" height="50" alt="Cart"><br>
      <b>Online Ordering</b><br>
      <small>Place orders with tracking</small>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/combo-chart.png" width="50" height="50" alt="Statistics"><br>
      <b>Live Statistics</b><br>
      <small>Customer and order metrics</small>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/admin-settings-male.png" width="50" height="50" alt="Admin"><br>
      <b>Multi-Admin</b><br>
      <small>Multiple admin credentials</small>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/day-and-night.png" width="50" height="50" alt="Theme"><br>
      <b>Theme Options</b><br>
      <small>Light and dark mode support</small>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/kenya-shilling.png" width="50" height="50" alt="KSh"><br>
      <b>Kenyan Currency</b><br>
      <small>Pricing in KSh</small>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/mobile-payment.png" width="50" height="50" alt="Payment"><br>
      <b>Payment System</b><br>
      <small>Comprehensive instructions</small>
    </td>
    <td width="33%" align="center">
      <img src="https://img.icons8.com/ios/50/offline.png" width="50" height="50" alt="Offline"><br>
      <b>Offline Support</b><br>
      <small>Works without internet</small>
    </td>
  </tr>
</table>

## 🏛 System Architecture

### Component Architecture
```
┌─────────────────────────────────────────────────┐
│                 Client Browser                   │
├─────────────┬─────────────────┬─────────────────┤
│ Presentation│   Application   │      Data       │
│    Layer    │      Layer      │     Layer       │
│  (HTML/CSS) │   (JavaScript)  │  (LocalStorage) │
└─────────────┴─────────────────┴─────────────────┘
```

### User Flow Diagram
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Home   │────►│   Menu   │────►│   Cart   │────►│ Checkout │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                  │
                      ▼                                  ▼
                ┌──────────┐                      ┌──────────┐
                │   Item   │                      │  Order   │
                │ Details  │                      │ Tracking │
                └──────────┘                      └──────────┘
```

## 🧰 Technology Stack

<table>
  <tr>
    <th>Category</th>
    <th>Technologies</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>HTML5, CSS3, JavaScript (ES6+)</td>
    <td>Core application development</td>
  </tr>
  <tr>
    <td>Storage</td>
    <td>Browser LocalStorage API</td>
    <td>Data persistence without server</td>
  </tr>
  <tr>
    <td>UI Framework</td>
    <td>Custom CSS with Flexbox/Grid</td>
    <td>Responsive and adaptive layouts</td>
  </tr>
  <tr>
    <td>Icons</td>
    <td>Font Awesome 6.4.0</td>
    <td>Visual interface elements</td>
  </tr>
  <tr>
    <td>Images</td>
    <td>Optimized JPG/PNG</td>
    <td>Food presentation and branding</td>
  </tr>
</table>

## 📁 Project Structure

```
campus-cafe-system/
├── index.html              # Home page
├── menu.html               # Menu listings
├── about.html              # About page
├── contact.html            # Contact page
├── cart.html               # Shopping cart
├── my-orders.html          # Order tracking
├── order-details.html      # Order view
├── docs/                   # Documentation
│   └── Campus_Cafe_Documentation.md # Comprehensive documentation
├── admin/                  # Admin interface
│   ├── login.html          # Admin login
│   ├── dashboard.html      # Admin dashboard
│   └── config.html         # Admin configuration
├── css/                    # Stylesheets
│   ├── styles.css          # Main styles
│   └── admin.css           # Admin styles
├── js/                     # Scripts
│   ├── main.js             # Core functionality
│   ├── menu.js             # Menu functionality
│   ├── cart.js             # Cart operations
│   ├── my-orders.js        # Order tracking
│   ├── order-details.js    # Order details
│   ├── admin/              # Admin scripts
│   │   ├── login.js        # Authentication
│   │   ├── dashboard.js    # Dashboard functionality
│   │   └── config-manager.js # Configuration management
│   └── utils/              # Utilities
│       ├── storage.js      # Storage management
│       ├── auth.js         # Authentication
│       ├── config.js       # Configuration settings
│       ├── stats.js        # Statistics management
│       └── theme.js        # Theme switching
└── assets/                 # Media files
    ├── logo.png            # Campus Cafe logo
    └── images/             # Menu item images
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage access

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/campus-cafe-system.git
   ```

2. **Navigate to the project folder**:
   ```bash
   cd campus-cafe-system
   ```

3. **Open the application**:
   - Open `index.html` in your browser, or
   - Use a local development server:
     ```bash
     # If you have Python installed
     python -m http.server
     # Or with Node.js
     npx serve
     ```

4. **Admin Access**:
   - Navigate to `admin/login.html`
   - Use default credentials:
     - Email: `admin@campuscafe.com`
     - Password: `admin123`

## 🔍 Key Components

### Dynamic Statistics System

<table>
  <tr>
    <th>Feature</th>
    <th>Implementation</th>
    <th>File Location</th>
  </tr>
  <tr>
    <td>Statistical Counters</td>
    <td>Real-time metrics with automatic increments</td>
    <td>js/utils/stats.js</td>
  </tr>
  <tr>
    <td>Time-Based Updates</td>
    <td>Varied refresh rates between 30-60 seconds</td>
    <td>js/utils/stats.js</td>
  </tr>
  <tr>
    <td>Daily Reset</td>
    <td>Automatic reset of daily counters at midnight</td>
    <td>js/utils/stats.js</td>
  </tr>
  <tr>
    <td>Value Capping</td>
    <td>Maximum thresholds with rate adjustments</td>
    <td>js/utils/stats.js</td>
  </tr>
  <tr>
    <td>Offline Persistence</td>
    <td>LocalStorage-based data retention</td>
    <td>js/utils/storage.js</td>
  </tr>
</table>

### Theme Management System

<table>
  <tr>
    <th>Feature</th>
    <th>Implementation</th>
    <th>File Location</th>
  </tr>
  <tr>
    <td>Theme Toggle</td>
    <td>Interactive button with icon change</td>
    <td>js/utils/theme.js</td>
  </tr>
  <tr>
    <td>Theme Persistence</td>
    <td>LocalStorage-based preference saving</td>
    <td>js/utils/theme.js</td>
  </tr>
  <tr>
    <td>System Preference</td>
    <td>Detection of OS-level dark/light setting</td>
    <td>js/utils/theme.js</td>
  </tr>
  <tr>
    <td>Flicker Prevention</td>
    <td>Immediate theme application on page load</td>
    <td>js/utils/theme.js</td>
  </tr>
</table>

### Order Management System

<table>
  <tr>
    <th>Feature</th>
    <th>Implementation</th>
    <th>File Location</th>
  </tr>
  <tr>
    <td>Order Creation</td>
    <td>Conversion of cart items to orders</td>
    <td>js/cart.js</td>
  </tr>
  <tr>
    <td>Order Tracking</td>
    <td>Status monitoring through my-orders page</td>
    <td>js/my-orders.js</td>
  </tr>
  <tr>
    <td>Order Details</td>
    <td>Comprehensive view of individual orders</td>
    <td>js/order-details.js</td>
  </tr>
  <tr>
    <td>Payment Instructions</td>
    <td>Clear paybill information and references</td>
    <td>js/cart.js</td>
  </tr>
</table>

## 📖 Usage Guide

<table>
  <tr>
    <th>Task</th>
    <th>User Action</th>
    <th>System Response</th>
  </tr>
  <tr>
    <td>Browse Menu</td>
    <td>Click "Menu" in the navigation bar</td>
    <td>Displays categorized menu items with images</td>
  </tr>
  <tr>
    <td>Filter Items</td>
    <td>Select a category tab on the menu page</td>
    <td>Shows only items matching the selected category</td>
  </tr>
  <tr>
    <td>Search Items</td>
    <td>Enter text in the search box on the menu page</td>
    <td>Displays items matching the search term</td>
  </tr>
  <tr>
    <td>Add to Cart</td>
    <td>Click "Add to Cart" on a menu item</td>
    <td>Item added to cart, badge counter updated</td>
  </tr>
  <tr>
    <td>Place Order</td>
    <td>Click "Checkout" in the cart, fill form, click "Place Order"</td>
    <td>Order created, payment instructions displayed</td>
  </tr>
  <tr>
    <td>Track Order</td>
    <td>Navigate to "My Orders" page</td>
    <td>Shows all orders with status information</td>
  </tr>
  <tr>
    <td>Switch Theme</td>
    <td>Click moon/sun icon in navigation</td>
    <td>Toggles between light and dark mode</td>
  </tr>
</table>

## ⚙️ Customization

<table>
  <tr>
    <th>Element</th>
    <th>Customization Method</th>
    <th>File Location</th>
  </tr>
  <tr>
    <td>Menu Items</td>
    <td>Edit <code>getDefaultMenuItems()</code> function</td>
    <td>js/utils/storage.js</td>
  </tr>
  <tr>
    <td>Admin Credentials</td>
    <td>Modify <code>ENV.adminCredentials</code> array</td>
    <td>js/utils/config.js</td>
  </tr>
  <tr>
    <td>Theme Colors</td>
    <td>Update CSS variables in <code>:root</code> selector</td>
    <td>css/styles.css</td>
  </tr>
  <tr>
    <td>Statistics Parameters</td>
    <td>Adjust constants in <code>stats.js</code></td>
    <td>js/utils/stats.js</td>
  </tr>
  <tr>
    <td>Discount Rules</td>
    <td>Modify <code>applyDiscount()</code> function</td>
    <td>js/utils/storage.js</td>
  </tr>
</table>

## 🔮 Future Development

<table>
  <tr>
    <th>Feature</th>
    <th>Description</th>
    <th>Priority</th>
  </tr>
  <tr>
    <td>Backend Integration</td>
    <td>Database persistence and server-side processing</td>
    <td>High</td>
  </tr>
  <tr>
    <td>User Accounts</td>
    <td>Registration, login, and profile management</td>
    <td>Medium</td>
  </tr>
  <tr>
    <td>Online Payment</td>
    <td>Integration with payment processing platforms</td>
    <td>Medium</td>
  </tr>
  <tr>
    <td>Mobile Application</td>
    <td>Native apps for iOS and Android platforms</td>
    <td>Low</td>
  </tr>
  <tr>
    <td>Advanced Analytics</td>
    <td>Detailed reports and business intelligence</td>
    <td>Low</td>
  </tr>
</table>

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>Made with ❤️ by the Campus Cafe Team</p>
  <p>
    <a href="https://github.com/yourusername/campus-cafe-system">GitHub</a> •
    <a href="docs/Campus_Cafe_Documentation.md">Documentation</a>
  </p>
</div>#   H o t e l - m e n u - w e b  
 