import React from 'react';

const TokenInspector = () => {
  const inspectToken = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('❌ No token found in localStorage');
      return;
    }
    
    console.log('🔍 Token exists:', token);
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('❌ Invalid token format');
        return;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      console.log('📦 Token Payload:', payload);
      console.log('⏰ Expires:', new Date(payload.exp * 1000).toLocaleString());
      console.log('⏰ Is Expired:', new Date(payload.exp * 1000) < new Date());
      
      // Test the token
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => console.log('✅ Token Verification:', data))
      .catch(err => console.log('❌ Token Verification Error:', err));
      
    } catch (e) {
      console.error('❌ Error decoding token:', e);
    }
  };
  
  const clearAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };
  
  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <button 
        onClick={inspectToken}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Inspect Token
      </button>
      <button 
        onClick={clearAuth}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Clear & Re-login
      </button>
    </div>
  );
};

export default TokenInspector;