/**
 * Supabase Client Integration for Campus Cafe
 * Handles authentication, storage, and database operations
 */

const supabaseClient = {
    createClient: function(url, key) {
        console.log('Creating Supabase client with:', url, key);
        return {
            auth: {
                signUp: async function(options) {
                    console.log('Sign up called with:', options);
                    return {
                        data: { user: { email: options.email, user_metadata: options.options.data } },
                        error: null
                    };
                },
                signInWithPassword: async function(credentials) {
                    console.log('Sign in called with:', credentials);
                    return {
                        data: { user: { email: credentials.email } },
                        error: null
                    };
                },
                signOut: async function() {
                    console.log('Sign out called');
                    return { error: null };
                },
                getSession: async function() {
                    const user = localStorage.getItem('campus_cafe_user');
                    if (user) {
                        return {
                            data: { session: { user: JSON.parse(user) } },
                            error: null
                        };
                    }
                    return { data: { session: null }, error: null };
                },
                getUser: async function() {
                    const user = localStorage.getItem('campus_cafe_user');
                    if (user) {
                        return {
                            data: { user: JSON.parse(user) },
                            error: null
                        };
                    }
                    return { data: { user: null }, error: null };
                }
            },
            from: function(table) {
                return {
                    select: function(columns) {
                        return {
                            eq: function(field, value) {
                                return {
                                    single: async function() {
                                        console.log(`Query ${table} where ${field} = ${value}`);
                                        return { data: {}, error: null };
                                    }
                                };
                            }
                        };
                    },
                    insert: function(data) {
                        return {
                            select: async function() {
                                console.log(`Insert into ${table}:`, data);
                                return { data, error: null };
                            }
                        };
                    }
                };
            }
        };
    }
};

// Supabase Manager to handle all Supabase operations
const supabaseManager = (function() {
    let supabase = null;
    
    /**
     * Initialize Supabase client
     * @returns {boolean} - Success status
     */
    function initSupabase() {
        try {
            // Check if ENV configuration exists
            if (!window.ENV || !window.ENV.supabase || !window.ENV.supabase.url || !window.ENV.supabase.anonKey) {
                console.error('Supabase configuration is missing in ENV');
                return false;
            }
            
            // Check if the Supabase client library is available
            if (typeof supabaseClient !== 'undefined') {
                console.log('Using custom Supabase mock client');
                supabase = supabaseClient.createClient(
                    window.ENV.supabase.url,
                    window.ENV.supabase.anonKey
                );
            } else if (typeof window.supabase !== 'undefined') {
                console.log('Using global Supabase client');
                supabase = window.supabase;
            } else if (typeof window.createClient !== 'undefined') {
                console.log('Using createClient from window');
                supabase = window.createClient(
                    window.ENV.supabase.url,
                    window.ENV.supabase.anonKey
                );
            } else if (typeof window.supabaseJs !== 'undefined') {
                console.log('Using supabaseJs from window');
                supabase = window.supabaseJs.createClient(
                    window.ENV.supabase.url,
                    window.ENV.supabase.anonKey
                );
            } else {
                // Initialize using the official Supabase client
                try {
                    console.log('Using official Supabase JS client');
                    supabase = window.supabase.createClient(
                        window.ENV.supabase.url,
                        window.ENV.supabase.anonKey
                    );
                } catch (clientError) {
                    console.error('Error initializing official Supabase client:', clientError);
                    
                    // If offline mode is enabled, allow using localStorage
                    if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                        console.warn('Falling back to localStorage in offline mode');
                        supabase = createFallbackClient();
                        return true;
                    }
                    
                    return false;
                }
            }
            
            console.log('Supabase client initialized successfully:', 
                      { url: window.ENV.supabase.url.substring(0, 16) + '...' });
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            
            // If offline mode is enabled, allow using localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                console.warn('Falling back to localStorage in offline mode');
                supabase = createFallbackClient();
                return true;
            }
            
            return false;
        }
    }
    
    /**
     * Create a fallback client for offline mode
     * @returns {Object} - Mock Supabase client
     */
    function createFallbackClient() {
        console.log('Creating fallback client for offline mode');
        return {
            auth: {
                signUp: async function(options) {
                    console.log('Sign up called with:', options);
                    return {
                        data: { user: { email: options.email, user_metadata: options.options.data } },
                        error: null
                    };
                },
                signInWithPassword: async function(credentials) {
                    console.log('Sign in called with:', credentials);
                    return {
                        data: { user: { email: credentials.email } },
                        error: null
                    };
                },
                signOut: async function() {
                    console.log('Sign out called');
                    return { error: null };
                },
                getSession: async function() {
                    const user = localStorage.getItem('campus_cafe_user');
                    if (user) {
                        return {
                            data: { session: { user: JSON.parse(user) } },
                            error: null
                        };
                    }
                    return { data: { session: null }, error: null };
                },
                getUser: async function() {
                    const user = localStorage.getItem('campus_cafe_user');
                    if (user) {
                        return {
                            data: { user: JSON.parse(user) },
                            error: null
                        };
                    }
                    return { data: { user: null }, error: null };
                }
            },
            from: function(table) {
                return {
                    select: function(columns) {
                        return {
                            eq: function(field, value) {
                                return {
                                    single: async function() {
                                        console.log(`Query ${table} where ${field} = ${value}`);
                                        return { data: {}, error: null };
                                    }
                                };
                            }
                        };
                    },
                    insert: function(data) {
                        return {
                            select: async function() {
                                console.log(`Insert into ${table}:`, data);
                                return { data, error: null };
                            }
                        };
                    }
                };
            }
        };
    }
    
    /**
     * Sign up a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {Object} metadata - User metadata (e.g., admissionNumber, name)
     * @returns {Promise<Object>} - Sign up result
     */
    async function signUp(email, password, metadata = {}) {
        if (!supabase) {
            if (!initSupabase()) {
                return { error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });
            
            if (error) throw error;
            
            // Store in localStorage for offline mode and fallback
            const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
            users.push({
                email,
                password,
                ...metadata,
                registeredAt: new Date().toISOString()
            });
            localStorage.setItem('campus_cafe_users', JSON.stringify(users));
            
            console.log('User registered successfully:', email);
            return { data, error: null };
        } catch (error) {
            console.error('Sign up failed:', error);
            
            // In offline mode, still try to create the user locally
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
                
                // Check if user already exists
                if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                    return { data: null, error: { message: 'User already exists' } };
                }
                
                users.push({
                    email,
                    password,
                    ...metadata,
                    registeredAt: new Date().toISOString()
                });
                localStorage.setItem('campus_cafe_users', JSON.stringify(users));
                
                console.log('User registered in offline mode:', email);
                return { 
                    data: { 
                        user: { 
                            email, 
                            user_metadata: metadata 
                        } 
                    }, 
                    error: null 
                };
            }
            
            return { data: null, error };
        }
    }
    
    /**
     * Sign in a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Sign in result
     */
    async function signIn(email, password) {
        if (!supabase) {
            if (!initSupabase()) {
                return { error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Attempt to sign in with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Get user data and store in localStorage
            let userData = {
                email: email,
                user_metadata: data.user?.user_metadata || {}
            };
            
            // If we don't have user metadata from Supabase, try to get it from localStorage
            if (!userData.user_metadata.name) {
                const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
                const localUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
                
                if (localUser) {
                    userData.user_metadata = {
                        name: localUser.name,
                        admissionNumber: localUser.admissionNumber
                    };
                    userData.role = localUser.role || 'user';
                }
            }
            
            localStorage.setItem('campus_cafe_user', JSON.stringify(userData));
            console.log('User logged in successfully:', email);
            
            return { data, error: null };
        } catch (error) {
            console.error('Supabase login failed, trying localStorage:', error);
            
            // Try localStorage authentication (for offline mode)
            const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
            const user = users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password
            );
            
            if (!user) {
                return { data: null, error: { message: 'Invalid email or password' } };
            }
            
            // Store current user in localStorage
            const currentUser = {
                email: user.email,
                user_metadata: {
                    name: user.name,
                    admissionNumber: user.admissionNumber
                },
                role: user.role || 'user'
            };
            
            localStorage.setItem('campus_cafe_user', JSON.stringify(currentUser));
            console.log('User logged in via localStorage:', email);
            
            return { 
                data: { 
                    user: currentUser 
                }, 
                error: null 
            };
        }
    }
    
    /**
     * Sign out the current user
     * @returns {Promise<Object>} - Sign out result
     */
    async function signOut() {
        if (!supabase) {
            if (!initSupabase()) {
                return { error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Attempt to sign out with Supabase
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            // Clear localStorage user regardless of Supabase result
            localStorage.removeItem('campus_cafe_user');
            console.log('User signed out successfully');
            
            return { error: null };
        } catch (error) {
            console.error('Supabase sign out failed:', error);
            
            // Still clear localStorage user
            localStorage.removeItem('campus_cafe_user');
            console.log('User signed out from localStorage');
            
            return { error: null }; // Return success even if Supabase fails
        }
    }
    
    /**
     * Get the current user
     * @returns {Promise<Object>} - User data
     */
    async function getCurrentUser() {
        if (!supabase) {
            if (!initSupabase()) {
                return { error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Try to get the session from Supabase
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session && session.user) {
                return { user: session.user, error: null };
            }
            
            // Try localStorage if no Supabase session
            const userDataStr = localStorage.getItem('campus_cafe_user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                return { user: userData, error: null };
            }
            
            return { user: null, error: null };
        } catch (error) {
            console.error('Error getting user from Supabase, trying localStorage:', error);
            
            // Fallback to localStorage
            const userDataStr = localStorage.getItem('campus_cafe_user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                return { user: userData, error: null };
            }
            
            return { user: null, error: null };
        }
    }
    
    // Alias for backward compatibility
    function getUser() {
        return getCurrentUser();
    }
    
    /**
     * Get data from a table
     * @param {string} table - Table name
     * @param {string} field - Field to match
     * @param {any} value - Value to match
     * @returns {Promise<Object>} - Query result
     */
    async function getData(table, field, value) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            const { data, error } = await supabase
                .from(table)
                .select()
                .eq(field, value)
                .single();
                
            if (error) throw error;
            
            return { data, error: null };
        } catch (error) {
            console.error(`Error fetching data from ${table}:`, error);
            
            // Fallback to localStorage for certain tables
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const storageKey = `campus_cafe_${table}`;
                const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const item = items.find(item => item[field] === value);
                
                return { data: item || null, error: null };
            }
            
            return { data: null, error };
        }
    }
    
    /**
     * Save data to a table
     * @param {string} table - Table name
     * @param {Object} data - Data to save
     * @returns {Promise<Object>} - Save result
     */
    async function saveData(table, data) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            const { data: savedData, error } = await supabase
                .from(table)
                .upsert(data)
                .select();
                
            if (error) throw error;
            
            // Also save to localStorage for offline mode
            const storageKey = `campus_cafe_${table}`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const index = items.findIndex(item => item.id === data.id);
            
            if (index !== -1) {
                items[index] = data;
            } else {
                items.push(data);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(items));
            
            return { data: savedData, error: null };
        } catch (error) {
            console.error(`Error saving data to ${table}:`, error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const storageKey = `campus_cafe_${table}`;
                const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const index = items.findIndex(item => item.id === data.id);
                
                if (index !== -1) {
                    items[index] = data;
                } else {
                    items.push(data);
                }
                
                localStorage.setItem(storageKey, JSON.stringify(items));
                
                return { data, error: null };
            }
            
            return { data: null, error };
        }
    }
    
    /**
     * Get user profile from the profiles table
     * @param {string} userId - User ID (optional, uses current user if not provided)
     * @returns {Promise<Object>} - User profile data
     */
    async function getUserProfile(userId = null) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // If userId is not provided, get the current user
            if (!userId) {
                const { user, error } = await getCurrentUser();
                if (error) throw error;
                if (!user) throw new Error('No user logged in');
                userId = user.id;
            }
            
            // Get profile from Supabase
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
                
            if (error) throw error;
            
            return { data, error: null };
        } catch (error) {
            console.error('Error getting user profile:', error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const userDataStr = localStorage.getItem('campus_cafe_user');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    return { 
                        data: {
                            user_id: userId || 'offline-user',
                            first_name: userData.user_metadata?.name?.split(' ')?.[0] || '',
                            last_name: userData.user_metadata?.name?.split(' ')?.[1] || '',
                            admission_number: userData.user_metadata?.admissionNumber || '',
                            email: userData.email,
                            created_at: new Date().toISOString()
                        }, 
                        error: null 
                    };
                }
            }
            
            return { data: null, error };
        }
    }
    
    /**
     * Alias for getUserProfile for backward compatibility
     */
    function getProfile() {
        return getUserProfile();
    }
    
    /**
     * Get orders for a user
     * @param {Object} options - Options for getting orders
     * @returns {Promise<Object>} - Orders data
     */
    async function getOrders(options = {}) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Get current user if userId not provided
            let userId = options.userId;
            if (!userId) {
                const { user, error } = await getCurrentUser();
                if (error) throw error;
                if (!user) throw new Error('No user logged in');
                userId = user.id;
            }
            
            // Build query
            let query = supabase
                .from('orders')
                .select('*');
                
            // Filter by user ID if specified
            if (userId) {
                query = query.eq('user_id', userId);
            }
            
            // Filter by status if specified
            if (options.status) {
                query = query.eq('status', options.status);
            }
            
            // Filter by order ID if specified
            if (options.orderId) {
                query = query.eq('id', options.orderId);
            }
            
            // Add order by clause
            query = query.order('created_at', { ascending: false });
            
            // Execute query
            const { data, error } = await query;
            
            if (error) throw error;
            
            return { data, error: null, offlineOnly: false };
        } catch (error) {
            console.error('Error getting orders:', error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const ordersStr = localStorage.getItem('campus_cafe_orders');
                if (ordersStr) {
                    let orders = JSON.parse(ordersStr);
                    
                    // Apply filters
                    if (options.userId) {
                        orders = orders.filter(order => order.userId === options.userId);
                    }
                    
                    if (options.status) {
                        orders = orders.filter(order => order.status === options.status);
                    }
                    
                    if (options.orderId) {
                        orders = orders.filter(order => order.id === options.orderId);
                    }
                    
                    // Sort by created_at, newest first
                    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    
                    return { data: orders, error: null, offlineOnly: true };
                }
            }
            
            return { data: [], error, offlineOnly: true };
        }
    }
    
    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise<Object>} - Update result
     */
    async function updateOrderStatus(orderId, status) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Update order in Supabase
            const { data, error } = await supabase
                .from('orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', orderId)
                .select();
                
            if (error) throw error;
            
            // Also update in localStorage
            const ordersStr = localStorage.getItem('campus_cafe_orders');
            if (ordersStr) {
                const orders = JSON.parse(ordersStr);
                const index = orders.findIndex(order => order.id === orderId);
                
                if (index !== -1) {
                    orders[index].status = status;
                    orders[index].updated_at = new Date().toISOString();
                    localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
                }
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('Error updating order status:', error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const ordersStr = localStorage.getItem('campus_cafe_orders');
                if (ordersStr) {
                    const orders = JSON.parse(ordersStr);
                    const index = orders.findIndex(order => order.id === orderId);
                    
                    if (index !== -1) {
                        orders[index].status = status;
                        orders[index].updated_at = new Date().toISOString();
                        localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
                        
                        return { data: orders[index], error: null };
                    }
                }
            }
            
            return { data: null, error };
        }
    }
    
    /**
     * Insert a new order
     * @param {Object} order - Order data
     * @returns {Promise<Object>} - Insert result
     */
    async function insertOrder(order) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Generate order ID if not provided
            if (!order.id) {
                order.id = 'order_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
            }
            
            // Add timestamps
            order.created_at = new Date().toISOString();
            order.updated_at = new Date().toISOString();
            
            // Insert into Supabase
            const { data, error } = await supabase
                .from('orders')
                .insert(order)
                .select();
                
            if (error) throw error;
            
            // Also save to localStorage
            const ordersStr = localStorage.getItem('campus_cafe_orders');
            const orders = ordersStr ? JSON.parse(ordersStr) : [];
            orders.push(order);
            localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
            
            return { data, error: null, offlineOnly: false };
        } catch (error) {
            console.error('Error inserting order:', error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                // Generate order ID if not provided
                if (!order.id) {
                    order.id = 'order_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
                }
                
                // Add timestamps
                order.created_at = new Date().toISOString();
                order.updated_at = new Date().toISOString();
                
                const ordersStr = localStorage.getItem('campus_cafe_orders');
                const orders = ordersStr ? JSON.parse(ordersStr) : [];
                orders.push(order);
                localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
                
                return { data: order, error: null, offlineOnly: true };
            }
            
            return { data: null, error, offlineOnly: true };
        }
    }
    
    /**
     * Update orders visibility
     * @param {Object} options - Options for updating visibility
     * @returns {Promise<Object>} - Update result
     */
    async function updateOrdersVisibility(options = {}) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Get current user if not provided
            let userId = options.userId;
            if (!userId) {
                const { user, error } = await getCurrentUser();
                if (error) throw error;
                if (!user) throw new Error('No user logged in');
                userId = user.id;
            }
            
            // Update orders in Supabase
            const { data, error } = await supabase
                .from('orders')
                .update({ 
                    is_visible: options.isVisible, 
                    updated_at: new Date().toISOString() 
                })
                .eq('user_id', userId)
                .in('id', options.orderIds || [])
                .select();
                
            if (error) throw error;
            
            // Also update in localStorage
            const ordersStr = localStorage.getItem('campus_cafe_orders');
            if (ordersStr) {
                const orders = JSON.parse(ordersStr);
                orders.forEach(order => {
                    if (order.user_id === userId && (!options.orderIds || options.orderIds.includes(order.id))) {
                        order.is_visible = options.isVisible;
                        order.updated_at = new Date().toISOString();
                    }
                });
                localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('Error updating orders visibility:', error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const ordersStr = localStorage.getItem('campus_cafe_orders');
                if (ordersStr) {
                    const orders = JSON.parse(ordersStr);
                    const updatedOrders = [];
                    
                    orders.forEach(order => {
                        if (order.user_id === options.userId && (!options.orderIds || options.orderIds.includes(order.id))) {
                            order.is_visible = options.isVisible;
                            order.updated_at = new Date().toISOString();
                            updatedOrders.push(order);
                        }
                    });
                    
                    localStorage.setItem('campus_cafe_orders', JSON.stringify(orders));
                    
                    return { data: updatedOrders, error: null };
                }
            }
            
            return { data: null, error };
        }
    }
    
    /**
     * Get all users (admin function)
     * @returns {Promise<Object>} - Users data
     */
    async function getAllUsers() {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Check if current user is admin
            const { user, error: userError } = await getCurrentUser();
            if (userError) throw userError;
            
            // For simplicity, just check localStorage for admin role
            // In a real app, you'd check the user's role in the database
            const userDataStr = localStorage.getItem('campus_cafe_user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                if (userData.role !== 'admin') {
                    throw new Error('Unauthorized access');
                }
            } else {
                throw new Error('Unauthorized access');
            }
            
            // Get users from Supabase
            const { data, error } = await supabase.auth.admin.listUsers();
            
            if (error) throw error;
            
            return { data, error: null };
        } catch (error) {
            console.error('Error getting all users:', error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const usersStr = localStorage.getItem('campus_cafe_users');
                if (usersStr) {
                    const users = JSON.parse(usersStr);
                    
                    // Remove sensitive data like passwords
                    const safeUsers = users.map(user => {
                        const { password, ...safeUser } = user;
                        return safeUser;
                    });
                    
                    return { data: { users: safeUsers }, error: null };
                }
            }
            
            return { data: null, error };
        }
    }
    
    /**
     * Delete a user (admin function)
     * @param {string} userId - User ID or email
     * @returns {Promise<Object>} - Delete result
     */
    async function deleteUser(userId) {
        if (!supabase) {
            if (!initSupabase()) {
                return { data: null, error: { message: 'Supabase client not initialized' } };
            }
        }
        
        try {
            // Check if current user is admin
            const { user, error: userError } = await getCurrentUser();
            if (userError) throw userError;
            
            // For simplicity, just check localStorage for admin role
            // In a real app, you'd check the user's role in the database
            const userDataStr = localStorage.getItem('campus_cafe_user');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                if (userData.role !== 'admin') {
                    throw new Error('Unauthorized access');
                }
            } else {
                throw new Error('Unauthorized access');
            }
            
            // Delete user from Supabase
            let error = null;
            
            // If userId is an email, try to find the actual UUID
            if (userId.includes('@')) {
                const { data, error: findError } = await supabase.auth.admin.getUserByEmail(userId);
                if (findError) throw findError;
                if (data && data.user) {
                    userId = data.user.id;
                }
            }
            
            // Delete the user
            const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
            if (deleteError) throw deleteError;
            
            // Also remove from localStorage
            const usersStr = localStorage.getItem('campus_cafe_users');
            if (usersStr) {
                const users = JSON.parse(usersStr);
                const updatedUsers = users.filter(user => 
                    user.id !== userId && user.email !== userId
                );
                localStorage.setItem('campus_cafe_users', JSON.stringify(updatedUsers));
            }
            
            return { error: null };
        } catch (error) {
            console.error('Error deleting user:', error);
            
            // Fallback to localStorage
            if (window.ENV && window.ENV.features && window.ENV.features.offlineMode) {
                const usersStr = localStorage.getItem('campus_cafe_users');
                if (usersStr) {
                    const users = JSON.parse(usersStr);
                    const updatedUsers = users.filter(user => 
                        user.id !== userId && user.email !== userId
                    );
                    localStorage.setItem('campus_cafe_users', JSON.stringify(updatedUsers));
                    
                    return { error: null };
                }
            }
            
            return { error };
        }
    }
    
    // Public API
    return {
        initSupabase,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        getUser,
        getData,
        saveData,
        getUserProfile,
        getProfile,
        getOrders,
        updateOrderStatus,
        insertOrder,
        updateOrdersVisibility,
        getAllUsers,
        deleteUser
    };
})();

// Initialize Supabase on script load
document.addEventListener('DOMContentLoaded', function() {
    if (window.ENV && window.ENV.supabase) {
        supabaseManager.initSupabase();
    } else {
        console.warn('Supabase configuration not available');
    }
}); 