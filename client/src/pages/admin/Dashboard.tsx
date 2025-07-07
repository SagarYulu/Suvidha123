import React from "react";
import AdminLayout from "@/components/AdminLayout";
import FilterBar from "@/components/dashboard/FilterBar";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import ChartSection from "@/components/dashboard/ChartSection";
import RecentTicketsTable from "@/components/dashboard/RecentTicketsTable";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatConsistentIssueData } from "@/services/issues/issueProcessingService";

const Dashboard = () => {
  const { 
    analytics,
    recentIssues,
    isLoading,
    isFetching,
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



  // Show loader only on initial load when we have no data at all
  const showLoader = isLoading && !analytics && !recentIssues && !typePieData.length;

  return (
    <AdminLayout title="Dashboard">
      {showLoader ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-6">
          {/* Pass current filters to FilterBar to ensure UI stays in sync */}
          <FilterBar 
            onFilterChange={handleFilterChange}
            initialFilters={filters} 
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

export default Dashboard;