// Comprehensive JWT Authentication Debugger
import { apiClient } from '@/services/apiClient';
import authenticatedAxios from '@/services/authenticatedAxios';

export class AuthDebugger {
  static async runFullDiagnostics() {
    console.log('🔍 === JWT AUTHENTICATION DEBUGGER ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // 1. Check localStorage
    console.log('\n📦 1. LOCALSTORAGE CHECK:');
    const token = localStorage.getItem('authToken');
    const authState = localStorage.getItem('authState');
    const user = localStorage.getItem('user');
    const dashboardUser = localStorage.getItem('dashboardUser');
    
    console.log('- authToken exists:', !!token);
    console.log('- authToken value:', token ? `${token.substring(0, 50)}...` : 'null');
    console.log('- authState:', authState);
    console.log('- user:', user);
    console.log('- dashboardUser:', dashboardUser);
    
    // 2. Decode JWT Token
    if (token) {
      console.log('\n🔐 2. JWT TOKEN ANALYSIS:');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          console.log('- Header:', header);
          console.log('- Payload:', payload);
          console.log('- User ID:', payload.id);
          console.log('- User Type:', payload.userType);
          console.log('- Email:', payload.email);
          console.log('- Role:', payload.role);
          console.log('- Issued at:', new Date(payload.iat * 1000).toLocaleString());
          console.log('- Expires at:', new Date(payload.exp * 1000).toLocaleString());
          console.log('- Is expired:', new Date(payload.exp * 1000) < new Date());
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    
    // 3. Test Raw Fetch API
    console.log('\n🌐 3. RAW FETCH API TEST:');
    try {
      const fetchResponse = await fetch('/api/issues', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('- Fetch status:', fetchResponse.status);
      const fetchData = await fetchResponse.json();
      console.log('- Fetch response:', fetchData);
    } catch (e) {
      console.error('- Fetch error:', e);
    }
    
    // 4. Test Axios Instance
    console.log('\n📡 4. AXIOS INSTANCE TEST:');
    try {
      // Check axios interceptors
      console.log('- Axios base URL:', apiClient.axiosInstance?.defaults?.baseURL || 'Not accessible');
      
      // Make a test call
      const axiosResponse = await apiClient.getIssues();
      console.log('- Axios response:', axiosResponse);
    } catch (e: any) {
      console.error('- Axios error:', e.response?.data || e.message);
      console.error('- Error status:', e.response?.status);
      console.error('- Error headers:', e.response?.headers);
    }
    
    // 5. Test Authenticated Axios
    console.log('\n🔒 5. AUTHENTICATED AXIOS TEST:');
    try {
      const authAxiosResponse = await authenticatedAxios.get('/issues');
      console.log('- Authenticated axios response:', authAxiosResponse.data);
    } catch (e: any) {
      console.error('- Authenticated axios error:', e.response?.data || e.message);
      console.error('- Error status:', e.response?.status);
    }
    
    // 6. Check Window Location
    console.log('\n📍 6. CURRENT LOCATION:');
    console.log('- Pathname:', window.location.pathname);
    console.log('- Full URL:', window.location.href);
    
    // 7. Test Different Services
    console.log('\n🔧 7. SERVICE-SPECIFIC TESTS:');
    
    // Test issue service
    try {
      const { getIssues } = await import('@/services/issueService');
      const issues = await getIssues();
      console.log('- Issue service success, count:', issues.length);
    } catch (e) {
      console.error('- Issue service error:', e);
    }
    
    // Test user service
    try {
      const { getUsers } = await import('@/services/userService');
      const users = await getUsers();
      console.log('- User service success, count:', users.length);
    } catch (e) {
      console.error('- User service error:', e);
    }
    
    console.log('\n✅ Diagnostics complete!');
  }
  
  static fixAuthToken(newToken: string) {
    console.log('🔧 Manually setting auth token...');
    localStorage.setItem('authToken', newToken);
    console.log('✅ Token updated. Reload the page to apply changes.');
  }
  
  static clearAllAuth() {
    console.log('🧹 Clearing all authentication data...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authState');
    localStorage.removeItem('user');
    localStorage.removeItem('dashboardUser');
    sessionStorage.clear();
    console.log('✅ All auth data cleared. Redirecting to login...');
    window.location.href = '/';
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).AuthDebugger = AuthDebugger;
}

// Auto-export for use in other files
export const runAuthDiagnostics = AuthDebugger.runFullDiagnostics;
export const fixAuthToken = AuthDebugger.fixAuthToken;
export const clearAllAuth = AuthDebugger.clearAllAuth;