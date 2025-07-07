import React from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from "@/components/AdminLayout";
import FilterBar from "@/components/dashboard/FilterBar";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import ChartSection from "@/components/dashboard/ChartSection";
import RecentTicketsTable from "@/components/dashboard/RecentTicketsTable";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatConsistentIssueData } from "@/services/issues/issueProcessingService";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Separate the inner component to use hooks
const DashboardContent = () => {
  const { 
    analytics,
    recentIssues,
    isLoading,
    userCount,
    handleFilterChange,
    typePieData,
    cityBarData,
    filters,
  } = useDashboardData();

  // Format issues consistently with the other pages
  const formattedRecentIssues = React.useMemo(() => {
    if (!recentIssues) return [];
    return formatConsistentIssueData(recentIssues);
  }, [recentIssues]);



  return (
    <AdminLayout title="Dashboard">
      {isLoading && !analytics ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-6">
          {/* Pass current filters to FilterBar to ensure UI stays in sync */}
          <FilterBar 
            onFilterChange={handleFilterChange}
            currentFilters={filters} 
          />
          
          <DashboardMetrics 
            analytics={analytics} 
            userCount={userCount} 
          />
          
          <ChartSection 
            typePieData={typePieData}
            cityBarData={cityBarData} 
          />
          
          <RecentTicketsTable 
            recentIssues={formattedRecentIssues}
            isLoading={isLoading} 
          />
        </div>
      )}
    </AdminLayout>
  );
};

// Main Dashboard component wrapped with QueryClientProvider
const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default Dashboard;