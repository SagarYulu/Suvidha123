
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";


const Index = () => {
  const navigate = useNavigate();
  const { authState, refreshAuth } = useAuth();

  
  useEffect(() => {
    // Try to refresh auth on load
    const checkAuth = async () => {
      await refreshAuth();
    };
    
    checkAuth();
  }, [refreshAuth]);
  
  // Removed welcome toast as it was showing repeatedly
  useEffect(() => {
    if (authState.isAuthenticated) {
      console.log("User is authenticated:", authState.user);
    }
  }, [authState]);

  const handleAdminClick = () => {
    console.log("Admin button clicked, current auth state:", authState);
    
    // If user is authenticated as an employee, they cannot access admin dashboard
    if (authState.isAuthenticated && authState.user?.userType === "employee") {
      console.log("Employee user attempted admin access, blocking");
      navigate("/admin/login");
      return;
    }
    
    // Dashboard user roles that can access admin dashboard
    const adminRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
    
    // If the user is already authenticated and is a dashboard user, navigate directly
    if (authState.isAuthenticated && authState.user?.userType === "dashboard_user" && authState.role && adminRoles.includes(authState.role)) {
      console.log("User is dashboard user, navigating to dashboard");
      navigate("/admin/dashboard");
    } else {
      // Not authenticated or not dashboard user - redirect to admin login page
      console.log("User is not dashboard user or not authenticated, navigating to admin login");
      navigate("/admin/login");
    }
  };

  const handleEmployeeClick = () => {
    console.log("Employee button clicked, current auth state:", authState);
    
    // If user is authenticated as a dashboard user, they should logout first
    if (authState.isAuthenticated && authState.user?.userType === "dashboard_user") {
      console.log("Dashboard user attempted employee access, redirecting to mobile login");
      navigate("/mobile/login");
      return;
    }
    
    // If the user is already authenticated and is an employee, navigate directly
    if (authState.isAuthenticated && authState.user?.userType === "employee") {
      console.log("User is employee, navigating to mobile issues");
      navigate("/mobile/issues");
    } else {
      // Not authenticated or not employee - redirect to login
      console.log("User is not employee or not authenticated, navigating to mobile login");
      navigate("/mobile/login");
    }
  };



  // Removed presentation mode functionality
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 animate-gradient-xy"></div>
      
      {/* Floating elements for visual appeal */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-1/4 -right-20 w-60 h-60 bg-white/10 rounded-full blur-xl animate-float-medium"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float-fast"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mb-4 animate-bounce-slow">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">Welcome to Suvidha</h1>
          <p className="text-white/80 text-lg animate-fade-in-delay">Your Employee Grievance Portal</p>
        </div>
        
        {/* Card with glassmorphism effect */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-slide-up">
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-white/90 text-center text-lg">
                Choose your platform to continue
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={handleAdminClick}
                className="py-6 bg-white/90 hover:bg-white text-gray-800 font-semibold text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl backdrop-blur-sm"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Admin Dashboard
              </Button>
              <Button 
                onClick={handleEmployeeClick}
                className="py-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Employee Mobile App
              </Button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-white/5 px-8 py-4 border-t border-white/10">
            <p className="text-white/60 text-center text-sm">
              Powered by Yulu © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default Index;
