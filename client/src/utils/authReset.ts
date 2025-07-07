// Authentication Reset Utility
export const resetAuthentication = () => {
  console.log('🔧 Resetting authentication...');
  
  // Clear all auth-related items from localStorage
  const authKeys = ['authToken', 'authState', 'user', 'dashboardUser'];
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✓ Cleared ${key}`);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✓ Cleared session storage');
  
  // Clear any cookies (though we don't use them in this app)
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  console.log('✅ Authentication reset complete!');
  console.log('🔄 Redirecting to login page...');
  
  // Redirect to login
  window.location.href = '/';
};

// Auto-run on page load if there's a JWT error
if (typeof window !== 'undefined') {
  // Check if we have a token but it's invalid
  const token = localStorage.getItem('authToken');
  if (token) {
    // Try to decode it
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        // Check if expired
        if (new Date(payload.exp * 1000) < new Date()) {
          console.log('⚠️ Token expired, resetting authentication...');
          resetAuthentication();
        }
      }
    } catch (e) {
      console.log('⚠️ Invalid token format, resetting authentication...');
      resetAuthentication();
    }
  }
}

export default resetAuthentication;