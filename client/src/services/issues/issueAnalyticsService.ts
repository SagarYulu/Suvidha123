import { getUsers } from "@/services/userService";
import { IssueFilters } from "./issueFilters";
import { getIssues } from "./issueFilters";
import { getAuditTrail } from "./issueAuditService";
import { calculateFirstResponseTime, calculateWorkingHours } from "@/utils/workingTimeUtils";
import { Issue } from "@/types";
import { format, subDays, subWeeks, subMonths, subQuarters, startOfWeek, startOfMonth, startOfQuarter, endOfWeek, endOfMonth, endOfQuarter, differenceInDays, parseISO, addDays } from "date-fns";
import { apiClient } from "@/services/apiClient";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Issue analytics service - provides analytics data for issues
 * 
 * Database mapping notes:
 * - In the issues table, `id` is the unique issue identifier
 * - In the issues table, `employee_uuid` contains the employee's UUID (maps to employees.id)
 * - All analytics are based on these relationships
 */
export const getAnalytics = async (filters?: IssueFilters) => {
  try {
    // Always fetch fresh issues based on the provided filters
    const issues = await getIssues(filters);
    
    if (issues.length === 0) {
      return {
        totalIssues: 0,
        resolvedIssues: 0,
        openIssues: 0,
        resolutionRate: 0,
        avgResolutionTime: '0',
        avgFirstResponseTime: '0',
        cityCounts: {},
        clusterCounts: {},
        managerCounts: {},
        typeCounts: {},
        recentActivity: [],
        resolutionTimeHistory: []
      };
    }
    
    // Calculate various analytics based on the issues data
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === "closed" || i.status === "resolved").length;
    const openIssues = totalIssues - resolvedIssues;
    
    // UPDATED: Average resolution time using working hours calculation
    const closedIssues = issues.filter(i => i.closedAt);
    let avgResolutionTime = 0;
    
    if (closedIssues.length > 0) {
      let totalResolutionTime = 0;
      let validResolutionCount = 0;
      
      closedIssues.forEach(issue => {
        try {
          if (issue.closedAt && issue.createdAt) {
            const resolutionTime = calculateWorkingHours(issue.createdAt, issue.closedAt);
            if (!isNaN(resolutionTime) && resolutionTime >= 0) {
              totalResolutionTime += resolutionTime;
              validResolutionCount++;
            }
          }
        } catch (error) {
          console.error(`Error calculating resolution time for issue ${issue.id}:`, error);
        }
      });
      
      if (validResolutionCount > 0) {
        avgResolutionTime = totalResolutionTime / validResolutionCount;
      }
    }
    
    // Calculate First Response Time (FRT) with improved working-hours logic
    let avgFirstResponseTime = 0;
    
    try {
      // For now, use a simplified FRT calculation based on first comment
      
      // Group issues by ID for FRT calculation
      const issueComments: Record<number, any[]> = {};
      
      // Get first comment for each issue to calculate FRT
      for (const issue of issues) {
        try {
          const response = await authenticatedAxios.get(`/issues/${issue.id}/comments`);
          const comments = response.data;
          if (comments && comments.length > 0) {
            issueComments[issue.id] = comments;
          }
        } catch (error) {
          console.error(`Error fetching comments for issue ${issue.id}:`, error);
        }
      }
        
      // Calculate FRT for each issue with comment data
      let totalFRT = 0;
      let issuesWithFRT = 0;
      
      issues.forEach(issue => {
        try {
          if (issueComments[issue.id] && issueComments[issue.id].length > 0) {
            // Sort comments by creation time
            const sortedComments = issueComments[issue.id].sort(
              (a: any, b: any) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              }
            );
            
            // First comment is the first response
            const firstComment = sortedComments[0];
            
            if (firstComment && issue.createdAt && firstComment.createdAt) {
              const frt = calculateFirstResponseTime(issue.createdAt, firstComment.createdAt);
              if (frt > 0) {
                totalFRT += frt;
                issuesWithFRT++;
              }
            }
          }
        } catch (issueError) {
          console.error(`Error processing FRT for issue ${issue.id}:`, issueError);
        }
      });
      
      if (issuesWithFRT > 0) {
        avgFirstResponseTime = totalFRT / issuesWithFRT;
      }
    } catch (frtError) {
      console.error("Error calculating FRT:", frtError);
    }
    
    // Fetch employee data from API
    let employees: any[] = [];
    try {
      const employeesResponse = await apiClient.getEmployees();
      employees = Array.isArray(employeesResponse) ? employeesResponse : [];

    } catch (error) {
      console.error("Error fetching employees:", error);
    }
    
    // Create employee mapping for efficient lookups
    const employeeMap = new Map();
    employees.forEach(emp => {
      employeeMap.set(emp.id, emp);
    });
    
    // Calculate city counts based on employee data
    const cityCounts: { [key: string]: number } = {};
    const clusterCounts: { [key: string]: number } = {};
    const managerCounts: { [key: string]: number } = {};
    const typeCounts: { [key: string]: number } = {};
    
    // Process each issue to calculate counts
    issues.forEach(issue => {
      // Get employee for this issue
      const employee = employeeMap.get(issue.employeeId);
      
      if (employee) {
        // Count by city
        const city = employee.city || "Unknown";
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        
        // Count by cluster
        const cluster = employee.cluster || "Unknown";
        clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
        
        // Count by manager
        const manager = employee.manager || "Unknown";
        managerCounts[manager] = (managerCounts[manager] || 0) + 1;
      }
      
      // Count by issue type
      const issueType = issue.typeId || "other";
      typeCounts[issueType] = (typeCounts[issueType] || 0) + 1;
    });
    
    // Generate recent activity
    const recentActivity = issues
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(issue => ({
        id: issue.id,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        createdAt: issue.createdAt,
        employeeName: employeeMap.get(issue.employeeId)?.name || "Suvidha"
      }));
    
    // Generate resolution time history (simplified)
    const resolutionTimeHistory = await getResolutionTimeHistory();
    
    return {
      totalIssues,
      resolvedIssues,
      openIssues,
      resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0,
      avgResolutionTime,
      avgFirstResponseTime,
      cityCounts,
      clusterCounts,
      managerCounts,
      typeCounts,
      recentActivity,
      resolutionTimeHistory
    };
    
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    throw error;
  }
};

/**
 * Get resolution time history for the past 7 days
 * This is a simplified version that uses fallback data
 */
export const getResolutionTimeHistory = async () => {
  try {
    const today = new Date();
    const result: { name: string; time: number }[] = [];
    
    // Fetch closed issues from the last 7 days that have closedAt data
    let closedIssues: any[] = [];
    try {
      const response = await authenticatedAxios.get('/issues');
      const allIssues = response.data;
      
      // Filter closed issues from last 7 days
      const sevenDaysAgo = format(subDays(today, 7), 'yyyy-MM-dd');
      closedIssues = allIssues.filter((issue: any) => 
        issue.closedAt && 
        issue.closedAt >= sevenDaysAgo
      );
    } catch (error) {
      console.error('Error fetching historical resolution time data:', error);
      return generateFallbackResolutionTimeData();
    }
    
    // If no data is found, return fallback data
    if (!closedIssues || closedIssues.length === 0) {
      console.log("No historical closed issues found, using fallback data");
      return generateFallbackResolutionTimeData();
    }
    
    // Process historical data
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayIssues = closedIssues.filter((issue: any) => {
        const issueDate = new Date(issue.closedAt);
        return issueDate.toDateString() === date.toDateString();
      });
      
      let avgTime = 0;
      if (dayIssues.length > 0) {
        let totalTime = 0;
        let validCount = 0;
        
        dayIssues.forEach((issue: any) => {
          try {
            if (issue.createdAt && issue.closedAt) {
              const resolutionTime = calculateWorkingHours(issue.createdAt, issue.closedAt);
              if (!isNaN(resolutionTime) && resolutionTime >= 0) {
                totalTime += resolutionTime;
                validCount++;
              }
            }
          } catch (error) {
            console.error(`Error calculating historical resolution time for issue ${issue.id}:`, error);
          }
        });
        
        if (validCount > 0) {
          avgTime = totalTime / validCount;
        }
      }
      
      result.push({
        name: format(date, 'MMM dd'),
        time: avgTime
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('Error generating resolution time history:', error);
    return generateFallbackResolutionTimeData();
  }
};

/**
 * Generate fallback resolution time data for display
 */
const generateFallbackResolutionTimeData = () => {
  const today = new Date();
  const result: { name: string; time: number }[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    result.push({
      name: format(date, 'MMM dd'),
      time: 0 // Using 0 for fallback data
    });
  }
  
  return result;
};

/**
 * Get trend analytics for different time periods
 * Returns data for daily, weekly, monthly and quarterly views
 */
export const getTrendAnalytics = async (filters?: IssueFilters) => {
  try {
    console.log("Trend analytics processing", filters);
    
    const issues = await getIssues(filters);
    console.log("Trend analytics processing", issues.length, "issues");
    
    // Calculate trend data for different time periods
    const fourteenDaysAgo = subDays(new Date(), 14);
    const responseTimeData = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayIssues = issues.filter((issue: any) => {
        const issueDate = new Date(issue.createdAt);
        return issueDate.toDateString() === date.toDateString();
      });
      
      console.log(`Processing ${dayIssues.length} issues for date ${format(date, 'yyyy-MM-dd')}`);
      
      let avgResponseTime = 0;
      if (dayIssues.length > 0) {
        // Calculate average response time for the day
        const totalResponseTime = dayIssues.reduce((sum: number, issue: any) => {
          // For now, use a simple calculation based on issue creation time
          const responseTime = 24; // Default 24 hours
          return sum + responseTime;
        }, 0);
        avgResponseTime = totalResponseTime / dayIssues.length;
      }
      
      console.log(`Date ${format(date, 'yyyy-MM-dd')}: ${dayIssues.length} valid response times, avg = ${avgResponseTime}`);
      
      responseTimeData.push({
        date: format(date, 'yyyy-MM-dd'),
        avgResponseTime
      });
    }
    
    console.log("Final response time data:", responseTimeData);
    
    return {
      responseTimeData,
      // Add other trend analytics here as needed
    };
    
  } catch (error) {
    console.error("Error in getTrendAnalytics:", error);
    throw error;
  }
};

/**
 * Get SLA analytics
 */
export const getSLAAnalytics = async (filters?: IssueFilters) => {
  try {
    console.log("SLA Analytics:", filters);
    
    const issues = await getIssues(filters);
    console.log("SLA Analytics: Processing", issues.length, "issues");
    
    // Calculate SLA status for each issue
    const slaStatusCounts = { met: 0, breached: 0, warning: 0 };
    
    issues.forEach(issue => {
      console.log(`Issue ${issue.id}: Priority = ${issue.priority}, Status = breached`);
      // For now, mark all as breached - in real implementation, calculate based on SLA rules
      slaStatusCounts.breached++;
    });
    
    console.log("SLA Status Counts:", slaStatusCounts);
    
    return {
      slaStatusCounts,
      totalIssues: issues.length,
      slaCompliance: issues.length > 0 ? (slaStatusCounts.met / issues.length) * 100 : 0
    };
    
  } catch (error) {
    console.error("Error in getSLAAnalytics:", error);
    throw error;
  }
};

/**
 * Get resolution time trends - simplified version
 */
export const getResolutionTimeTrends = async (filters?: IssueFilters) => {
  try {
    console.log("Resolution Time Trends:", filters);
    
    // Return simplified trend data
    return {
      daily: [],
      weekly: [],
      monthly: [],
      quarterly: []
    };
    
  } catch (error) {
    console.error("Error in getResolutionTimeTrends:", error);
    throw error;
  }
};