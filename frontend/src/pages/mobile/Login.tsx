
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MobileLogin = () => {
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState, login, logout, mobileVerify } = useAuth();
  const navigate = useNavigate();
  const initialCheckDone = useRef(false);

  // Dashboard user roles that should be redirected to admin dashboard
  const dashboardUserRoles = ['City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'];
  
  // Restricted emails that should never access mobile app
  const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];

  // Mobile login should be independent - clear any admin sessions on mount
  useEffect(() => {
    if (initialCheckDone.current) {
      return; // Skip if we've already checked
    }
    
    // Mark that we've done the initial check
    initialCheckDone.current = true;
    
    // Clear any existing admin sessions when accessing mobile login
    console.log("Mobile login accessed - clearing any existing admin sessions");
    localStorage.removeItem('authState');
    localStorage.removeItem('authToken');
    
    // Force logout to ensure clean state
    logout();
    
    // Check if we have an authenticated employee (not admin)
    if (authState && authState.isAuthenticated && authState.user) {
      // Only allow access if it's an employee role (not admin/dashboard roles)
      const isEmployee = authState.role && !dashboardUserRoles.includes(authState.role) && !restrictedEmails.includes(authState.user.email);
      
      if (isEmployee) {
        console.log("Employee already authenticated, redirecting to issues");
        navigate("/mobile/issues", { replace: true });
        return;
      }
    }
    
    // Show login form for all other cases
    setPageLoading(false);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); 

    try {
      console.log("Attempting mobile verification with:", { email, employeeId });
      // Use mobile verification instead of regular login
      const success = await mobileVerify(email, employeeId);
      
      if (success) {
        console.log("Verification successful, checking access rights");
        
        // Get user data from localStorage - could be from mockUser or auth state
        const authStateData = localStorage.getItem("authState");
        const userData = authStateData ? JSON.parse(authStateData) : null;
        
        if (userData && userData.user) {
          // Check if user email is explicitly restricted
          if (restrictedEmails.includes(userData.user.email)) {
            console.log("Restricted email detected:", userData.user.email);
            setError("Access denied. Please use the admin dashboard login.");
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            await logout();
            setIsLoading(false);
            return;
          }
          
          // Check if user has a dashboard role
          if (userData.role && dashboardUserRoles.includes(userData.role)) {
            console.log("Dashboard role detected:", userData.role);
            setError("Access denied. Please use the admin dashboard login.");
            toast({
              title: "Access Denied",
              description: "You don't have access to the mobile app. Please use the admin dashboard.",
              variant: "destructive",
            });
            await logout();
            setIsLoading(false);
            return;
          }
          
          // Success - user has mobile app access
          console.log("User has mobile app access, redirecting to issues");
          toast({
            title: "Verification successful",
            description: "Redirecting to your issues...",
          });
          navigate("/mobile/issues", { replace: true });
        } else {
          // If verification succeeded but no user data found
          console.log("No user data found, assuming regular employee");
          toast({
            title: "Verification successful",
            description: "Redirecting to your issues...",
          });
          navigate("/mobile/issues", { replace: true });
        }
      } else {
        console.log("Verification failed");
        setError("Invalid email or employee ID. Please try again.");
        toast({
          title: "Verification failed",
          description: "Invalid email or employee ID. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Verification error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#1E40AF]/10">
        <div className="bg-[#1E40AF] h-[40vh] w-full"></div>
        <div className="relative px-6 mx-auto max-w-md -mt-32">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 py-10">
              <Skeleton className="h-10 w-48 mx-auto mb-10" />
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <Skeleton className="h-12 w-full mt-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating motivational quotes for mobile */}
        <div className="absolute top-16 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <span className="text-lg">🏠</span>
            <p className="text-xs font-bold text-blue-800 mt-1">"Your workplace, your voice"</p>
          </div>
        </div>
        
        <div className="absolute top-32 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <span className="text-lg">⚡</span>
            <p className="text-xs font-bold text-green-800 mt-1">"Quick support guaranteed"</p>
          </div>
        </div>
        
        <div className="absolute bottom-32 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <span className="text-lg">🔒</span>
            <p className="text-xs font-bold text-purple-800 mt-1">"Safe & confidential"</p>
          </div>
        </div>
        
        <div className="absolute bottom-48 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <span className="text-lg">💬</span>
            <p className="text-xs font-bold text-orange-800 mt-1">"We're here to help"</p>
          </div>
        </div>
        
        <div className="absolute top-48 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <span className="text-lg">🎯</span>
            <p className="text-xs font-bold text-indigo-800 mt-1">"Every issue matters"</p>
          </div>
        </div>
        
        <div className="absolute top-64 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <span className="text-lg">✨</span>
            <p className="text-xs font-bold text-pink-800 mt-1">"Better together"</p>
          </div>
        </div>
        

        

      </div>

      {/* Full-width curved blue background */}
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] h-[40vh] w-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
      </div>

      {/* Card positioned over the background */}
      <div className="relative px-6 mx-auto max-w-md -mt-32 z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-center text-[#1E40AF] mb-10">
              Yulu Suvidha
            </h1>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-8">
              {/* Email input with label */}
              <div className="space-y-2">
                <label className="text-gray-500 text-sm font-medium ml-1">Email ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-[#1E40AF]" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 
                              focus:border-[#1E40AF] text-base py-2 mobile-input"
                  />
                </div>
              </div>

              {/* Employee ID input with label */}
              <div className="space-y-2">
                <label className="text-gray-500 text-sm font-medium ml-1">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-[#1E40AF]" />
                  </div>
                  <Input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="pl-10 border-b-2 border-t-0 border-x-0 rounded-none focus:ring-0 
                              focus:border-[#1E40AF] text-base py-2 mobile-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 text-lg font-medium rounded-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white mt-8"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Use your employee email and employee ID
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
