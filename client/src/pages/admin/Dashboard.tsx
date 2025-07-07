
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

  // Filters are managed by React Query via queryKey dependencies

  // Test JWT Authentication
  const testAuth = async () => {
    console.log('Testing JWT Authentication...');
    try {
      const response = await fetch('/api/issues', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Auth Test Response:', { status: response.status, data });
      alert(`Auth Test: ${response.status === 200 ? 'SUCCESS' : 'FAILED'} - Status: ${response.status}`);
    } catch (error) {
      console.error('Auth Test Error:', error);
      alert('Auth Test Failed with error');
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {isLoading && !analytics ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-6">
          {/* Test Authentication Button */}
          <button 
            onClick={testAuth}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test JWT Auth
          </button>
          {/* Pass current filters to FilterBar to ensure UI stays in sync */}
          <FilterBar 
            onFilterChange={handleFilterChange} 
            initialFilters={filters}
          />
          
          {/* Dashboard Metrics */}
          <DashboardMetrics 
            analytics={analytics} 
            userCount={userCount}
            isLoading={isLoading} 
          />

          {/* Charts Section */}
          <ChartSection 
            typePieData={typePieData}
            cityBarData={cityBarData}
            isLoading={isLoading}
          />

          {/* Recent Tickets Table - Pass formatted consistent issues */}
          <RecentTicketsTable 
            recentIssues={formattedRecentIssues}
            isLoading={isLoading}
          />
        </div>
      )}
    </AdminLayout>
  );
};

// Main component that provides the query client
const AdminDashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default AdminDashboard;
