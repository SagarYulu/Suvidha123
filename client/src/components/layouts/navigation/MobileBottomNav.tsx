
import React from "react";
import { Home, FilePlus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleHomeClick = () => {
    navigate("/mobile/issues");
  };

  const handleNewIssueClick = () => {
    navigate("/mobile/issues/new");
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate("/mobile/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout by clearing localStorage and redirecting
      localStorage.clear();
      navigate("/mobile/login");
    }
  };

  return (
    <nav className="bg-[#F8F9FA] border-t fixed bottom-0 w-full">
      <div className="flex justify-between items-center">
        {/* Left section - Home */}
        <div className="flex-1 flex justify-center">
          <button 
            onClick={handleHomeClick}
            className={cn(
              "flex flex-col items-center py-3",
              location.pathname === "/mobile/issues" ? "text-[#1E40AF]" : "text-gray-500"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </button>
        </div>
        
        {/* Middle section - Raise ticket */}
        <div className="flex-grow-0 flex justify-center -mt-5 mx-4">
          <button
            onClick={handleNewIssueClick}
            className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-md"
          >
            <FilePlus className="h-6 w-6" />
            <span className="text-xs mt-1">Raise ticket</span>
          </button>
        </div>
        
        {/* Right section - Logout */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={handleLogoutClick}
            className="flex flex-col items-center py-3 text-gray-500"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
