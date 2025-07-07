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
import { AuthDebugger } from "@/utils/authDebugger";
import TokenInspector from "@/components/debug/TokenInspector";

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

  // Check for JWT errors on mount
  React.useEffect(() => {
    // Check if we're getting 403 errors
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/issues', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 403) {
          console.log('⚠️ JWT authentication failed, clearing old tokens...');
          // Clear all auth data
          localStorage.clear();
          sessionStorage.clear();
          // Redirect to login
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, []);

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
          <TokenInspector />
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
            issues={formattedRecentIssues}
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