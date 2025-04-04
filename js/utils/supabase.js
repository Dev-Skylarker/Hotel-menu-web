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
            
            // Initialize Supabase client
            supabase = supabaseClient.createClient(
                window.ENV.supabase.url,
                window.ENV.supabase.anonKey
            );
            
            console.log('Supabase client initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
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
            
            // Store in localStorage for mock functionality
            const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
            users.push({
                email,
                password,
                ...metadata
            });
            localStorage.setItem('campus_cafe_users', JSON.stringify(users));
            
            return { data, error: null };
        } catch (error) {
            console.error('Sign up failed:', error);
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
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Store current user in localStorage
            const users = JSON.parse(localStorage.getItem('campus_cafe_users') || '[]');
            const user = users.find(u => u.email === email);
            
            if (user) {
                localStorage.setItem('campus_cafe_user', JSON.stringify({
                    email: user.email,
                    user_metadata: {
                        name: user.name,
                        admissionNumber: user.admissionNumber
                    }
                }));
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('Sign in failed:', error);
            return { data: null, error };
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
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            // Clear localStorage user
            localStorage.removeItem('campus_cafe_user');
            
            return { error: null };
        } catch (error) {
            console.error('Sign out failed:', error);
            return { error };
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
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (!session) {
                return { user: null, error: null };
            }
            
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) throw userError;
            
            return { user, error: null };
        } catch (error) {
            console.error('Get user failed:', error);
            return { user: null, error };
        }
    }
    
    // Alias for backward compatibility
    function getUser() {
        return getCurrentUser();
    }
    
    // Public API
    return {
        initSupabase,
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        getUser
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