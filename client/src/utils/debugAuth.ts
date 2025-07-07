// Debug utility to check authentication state
export const debugAuth = () => {
  const token = localStorage.getItem('authToken');
  const authState = localStorage.getItem('authState');
  
  console.log('=== Authentication Debug Info ===');
  console.log('Token exists:', !!token);
  console.log('Token value:', token ? `${token.substring(0, 50)}...` : 'null');
  console.log('Auth state:', authState);
  
  // Decode JWT payload if token exists
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000).toLocaleString());
        console.log('Token issued:', new Date(payload.iat * 1000).toLocaleString());
      }
    } catch (e) {
      console.error('Failed to decode token:', e);
    }
  }
  
  // Test API call
  console.log('Testing API call to /api/issues...');
  fetch('/api/issues', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => {
    console.log('API Response status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('API Response data:', data);
  })
  .catch(err => {
    console.error('API Error:', err);
  });
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
}