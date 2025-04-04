# **Campus Cafe System**  

## **Table of Contents**  
- [Overview](#overview)  
- [Authors](#authors)  
- [Features](#features)  
- [System Architecture](#system-architecture)  
- [Technology Stack](#technology-stack)  
- [Project Structure](#project-structure)  
- [Getting Started](#getting-started)  
- [Key Components](#key-components)  
- [Usage Guide](#usage-guide)  
- [Customization](#customization)  
- [Recent Updates](#recent-updates)
- [Future Development](#future-development)  
- [License](#license)  

---

## **Overview**  

The **Campus Cafe System** is a web-based platform designed to streamline food ordering and management for modern cafeteria. It features an interactive digital menu, online ordering, real-time tracking, and an admin dashboard for efficient operations. The system enhances the dining experience by providing seamless order processing, data-driven insights, and theme customization options.  

---

## **Authors**  

| Name                 |
|---------------------|
| Dev, Maina Eric    |
| Dev, Roy Mbeche     |
| Dev, Derrick Maina  |
| Dev, Kipkogei Fortune |
| Dev, Barasa Juma Jamil |

---

## **Features**  

- **Responsive Design** – Optimized for desktops, tablets, and mobile devices.  
- **Interactive Menu** – Browse and filter menu items by category.  
- **Online Ordering** – Add items to cart and place orders with tracking.  
- **User Accounts** – Registration, login, and personalized profiles.
- **Order Statistics** – Track order history and spending patterns.
- **Real-time Statistics** – Provides customer and order insights.  
- **Multi-Admin Access** – Supports multiple administrator accounts.  
- **Theme Customization** – Offers light and dark mode switching.  
- **Kenyan Currency Support** – Prices displayed in KSh.  
- **Payment Integration** – Clear payment instructions for transactions.  
- **Offline Support** – Works without an internet connection for browsing and order tracking.  

---

## **System Architecture**  

### **Component Structure**  

```
┌─────────────────────────────────────────────────┐
│                 Client Browser                  │
├─────────────┬─────────────────┬────────────────┤
│ Presentation│   Application    │      Data      │
│    Layer    │      Layer       │     Layer      │
│  (HTML/CSS) │   (JavaScript)   │  (LocalStorage)│
└─────────────┴─────────────────┴────────────────┘
```

### **User Flow**  

```
[Home] → [Menu] → [Cart] → [Checkout]  
         │               │  
         ↓               ↓  
      [Item Details]   [Order Tracking]  
                          ↓
                      [My Account]
```

---

## **Technology Stack**  

| Category      | Technologies Used                 | Purpose                                  |  
|--------------|----------------------------------|------------------------------------------|  
| Frontend     | HTML5, CSS3, JavaScript (ES6+)  | Core application structure and styling  |  
| Storage      | Browser LocalStorage API        | Data persistence without a server       |  
| UI Framework | Custom CSS (Flexbox/Grid)       | Responsive layouts                      |  
| Icons        | Font Awesome 6.4.0              | User interface elements                 |  
| Images       | Optimized JPG/PNG               | Food presentation and branding          |  

---

## **Project Structure**  

```
campus-cafe-system/  
├── index.html               # Home page  
├── menu.html                # Menu listings  
├── cart.html                # Shopping cart  
├── my-orders.html           # Order tracking  
├── account.html             # User profile
├── login.html               # User login
├── register.html            # User registration
├── welcome.html             # Welcome page
├── admin/                   # Admin interface  
│   ├── login.html           # Admin login  
│   ├── dashboard.html       # Admin dashboard  
│   └── config.html          # Admin settings  
├── css/                     # Stylesheets  
│   ├── styles.css           # Main styles  
│   └── admin.css            # Admin panel styles  
├── js/                      # Scripts  
│   ├── main.js              # Core functionality  
│   ├── menu.js              # Menu handling  
│   ├── cart.js              # Cart operations  
│   ├── my-orders.js         # Order tracking  
│   ├── account.js           # User profile management
│   ├── login.js             # Authentication handling
│   ├── register.js          # User registration
│   ├── welcome.js           # Welcome page functionality
│   ├── utils/               # Utility scripts  
│       ├── storage.js       # Data persistence  
│       ├── auth.js          # Authentication handling  
│       ├── initialize-db.js # Database initialization
│       ├── env.js           # Environment variables
│       ├── notifications.js # Toast notifications
│       ├── currency.js      # Currency formatting
│       ├── stats.js         # Live statistics tracking  
│       └── theme.js         # Theme switching  
└── assets/                  # Media files  
    ├── logo.png             # Application logo  
    └── images/              # Food menu images  
```

---

## **Getting Started**  

### **Prerequisites**  
- A modern web browser (Chrome, Firefox, Safari, Edge)  
- JavaScript enabled  

### **Installation**  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/campus-cafe-system.git
   ```  

2. **Navigate to the project folder**  
   ```bash
   cd campus-cafe-system
   ```  

3. **Open the application**  
   - Open `welcome.html` in your browser  
   - OR start a local server:  
     ```bash
     python -m http.server  # Using Python  
     npx serve              # Using Node.js  
     ```  

4. **Default User Accounts**
   - Regular User:
     - Email: user@test.gmail.com
     - Password: password
   
   - Admin User:
     - Email: erickaris0521@gmail.com
     - Password: Project123

---

## **Key Components**  

### **User Account System**

| Feature               | Functionality                                       | File Location               |  
|----------------------|---------------------------------------------------|----------------------------|  
| User Registration    | Create new accounts with email, password, and admission number | `register.html`, `js/register.js` |
| User Login           | Authenticate with email and password                | `login.html`, `js/login.js` |
| User Profile         | View and manage account information                 | `account.html`, `js/account.js` |
| Order Statistics     | Track total orders, completed orders, total spent, and favorite food category | `js/account.js` |

### **Order Management System**

| Feature               | Functionality                                       | File Location               |  
|----------------------|---------------------------------------------------|----------------------------|  
| Order Tracking       | View pending and completed orders                  | `my-orders.html`, `js/my-orders.js` |
| Order Status Updates | Mark orders as collected when ready                | `js/my-orders.js`          |
| Auto-Refresh         | Automatically updates order status every 10 seconds| `js/my-orders.js`          |
| Empty State Handling | Shows clear options when no pending orders exist   | `js/my-orders.js`          |
| Past Orders View     | Access to order history                            | `js/my-orders.js`          |

### **Dynamic Statistics**  

| Feature            | Functionality                                   | File Location            |  
|-------------------|-----------------------------------------------|-------------------------|  
| Statistical Counters | Displays real-time order and user metrics    | `js/utils/stats.js`    |  
| Auto Refresh      | Updates statistics every 30-60 seconds        | `js/utils/stats.js`    |  
| Daily Reset       | Resets data at midnight                       | `js/utils/stats.js`    |  
| Offline Storage   | Retains data even without internet            | `js/utils/storage.js`  |  

### **Theme Management**  

| Feature            | Functionality                                | File Location          |  
|-------------------|--------------------------------------------|-----------------------|  
| Theme Toggle     | Switch between light and dark mode         | `js/utils/theme.js`  |  
| Auto Detection   | Adjusts theme based on OS preferences      | `js/utils/theme.js`  |  
| Persistent Theme | Saves user preference                      | `js/utils/theme.js`  |  

---

## **Usage Guide**  

| Task                 | Action                                   | System Response                        |  
|---------------------|--------------------------------------|--------------------------------------|  
| Create Account      | Click "Register" on welcome page     | Creates a new user account           |
| Login               | Enter credentials on login page      | Authenticates and redirects to home  |
| View Profile        | Click on account page               | Displays user info and statistics    |
| Browse Menu         | Click "Menu" on the homepage         | Displays all available food items    |  
| Add to Cart         | Click "Add to Cart" on an item       | Item is added, cart count updates    |  
| Place Order         | Click "Checkout" and confirm order   | Order is processed for tracking      |  
| Track Order         | Visit "My Orders" page               | Displays all pending orders          |  
| Mark as Collected   | Click "Mark as Collected" button     | Updates order status to completed    |  
| View Past Orders    | Click "View Past Orders" button      | Shows history of completed orders    |  
| Change Theme        | Click the theme toggle button        | Switches between light and dark mode |  
| Logout              | Click "Logout" button in account     | Ends session and returns to welcome  |

---

## **Recent Updates**

### **User Profile Enhancement (June 2024)**

A comprehensive user profile system has been implemented, featuring:

- **User Registration**: New users can create accounts with full name, email, admission number, and secure password
- **Profile Dashboard**: Users can view their account information including registration date
- **Order Statistics**: The profile page displays statistics including:
  - Total number of orders placed
  - Number of completed orders
  - Total amount spent at the cafe
  - Favorite food category based on order history
- **Enhanced Order Association**: Orders are now properly linked to user accounts for better tracking
- **Personalized Experience**: The system remembers user details for checkout

### **My Orders Page Enhancement (May 2024)**

A significant update has been made to the My Orders page, enhancing the user experience with:

- **Clear Status Display**: The page now shows "No Pending Orders" when appropriate with prominent buttons to View Menu or View Cart
- **Improved Navigation**: Added intuitive action buttons with icons for better visual guidance
- **Order Collection Flow**: Added ability for users to mark orders as collected when ready
- **Real-time Updates**: Orders refresh automatically every 10 seconds to show current status
- **Past Orders Access**: Users can view their order history with a dedicated button
- **Admission Number Tracking**: Better handling of student admission numbers for order identification
- **Collection Instructions**: Clear messaging about bringing payment confirmation when collecting orders
- **Enhanced Error Handling**: Better validation of inputs and improved error messages

These updates make the ordering process more streamlined and user-friendly, with clear instructions at each step of the process.

---

## **Customization**  

| Element       | Customization Method                 | File Location         |  
|--------------|--------------------------------------|----------------------|  
| Menu Items   | Modify `getDefaultMenuItems()` function | `js/utils/storage.js` |  
| User Accounts | Edit values in `initialize-db.js`    | `js/utils/initialize-db.js` |
| Order Limits | Adjust values in `config.js`        | `js/utils/config.js`  |  
| Theme Colors | Edit CSS variables                  | `css/styles.css`      |  

---

## **Future Development**  

- **Enhanced User Profiles** – More customization options and favorites
- **Reward System** – Points and loyalty for regular customers
- **Discounts & Coupons** – Promotional offers  
- **M-Pesa Payment Integration** – Seamless mobile payments  
- **Kitchen Management** – Real-time order preparation interface

---

## **License**  

This project is licensed under [MIT License](LICENSE).  

## **Setup for Development**

1. Clone the repository:
```bash
git clone https://github.com/yourusername/campus-cafe-system.git
```

2. Create the credential files (these are git-ignored for security):

Copy the example files:
```bash
cp js/utils/example-credentials.js js/utils/credentials.js
cp js/utils/example-env.js js/utils/env.js
```

Then edit `js/utils/credentials.js` with your admin credentials:
```javascript
const secureCredentials = {
    adminUsers: [
        { 
            email: 'Erickaris0521@gmail.com', 
            passwordHash: '********' // Password hash is hidden for security
        }
    ]
};
```

And edit `js/utils/env.js` for your environment:
```javascript
const envConfig = {
    // Set to false for production mode
    development: false,
    
    // Other environment configurations
    apiEndpoint: 'https://your-api-endpoint.com',
    
    // If you're using external payment processing
    mpesaBusinessCode: '247247'
};
```

3. Open `index.html` in your browser or use a local server.

## **Deployment to Vercel**

1. Make sure your changes are committed to Git:
```bash
git add .
git commit -m "Your commit message"
```

2. Update the credentials and environment configuration for production:
   - In `js/utils/env.js`, set `development: false`
   - Make sure all API keys and sensitive data are properly secured

3. Deploy to Vercel:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## **Making Updates**

After making changes to the codebase:

1. Test your changes locally
2. Commit changes to Git:
```bash
git add .
git commit -m "Description of changes"
```

3. Push to GitHub:
```bash
git push origin main
```

4. Deploy the updated version to Vercel:
```bash
vercel --prod
```

## **Security Notes**

- Admin credentials are stored in a git-ignored file for security
- The password handling is simplified for this project (not suitable for real production)
- For a true production environment, implement server-side authentication

## **Admin Access**

To access the admin panel:
1. Click the "Admin Login" button in the footer
2. Enter the admin email and password:
   - Primary Admin (Superadmin): 
     - Email: `senioradmin's email`
     - Password: `********` (Provided separately to authorized administrators)
   - Default Admin:
     - Email: `manage@campuscafe`
     - Password: `********` (Provided separately to authorized administrators)

**Note:** The superadmin can add additional admin users from the admin dashboard. All admin accounts are stored securely and are not tracked in version control.
