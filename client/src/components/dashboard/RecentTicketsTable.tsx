
import React, { memo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Issue } from "@/types";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
// Removed API client dependency - using fetch directly
import { getMultipleFeedbackStatuses } from "@/services/ticketFeedbackService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Eye, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { calculateWorkingHours } from "@/utils/workingTimeUtils";

type RecentTicketsTableProps = {
  recentIssues: Issue[];
  isLoading: boolean;
};

// Using memo to prevent unnecessary re-renders
const RecentTicketsTable = memo(({ recentIssues, isLoading }: RecentTicketsTableProps) => {
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, boolean>>({});
  const navigate = useNavigate(); // Add navigate hook

  // Fetch employee names when issues change
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      if (!recentIssues || recentIssues.length === 0) return;
      
      console.log("Starting to fetch employee names for issues:", recentIssues);
      
      // Get unique employee IDs
      const uniqueEmployeeIds = Array.from(new Set(recentIssues.map(issue => issue.employeeId)));
      console.log("Unique employee IDs to fetch:", uniqueEmployeeIds);
      
      // Fetch names for each unique employee ID
      const names: Record<string, string> = {};
      
      for (const employeeId of uniqueEmployeeIds) {
        try {
          if (!employeeId) {
            names[""] = "Unknown"; 
            continue;
          }

          // Convert to string for consistent key handling
          const employeeIdStr = employeeId.toString();
          
          // Special handling for system users (legacy support)
          if (employeeIdStr === "system" || employeeIdStr === "admin-fallback") {
            names[employeeIdStr] = employeeIdStr === "system" ? "System" : "Admin";
            continue;
          }

          // Simple fetch call instead of complex API client
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/employees/${employeeIdStr}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const employee = await response.json();
              names[employeeIdStr] = employee.name;
              console.log(`Fetched employee ${employeeIdStr}: ${employee.name}`);
            } else {
              names[employeeIdStr] = "Suvidha";
              console.log(`Failed to fetch employee ${employeeIdStr}:`, response.status);
            }
          } catch (fetchError) {
            console.error(`Fetch error for employee ${employeeIdStr}:`, fetchError);
            names[employeeIdStr] = "Suvidha";
          }
        } catch (error) {
          console.error(`Error fetching name for employee ${employeeId}:`, error);
          names[employeeId.toString()] = "Suvidha";
        }
      }
      
      setEmployeeNames(names);
    };
    
    const fetchFeedbackStatuses = async () => {
      if (recentIssues.length === 0) return;
      
      // Get all issue IDs - convert to strings for API compatibility
      const issueIds = recentIssues.map(issue => issue.id.toString());
      
      // Fetch feedback statuses
      const statuses = await getMultipleFeedbackStatuses(issueIds);
      setFeedbackStatuses(statuses);
    };
    
    fetchEmployeeNames();
    fetchFeedbackStatuses();
  }, [recentIssues]);

  // Function to handle viewing issue details
  const handleViewIssue = (issueId: string) => {
    console.log("Navigating to issue:", issueId);
    if (issueId) {
      navigate(`/admin/issues/${issueId}`);
    }
  };

  // Get status badge class based on status value - UPDATED to match Issues page
  const getStatusBadgeClass = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge class - UPDATED to match Issues page
  const getPriorityBadgeClass = (priority: string, status: string) => {
    // Don't show priority for closed/resolved tickets
    if (status === "closed" || status === "resolved") {
      return "bg-gray-100 text-gray-800 opacity-50";
    }
    
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800 animate-pulse";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to check if a closed/resolved ticket adhered to SLA or breached it
  const getSlaAdherence = (issue: Issue) => {
    // Only check SLA adherence for closed/resolved tickets
    if (issue.status !== "closed" && issue.status !== "resolved") {
      return null;
    }

    // If closedAt timestamp is missing, we can't determine SLA adherence
    if (!issue.closedAt || !issue.createdAt) {
      return {
        status: "unknown",
        text: "N/A"
      };
    }

    // Calculate working hours between creation and closure
    const resolutionTime = calculateWorkingHours(issue.createdAt, issue.closedAt);
    
    // Check if resolution time exceeded SLA thresholds
    // Critical SLA: 40 hours, High SLA: 24 hours, Medium SLA: 16 hours
    let breached = false;
    
    // Check specific issue types that might have different SLAs
    const highPriorityTypes = ['health', 'insurance', 'advance', 'esi', 'medical'];
    const isHighPriorityType = issue.typeId && highPriorityTypes.some(type => issue.typeId.toLowerCase().includes(type));
    
    if (isHighPriorityType && resolutionTime > 24) {
      breached = true;
    } else if (issue.typeId.toLowerCase().includes('facility') && resolutionTime > 24) {
      breached = true;
    } else if (resolutionTime > 40) { // Critical SLA
      breached = true;
    }
    
    return {
      status: breached ? "breached" : "adhered",
      text: breached ? "SLA Breached" : "Closed within TAT",
      hours: resolutionTime.toFixed(1)
    };
  };

  // Get feedback status badge and icon
  const getFeedbackStatusBadge = (issueId: string) => {
    const hasFeedback = feedbackStatuses[issueId];
    
    return (
      <div className="flex items-center gap-1">
        {hasFeedback ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-600">Received</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Pending</span>
          </>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {recentIssues.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>SLA Adherence</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIssues.map((issue) => {
                  // Check if issue has breached SLA
                  const isBreachedSLA = issue.priority === 'critical' && 
                    issue.status !== 'closed' && 
                    issue.status !== 'resolved';
                  
                  // Get SLA adherence for closed/resolved tickets
                  const slaAdherence = getSlaAdherence(issue);
                  
                  return (
                    <TableRow 
                      key={issue.id}
                      className={isBreachedSLA ? "bg-red-50" : undefined}
                    >
                      <TableCell className="font-mono text-xs">{issue.id}</TableCell>
                      <TableCell>{employeeNames[issue.employeeId.toString()] || "Suvidha"}</TableCell>
                      <TableCell>
                        <div>
                          <div>{getIssueTypeLabel(issue.typeId)}</div>
                          <div className="text-xs text-gray-500">
                            {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {issue.description}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(issue.status === "closed" || issue.status === "resolved") ? (
                          <span className="text-xs text-gray-500 italic">N/A</span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(issue.priority, issue.status)}`}>
                            {issue.priority === 'critical' ? "CRITICAL" : issue.priority}
                            {isBreachedSLA && (
                              <span className="block text-xs text-red-600 font-medium mt-1">
                                SLA Breach
                              </span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {slaAdherence ? (
                          <div className="flex items-center">
                            {slaAdherence.status === "breached" ? (
                              <div className="flex items-center">
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-xs text-red-600">{slaAdherence.text}</span>
                              </div>
                            ) : slaAdherence.status === "adhered" ? (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-xs text-green-600">{slaAdherence.text}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">N/A</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(issue.status === "closed" || issue.status === "resolved") ? 
                          getFeedbackStatusBadge(issue.id.toString()) : 
                          <span className="text-xs text-gray-500">N/A</span>
                        }
                      </TableCell>
                      <TableCell>
                        {formatDate(issue.createdAt)}
                      </TableCell>
                      <TableCell>
                        {formatDate(issue.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewIssue(issue.id.toString())}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {recentIssues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6">
                      No tickets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No recent tickets found
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Display name for debugging
RecentTicketsTable.displayName = 'RecentTicketsTable';

export default RecentTicketsTable;
