
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from "@/services/issues/issueAnalyticsService";
import { getIssues, IssueFilters } from "@/services/issues/issueFilters";
import { getUsers } from "@/services/userService";
import { toast } from "sonner";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export const useDashboardData = () => {
  // Initialize with null values for all filter fields
  const [filters, setFilters] = useState<IssueFilters>({
    city: null,
    cluster: null,
    issueType: null
  });
  
  // Query for issues data with proper caching
  const { 
    data: issues = [], 
    isLoading: isIssuesLoading,
    refetch: refetchIssues,
    error: issuesError
  } = useQuery({
    queryKey: ['issues', filters],
    queryFn: async () => {
      const result = await getIssues(filters);
      return result;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - much longer caching
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
  
  // Query for analytics data with proper caching - making sure to use the fresh filters
  const { 
    data: analytics, 
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      return getAnalytics(filters);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - much longer caching
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
  
  // Query for users data with proper caching
  const { 
    data: users = [], 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    staleTime: 30 * 60 * 1000, // 30 minutes - much longer caching
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
  
  // React Query automatically handles refetching when filters change due to queryKey dependency
  // No need for manual refetch effects

  // Display errors if they occur
  useEffect(() => {
    if (issuesError) {
      console.error("Error fetching issues:", issuesError);
      toast.error("Failed to load issues data");
    }
    
    if (analyticsError) {
      console.error("Error fetching analytics:", analyticsError);
      toast.error("Failed to load analytics data");
    }
  }, [issuesError, analyticsError]);
  
  // Memoize these calculations to prevent recalculations on re-renders
  const recentIssues = useMemo(() => {
    const sortedIssues = [...issues].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedIssues.slice(0, 5);
  }, [issues]);
  
  const userCount = useMemo(() => {
    return users.filter(user => user.role === "employee").length;
  }, [users]);
  
  // Memoize chart data to prevent recalculations
  const typePieData = useMemo(() => {
    if (!analytics?.typeCounts) {
      return [];
    }
    return Object.entries(analytics.typeCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [analytics]);
  
  const cityBarData = useMemo(() => {
    if (!analytics?.cityCounts) {
      return [];
    }
    return Object.entries(analytics.cityCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [analytics]);
  
  // Improved filter change handler with consistent state management
  const handleFilterChange = useCallback((newFilters: IssueFilters) => {
    console.log("Filter change requested:", newFilters);
    
    // Update all filters at once to ensure consistency
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      // Update city if specified
      if ('city' in newFilters) {
        updatedFilters.city = newFilters.city;
        // If city changes, reset cluster
        if (newFilters.city !== prevFilters.city) {
          updatedFilters.cluster = null;
        }
      }
      
      // Update cluster if specified
      if ('cluster' in newFilters) {
        updatedFilters.cluster = newFilters.cluster;
      }
      
      // Update issueType if specified
      if ('issueType' in newFilters) {
        updatedFilters.issueType = newFilters.issueType;
      }
      
      console.log("Setting new filters:", updatedFilters);
      return updatedFilters;
    });
  }, []);

  const isLoading = isAnalyticsLoading || isIssuesLoading || isUsersLoading;

  return {
    analytics,
    recentIssues,
    isLoading,
    userCount,
    filters,
    handleFilterChange,
    typePieData,
    cityBarData,
    issues
  };
};
