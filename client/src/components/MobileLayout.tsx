import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import BaseLayout from "./layouts/BaseLayout";
import MobileHeader from "./layouts/headers/MobileHeader";
import MobileBottomNav from "./layouts/navigation/MobileBottomNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  bgColor?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  title,
  className,
  bgColor = "bg-[#1E40AF]" // Using deep/royal blue color
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const { checkAccess } = useRoleAccess();
  const [isAccessChecked, setIsAccessChecked] = useState(true); // Start as true for faster loading
  const accessCheckPerformed = useRef(false);

  // Simplified access check for better performance
  useEffect(() => {
    if (accessCheckPerformed.current) {
      return;
    }
    
    accessCheckPerformed.current = true;
    
    // Quick authentication check only
    if (!authState.isAuthenticated) {
      navigate("/mobile/login", { replace: true });
      return;
    }
    
    // Set access checked immediately
    setIsAccessChecked(true);
  }, [authState.isAuthenticated, navigate]);

  // Show loading spinner only briefly if needed
  if (!isAccessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gray-50">
        {title && <MobileHeader title={title} bgColor={bgColor} />}
        <main className={`pt-4 px-4 ${className || ''}`}>
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </BaseLayout>
  );
};

export default MobileLayout;