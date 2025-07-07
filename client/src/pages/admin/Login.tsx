import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Building2, Shield } from 'lucide-react';
import { apiClient } from '@/services/apiClient';


interface LocationState {
  returnTo?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { authState, signIn, refreshAuth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { returnTo } = (location.state as LocationState) || {};
  const initialCheckDone = useRef(false);

  // Simplified auth check - no auto redirects to prevent visibility issues
  useEffect(() => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      setErrorMessage('');
      // Don't auto-redirect to prevent page visibility issues
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log("Attempting to login to admin dashboard with:", email);
      
      // Direct login without pre-validation - JWT API will handle authentication
      console.log("Proceeding with JWT login");
      
      // Try login through authContext
      const success = await signIn(email, password);
      
      if (success) {
        // Login successful - allow access (RBAC restrictions removed)
        toast({
          description: 'Login successful!'
        });
        
        // Redirect to the return URL if provided, or to the dashboard
        const redirectPath = returnTo || '/admin/dashboard';
        console.log("Login successful, redirecting to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMessage('Invalid email or password');
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'An error occurred during login');
      toast({
        title: "Login error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating icons */}
        <div className="absolute top-20 left-10 text-blue-300/30 animate-bounce" style={{animationDelay: '0s'}}>
          <Shield className="h-12 w-12" />
        </div>
        <div className="absolute top-32 right-16 text-indigo-300/30 animate-bounce" style={{animationDelay: '1s'}}>
          <Building2 className="h-10 w-10" />
        </div>
        <div className="absolute bottom-32 left-20 text-blue-300/30 animate-bounce" style={{animationDelay: '2s'}}>
          <Shield className="h-8 w-8" />
        </div>
        <div className="absolute bottom-20 right-10 text-indigo-300/30 animate-bounce" style={{animationDelay: '0.5s'}}>
          <Building2 className="h-14 w-14" />
        </div>
        
        {/* Quote bubbles */}

        
        {/* Additional employee/HR related quotes */}
        <div className="absolute top-80 right-40 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-xs text-indigo-700/60 max-w-40 animate-pulse" style={{animationDelay: '10s'}}>
          <div className="text-center">
            <span className="text-lg">✨</span>
            <p className="mt-1 font-bold">"Employee wellbeing first"</p>
          </div>
        </div>

        {/* Enhanced glowing quotes with better spacing to prevent overlap */}
        <div className="absolute top-4 left-2/3 bg-gradient-to-r from-blue-200/20 to-purple-200/20 backdrop-blur-sm rounded-lg p-3 text-xs font-bold text-blue-800 max-w-44 animate-pulse shadow-lg shadow-blue-500/20" style={{animationDelay: '11s'}}>
          <div className="text-center">
            <span className="text-xl filter drop-shadow-lg">🌟</span>
            <p className="mt-1 font-extrabold drop-shadow-sm">"Making workplaces happier"</p>
          </div>
        </div>
        
        <div className="absolute top-48 left-2 bg-gradient-to-r from-green-200/20 to-teal-200/20 backdrop-blur-sm rounded-lg p-3 text-xs font-bold text-green-800 max-w-40 animate-pulse shadow-lg shadow-green-500/20" style={{animationDelay: '12s'}}>
          <div className="text-center">
            <span className="text-xl filter drop-shadow-lg">🏆</span>
            <p className="mt-1 font-extrabold drop-shadow-sm">"Excellence in support"</p>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-2 bg-gradient-to-r from-orange-200/20 to-red-200/20 backdrop-blur-sm rounded-lg p-3 text-xs font-bold text-orange-800 max-w-42 animate-pulse shadow-lg shadow-orange-500/20" style={{animationDelay: '13s'}}>
          <div className="text-center">
            <span className="text-xl filter drop-shadow-lg">🚀</span>
            <p className="mt-1 font-extrabold drop-shadow-sm">"Innovation meets care"</p>
          </div>
        </div>
        

        

        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300/20 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-indigo-300/20 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-blue-400/30 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-indigo-300/25 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-blue-400/20 rounded-full animate-ping" style={{animationDelay: '4s'}}></div>

        

      </div>
      
      <div className="w-full max-w-md p-6 relative z-10">

        

        
        <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-3 text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Yulu Suvidha Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access the admin dashboard
              {returnTo && <p className="mt-1 text-sm italic">You'll be redirected to {returnTo} after login</p>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 px-4 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-6">
            <div className="text-center w-full">
              <a href="/mobile/login" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Go to Employee App Login
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
