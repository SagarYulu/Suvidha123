
import { Issue } from "@/types";
import { processIssues } from "./issueCore";
import { apiClient } from "../apiClient";

// Define filter types
export type IssueFilters = {
  city: string | null;
  cluster: string | null;
  issueType: string | null;
};

/**
 * Gets issues based on specified filters
 * 
 * Database mapping notes:
 * - In the issues table, `id` is the unique issue identifier
 * - In the issues table, `employee_id` contains the employee's ID (maps to employees.id)
 * 
 * @param filters Optional filters for city, cluster, and issue type
 * @returns Processed list of issues
 */
export const getIssues = async (filters?: IssueFilters): Promise<Issue[]> => {
  try {
    console.log("getIssues called with filters:", filters);
    
    // If no filters provided or all filters are null, return all issues
    if (!filters || (!filters.city && !filters.cluster && !filters.issueType)) {
      console.log("No filters applied, fetching all issues");
      
      // Get all issues from API
      const dbIssues = await apiClient.getIssues();
      
      if (!dbIssues) {
        console.error('No issues data received from API');
        return [];
      }
      
      console.log(`Fetched ${dbIssues.length} issues from API`);
      
      // Process issues with comments and return
      return await processIssues(dbIssues || []);
    }
    
    // At least one filter is active, so we need to apply filtering
    let employeeIds: number[] = [];
    let shouldFilterByEmployees = false;
    
    // Only query employees if city or cluster filter is active
    if (filters.city || filters.cluster) {
      console.log("Applying city/cluster filter");
      shouldFilterByEmployees = true;
      
      // Get employees from API
      const allEmployees = await apiClient.getEmployees();
      
      // Filter employees by city and/or cluster
      let filteredEmployees = allEmployees;
      
      if (filters.city) {
        console.log("Filtering employees by city:", filters.city);
        filteredEmployees = filteredEmployees.filter((emp: any) => emp.city === filters.city);
      }
      
      if (filters.cluster) {
        console.log("Filtering employees by cluster:", filters.cluster);
        filteredEmployees = filteredEmployees.filter((emp: any) => emp.cluster === filters.cluster);
      }
      
      // Extract employee IDs from filtered employees
      employeeIds = filteredEmployees?.map((emp: any) => emp.id) || [];
      console.log(`Found ${employeeIds.length} employees matching the city/cluster filters with IDs:`, employeeIds);
      
      // If filtering by city/cluster but no matching employees found, return empty result
      if (employeeIds.length === 0) {
        console.log("No employees match the city/cluster criteria, returning empty result");
        return [];
      }
    }
    
    // Get all issues from API first
    let dbIssues = await apiClient.getIssues();
    
    // Apply employee_id filter if needed
    if (shouldFilterByEmployees && employeeIds.length > 0) {
      console.log("Applying employee_id filter with employee IDs:", employeeIds);
      dbIssues = dbIssues.filter((issue: any) => employeeIds.includes(issue.employeeId));
    }
    
    // Filter by issue type if specified
    if (filters.issueType) {
      console.log("Filtering by issue type:", filters.issueType);
      dbIssues = dbIssues.filter((issue: any) => issue.typeId === filters.issueType);
    }
    
    console.log(`Found ${dbIssues?.length || 0} issues matching the filters`);
    
    // Process issues with comments and return
    return await processIssues(dbIssues || []);
  } catch (error) {
    console.error('Error in getIssues:', error);
    return [];
  }
};
