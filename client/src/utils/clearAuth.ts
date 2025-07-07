// Utility to clear authentication data and force re-login
export const clearAuthAndReload = () => {
  // Clear all auth-related data from localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('authState');
  localStorage.removeItem('user');
  localStorage.removeItem('dashboardUser');
  
  // Clear session storage
  sessionStorage.clear();
  
  // Redirect to home page
  window.location.href = '/';
};

// Add this to window for easy access from console
if (typeof window !== 'undefined') {
  (window as any).clearAuth = clearAuthAndReload;
}