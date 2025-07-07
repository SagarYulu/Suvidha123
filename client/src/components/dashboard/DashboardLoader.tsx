
import React from "react";

const DashboardLoader = () => {
  return (
    <div className="space-y-6">
      {/* FilterBar placeholder */}
      <div className="p-4 border rounded-md bg-background animate-pulse h-24"></div>
      
      {/* Dashboard Metrics placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background border rounded-md p-4 animate-pulse">
            <div className="h-12"></div>
            <div className="mt-2 h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      
      {/* Charts placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-background border rounded-md p-4 animate-pulse">
            <div className="h-[300px]"></div>
          </div>
        ))}
      </div>
      
      {/* Table placeholder */}
      <div className="bg-background border rounded-md p-4 animate-pulse">
        <div className="h-[300px]"></div>
      </div>
      
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    </div>
  );
};

export default DashboardLoader;
