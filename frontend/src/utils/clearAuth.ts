// Utility to clear all authentication data
export const clearAllAuthData = () => {
  // Clear all auth-related localStorage items
  localStorage.removeItem('authToken');
  localStorage.removeItem('authState');
  localStorage.removeItem('user');
  localStorage.removeItem('dashboardUser');
  
  // Clear any session storage
  sessionStorage.clear();
  
  console.log('All authentication data cleared');
};

// Auto-clear on load if token is invalid
const checkAndClearInvalidAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      // Decode token to check structure
      const payload = JSON.parse(atob(token.split('.')[1]));
      // If token has old 'userId' field instead of 'id', clear it
      if (payload.userId && !payload.id) {
        console.log('Detected old token format, clearing auth...');
        clearAllAuthData();
        window.location.reload();
      }
    } catch (e) {
      console.log('Invalid token format, clearing auth...');
      clearAllAuthData();
    }
  }
};

// Run check immediately
checkAndClearInvalidAuth();

export default clearAllAuthData;