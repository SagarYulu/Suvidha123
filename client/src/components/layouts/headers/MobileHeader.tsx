
import React from "react";
import { cn } from "@/lib/utils";

interface BaseHeaderProps {
  title: string;
  userName?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  priority?: "low" | "medium" | "high" | "critical";
  children?: React.ReactNode;
}

const MobileHeader: React.FC<BaseHeaderProps> = ({ 
  title, 
  userName, 
  className,
  bgColor,
  textColor = "text-white",
  priority,
  children
}) => {
  // Determine background color based on priority if provided
  let headerBgColor = bgColor || "bg-[#1E40AF]"; // Deep/Royal Blue
  
  if (priority) {
    switch (priority) {
      case "low":
        headerBgColor = "bg-green-500";
        break;
      case "medium":
        headerBgColor = "bg-yellow-500";
        break;
      case "high":
        headerBgColor = "bg-orange-500";
        break;
      case "critical":
        headerBgColor = "bg-red-600";
        break;
      default:
        headerBgColor = "bg-[#1E40AF]"; // Deep/Royal Blue
    }
  }

  return (
    <div className={cn(`${headerBgColor} ${textColor} p-4 rounded-t-2xl`, className)}>
      <h1 className="text-xl font-bold text-white">{title}</h1>
      {userName && <p className="text-sm text-white opacity-90">Hello, {userName}</p>}
      {children}
    </div>
  );
};

export default MobileHeader;
