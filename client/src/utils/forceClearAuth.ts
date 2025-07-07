// Force clear all authentication data - run this in browser console
export function forceClearAllAuth() {
  console.log("=== FORCE CLEARING ALL AUTHENTICATION DATA ===");
  
  // Clear all localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keysToRemove.push(key);
  }
  
  keysToRemove.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Clear all sessionStorage
  sessionStorage.clear();
  
  // Clear all cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log("=== ALL AUTH DATA CLEARED ===");
  console.log("Please refresh the page and login again");
  
  // Force reload to clear any in-memory state
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

// Make it available globally for console use
(window as any).forceClearAllAuth = forceClearAllAuth;