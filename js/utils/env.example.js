/**
 * Example Environment Configuration File
 * Copy this file to env.js and update with your actual values
 */

const ENV = {
  // Environment mode (set to true for development, false for production)
  production: true,
  
  // Supabase Configuration
  supabase: {
    url: "https://lwochrznjisscateazsd.supabase.co", // e.g., https://abcdefghijklmnopqrst.supabase.co
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3b2Nocnpuamlzc2NhdGVhenNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NjY4NjgsImV4cCI6MjA1OTM0Mjg2OH0.9Dd-dw0OUIv7U3NvVpUSeVsw82v9Ug3mcl8KDC7l_Ag", // Public anon key from Supabase project
    // DO NOT add your service role key here - it should never be exposed to the client
  },
  
  // Application settings
  app: {
    name: "Campus Cafe System",
    version: "1.0.0",
    storagePrefix: "campus_cafe_",
    paymentInstructions: "Pay at the counter when collecting your order. Show your order confirmation."
  },
  
  // Feature flags
  features: {
    // Mpesa integration is disabled for counter payments
    mpesaEnabled: false
  }
}; 