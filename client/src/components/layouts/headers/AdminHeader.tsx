
import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
  userName: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  showBackButton?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title, 
  userName, 
  className,
  bgColor = "bg-white",
  textColor = "text-gray-800",
  showBackButton = true
}) => {
  return (
    <div className={cn(`${bgColor} shadow-sm py-4 px-6`, className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Link to="/admin/dashboard" className="md:hidden mr-4">
              <ChevronLeft className="h-5 w-5 text-gray-400" />
            </Link>
          )}
          <h1 className={`text-xl font-semibold ${textColor}`}>{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            {userName || 'Administrator'}
          </span>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {userName?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
