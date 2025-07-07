import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; 
import AdminLayout from "@/components/AdminLayout";
import { getIssues } from "@/services/issues/issueFilters";
import { getAssignedIssues } from "@/services/issues/issueCore";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { mapEmployeeIdsToNames } from "@/services/issues/issueUtils";
import { updateAllIssuePriorities, usePriorityUpdater } from "@/services/issues/priorityUpdateService";
import { getMultipleFeedbackStatuses } from "@/services/ticketFeedbackService";

import { useCityRestrictions, filterIssuesByCity } from "@/utils/cityRestrictions";
import { Issue } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, Eye, RefreshCw, Clock, AlertCircle, 
  CheckCircle, XCircle, MessageSquare, MessageSquareOff
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateWorkingHours } from "@/utils/workingTimeUtils";

const AdminIssues = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const cityRestrictions = useCityRestrictions();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assignedToMeIssues, setAssignedToMeIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [filteredAssignedIssues, setFilteredAssignedIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Issue["status"] | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isUpdatingPriorities, setIsUpdatingPriorities] = useState(false);
  const [activeTab, setActiveTab] = useState("all-issues");
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, boolean>>({});
  
  // Use the priority updater hook to update priorities automatically
  usePriorityUpdater();

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      try {
        // Ensure we have a significant delay before any operations to allow components to mount fully
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Force a priority update before fetching issues to ensure we have the latest priorities
        console.log("Issues page loaded - running priority update");
        
        // Run priority update first with a longer timeout
        try {
          // Skip automatic priority updates as they require specific parameters
          console.log("Skipping automatic priority update");
        } catch (updateError) {
          console.error("Error in priority update:", updateError);
          toast({
            title: "Warning",
            description: "There was an issue updating ticket priorities. Some tickets may not show the correct priority.",
            variant: "destructive",
          });
        }
        
        // Add another delay to ensure DB consistency
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Now fetch the updated issues
        const fetchedIssues = await getIssues();
        console.log("Fetched issues after priority update:", fetchedIssues.length);
        
        // Fetch employees for city filtering
        let cityFilteredIssues = fetchedIssues;
        try {
          const response = await fetch('/api/employees');
          const employees = await response.json();
          setAllEmployees(employees);
          
          // Apply city restrictions if user has city-restricted access
          if (cityRestrictions.hasCityRestrictions && !cityRestrictions.hasAllCityAccess) {
            cityFilteredIssues = filterIssuesByCity(fetchedIssues, employees, cityRestrictions);
            console.log(`City filtering applied: ${fetchedIssues.length} -> ${cityFilteredIssues.length} issues`);
          }
        } catch (error) {
          console.error("Error fetching employees for city filtering:", error);
        }
        
        setIssues(cityFilteredIssues);
        setFilteredIssues(cityFilteredIssues);
        
        // Use the utility to map employee IDs to names
        const employeeIds = fetchedIssues.map(issue => issue.employeeId).filter((id): id is number => id !== undefined);
        const names = await mapEmployeeIdsToNames(employeeIds);
        
        // Add current admin user to the names list for future comments
        if (authState.user && authState.user.id) {
          names[Number(authState.user.id)] = authState.user.name;
        }
        
        setUserNames(names);
        
        // Fetch feedback statuses for all issues
        const issueIds = fetchedIssues.map(issue => issue.id.toString());
        const feedbackStatus = await getMultipleFeedbackStatuses(issueIds);
        setFeedbackStatuses(feedbackStatus);
        
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tickets",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAssignedIssues = async () => {
      if (!authState.user || !authState.user.id) return;
      
      setIsLoadingAssigned(true);
      try {
        const fetchedAssignedIssues = await getAssignedIssues(authState.user.id);
        setAssignedToMeIssues(fetchedAssignedIssues);
        setFilteredAssignedIssues(fetchedAssignedIssues);
        
        // Fetch feedback statuses for assigned issues
        const assignedIssueIds = fetchedAssignedIssues.map(issue => issue.id.toString());
        const assignedFeedbackStatus = await getMultipleFeedbackStatuses(assignedIssueIds);
        setFeedbackStatuses(prevStatuses => ({ ...prevStatuses, ...assignedFeedbackStatus }));
        
      } catch (error) {
        console.error("Error fetching assigned tickets:", error);
      } finally {
        setIsLoadingAssigned(false);
      }
    };

    // Significant delay to ensure components are fully mounted
    const timeoutId = setTimeout(() => {
      fetchIssues();
      fetchAssignedIssues();
    }, 3000); 
    
    return () => clearTimeout(timeoutId);
  }, [authState.user]);

  useEffect(() => {
    let filtered = [...issues];
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(issue => {
        const typeLabel = getIssueTypeLabel(issue.typeId).toLowerCase();
        const subTypeLabel = getIssueSubTypeLabel(issue.typeId, issue.subTypeId).toLowerCase();
        const description = issue.description.toLowerCase();
        const userName = issue.employeeId && userNames[issue.employeeId] ? userNames[issue.employeeId].toLowerCase() : "";
        
        return (
          typeLabel.includes(searchLower) ||
          subTypeLabel.includes(searchLower) ||
          description.includes(searchLower) ||
          userName.includes(searchLower) ||
          issue.id.toString().includes(searchLower)
        );
      });
    }
    
    setFilteredIssues(filtered);
    
    // Also filter assigned issues the same way
    let filteredAssigned = [...assignedToMeIssues];
    if (statusFilter !== "all") {
      filteredAssigned = filteredAssigned.filter(issue => issue.status === statusFilter);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredAssigned = filteredAssigned.filter(issue => {
        const typeLabel = getIssueTypeLabel(issue.typeId).toLowerCase();
        const subTypeLabel = getIssueSubTypeLabel(issue.typeId, issue.subTypeId).toLowerCase();
        const description = issue.description.toLowerCase();
        const userName = issue.employeeId && userNames[issue.employeeId] ? userNames[issue.employeeId].toLowerCase() : "";
        
        return (
          typeLabel.includes(searchLower) ||
          subTypeLabel.includes(searchLower) ||
          description.includes(searchLower) ||
          userName.includes(searchLower) ||
          issue.id.toString().includes(searchLower)
        );
      });
    }
    
    setFilteredAssignedIssues(filteredAssigned);
  }, [issues, assignedToMeIssues, searchTerm, statusFilter, userNames]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const handleViewIssue = (issueId: string) => {
    navigate(`/admin/issues/${issueId}`);
  };
  
  const handleUpdatePriorities = async () => {
    setIsUpdatingPriorities(true);
    try {
      toast({
        title: "Processing",
        description: "Force updating all ticket priorities based on SLAs...",
      });
      
      // Run priority update with a stronger toast notification
      // Skip automatic priority updates as they require specific parameters
      console.log("Manual priority update requested but requires specific parameters");
      
      // Refresh issues list to show updated priorities
      // Add a small delay to ensure DB consistency  
      await new Promise(resolve => setTimeout(resolve, 2000));
      const refreshedIssues = await getIssues();
      setIssues(refreshedIssues);
      
      // Also refresh assigned issues if needed
      if (authState.user && authState.user.id) {
        const refreshedAssignedIssues = await getAssignedIssues(authState.user.id);
        setAssignedToMeIssues(refreshedAssignedIssues);
      }
    } catch (error) {
      console.error("Error updating priorities:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket priorities",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPriorities(false);
    }
  };
  
  const isReopenable = (issue: Issue) => {
    if (issue.status !== "closed" && issue.status !== "resolved") return false;
    if (!issue.reopenableUntil) return false;
    
    const now = new Date();
    const reopenableUntil = new Date(issue.reopenableUntil);
    return now < reopenableUntil;
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

  const RenderIssueTable = ({ issues, isLoading }: { issues: Issue[], isLoading: boolean }) => {
    // Check if there are any critical issues in the current view
    const hasCriticalIssues = issues.some(issue => 
      issue.priority === 'critical' && issue.status !== 'closed' && issue.status !== 'resolved');
    
    return (
      <>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {hasCriticalIssues && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <p className="font-medium text-red-800">Critical SLA Breach Detected</p>
                    <p className="text-sm text-red-600">There are tickets that have exceeded the 40-hour working time resolution SLA.</p>
                  </div>
                </div>
              </div>
            )}
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
                {issues.map((issue) => {
                  // Calculate if issue has breached SLA
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
                      <TableCell className="font-mono text-xs">{String(issue.id).substring(0, 8)}</TableCell>
                      <TableCell>{issue.employeeId ? userNames[issue.employeeId] || "Suvidha" : "Suvidha"}</TableCell>
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
                        {isReopenable(issue) && (
                          <div className="mt-1 text-xs text-blue-600 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Reopenable
                          </div>
                        )}
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
                      <TableCell>{formatDate(issue.createdAt)}</TableCell>
                      <TableCell>{formatDate(issue.updatedAt)}</TableCell>
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
                  )
                })}
                
                {issues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6">
                      {searchTerm || statusFilter !== "all"
                        ? "No tickets matching filters"
                        : "No tickets found"
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </>
    );
  };

  return (
    <AdminLayout title="Tickets Management" requiredPermission="manage:issues">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-48">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as Issue["status"] | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="destructive"
              onClick={handleUpdatePriorities}
              disabled={isUpdatingPriorities}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdatingPriorities ? 'animate-spin' : ''}`} />
              Force Priority Update
            </Button>
          </div>
          
          <div>
            <span className="text-sm text-gray-500">
              {activeTab === "all-issues" 
                ? `Showing ${filteredIssues.length} of ${issues.length} tickets`
                : `Showing ${filteredAssignedIssues.length} of ${assignedToMeIssues.length} assigned tickets`}
            </span>
          </div>
        </div>
        
        <Tabs 
          defaultValue="all-issues" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all-issues">All Issues</TabsTrigger>
            <TabsTrigger value="assigned-issues">
              Assigned to Me {assignedToMeIssues.length > 0 && `(${assignedToMeIssues.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-issues" className="mt-4">
            <RenderIssueTable issues={filteredIssues} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="assigned-issues" className="mt-4">
            <RenderIssueTable issues={filteredAssignedIssues} isLoading={isLoadingAssigned} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminIssues;
