// Supabase Configuration
// Replace these values with your actual Supabase project credentials

const SUPABASE_CONFIG = {
    url: 'https://jzgxanwdkehzwdhbyzjr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3hhbndka2VoendkaGJ5empyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjA3NzYsImV4cCI6MjA3MTkzNjc3Nn0.qufWnLhK68gcdnBoy2RSpCCJZSfAsW63Rg_5zSnwPAQ'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
} else {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
