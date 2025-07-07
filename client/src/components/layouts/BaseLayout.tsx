
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface BaseLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  header,
  footer,
  sidebar,
  className,
  contentClassName,
}) => {
  // Determine if we have a sidebar to adjust layout
  const hasSidebar = Boolean(sidebar);

  return (
    <div className={cn("flex min-h-screen bg-[#F8F9FA]", className)}>
      {sidebar && (
        <aside className="h-screen">
          {sidebar}
        </aside>
      )}
      
      <div className={cn("flex flex-col flex-1 overflow-hidden", contentClassName)}>
        {header && <header className="w-full">{header}</header>}
        
        <main className={cn("flex-grow", !hasSidebar ? "p-4" : "p-6")}>
          {children}
        </main>
        
        {footer && <footer className="w-full">{footer}</footer>}
      </div>
      <Toaster />
    </div>
  );
};

export default BaseLayout;
