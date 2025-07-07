import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAuditTrail } from "@/services/issues/issueAuditService";
import { getFeedbackStatus } from "@/services/ticketFeedbackService";
import { Issue } from "@/types";
import { getEmployeeNameByUuid } from "@/services/issues/issueUtils";
import { Activity, Clock, AlertCircle, UserPlus, MessageSquare, Lock, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { websocketService } from "@/services/websocketService";
// Removed Supabase import - using PostgreSQL API

interface IssueActivityProps {
  issue: Issue;
}

interface PerformerInfo {
  name: string;
  role?: string;
  id: string;
}

// Helper function to safely access performer data from any type
const getPerformerFromJson = (details: any): PerformerInfo | null => {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return null;
  }

  const detailsObj = details as Record<string, any>;
  const performer = detailsObj.performer;
  
  if (!performer || typeof performer !== 'object' || Array.isArray(performer)) {
    return null;
  }
  
  const performerObj = performer as Record<string, any>;
  
  if (typeof performerObj.name !== 'string' || !performerObj.name) {
    return null;
  }
  
  return {
    name: performerObj.name,
    role: typeof performerObj.role === 'string' ? performerObj.role : undefined,
    id: typeof performerObj.id === 'string' ? performerObj.id : 'unknown'
  };
};

const IssueActivity = ({ issue }: IssueActivityProps) => {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasFeedback, setHasFeedback] = useState(false);
  
  // Function to fetch activity logs
  const fetchActivityLogs = async () => {
    if (!issue || !issue.id) {
      console.log('Issue not found');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const logs = await getAuditTrail(issue.id.toString());
      
      // Filter out duplicate logs - prioritize logs with performer info
      const uniqueLogsByAction = new Map();
      
      // First, sort logs to prioritize ones with performer info
      const sortedLogs = [...logs].sort((a, b) => {
        const aHasPerformer = getPerformerFromJson(a.details) !== null;
        const bHasPerformer = getPerformerFromJson(b.details) !== null;
        
        if (aHasPerformer && !bHasPerformer) return -1;
        if (!aHasPerformer && bHasPerformer) return 1;
        
        // If both have or don't have performer info, sort by created_at (newer first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      // Keep only the first (highest priority) log for each action+time combination
      sortedLogs.forEach(log => {
        const key = `${log.action}_${new Date(log.created_at).toISOString().slice(0, 16)}`;
        if (!uniqueLogsByAction.has(key)) {
          uniqueLogsByAction.set(key, log);
        }
      });
      
      const dedupedLogs = Array.from(uniqueLogsByAction.values());
      
      // Sort logs by created_at (newest first)
      dedupedLogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setActivityLogs(dedupedLogs);
      
      // Gather all unique employee IDs that don't have performer info
      const employeeIdsNeedingNames = dedupedLogs
        .filter(log => {
          const performer = getPerformerFromJson(log.details);
          return !performer && log.employeeId;
        })
        .map(log => log.employeeId);

      const uniqueEmployeeIds = Array.from(new Set(employeeIdsNeedingNames));
      
      // Get employee names for those without performer info
      const names: Record<string, string> = {};
      for (const employeeId of uniqueEmployeeIds) {
        const name = await getEmployeeNameByUuid(employeeId);
        names[employeeId] = name || "Suvidha";
      }
      
      setEmployeeNames(names);
      
      // Check for feedback - add safety check for status
      if (issue.status && (issue.status === "closed" || issue.status === "resolved")) {
        const feedbackExists = await getFeedbackStatus(issue.id.toString());
        setHasFeedback(feedbackExists);
        
        // Add a feedback activity log if feedback was submitted
        if (feedbackExists) {
          const feedbackLog = {
            id: 'feedback-' + issue.id,
            action: 'feedback_submitted',
            employeeId: issue.employeeId,
            created_at: new Date().toISOString(),
            details: null
          };
          
          // Add the feedback log to the activity logs
          setActivityLogs(prevLogs => [feedbackLog, ...prevLogs]);
        }
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time WebSocket integration for activity updates
  useEffect(() => {
    if (!issue?.id) return;

    const issueId = issue.id.toString();
    
    // Join the issue room for real-time updates
    websocketService.joinIssue(issueId);
    
    // Handle real-time comment updates
    const handleCommentAdded = (data: any) => {
      console.log('Real-time comment added:', data);
      // Refresh activity logs when new comment is added
      fetchActivityLogs();
    };
    
    // Handle real-time status updates
    const handleStatusUpdated = (data: any) => {
      console.log('Real-time status updated:', data);
      // Refresh activity logs when status changes
      fetchActivityLogs();
    };
    
    // Set up WebSocket event handlers
    websocketService.onCommentAdded(handleCommentAdded);
    websocketService.onStatusUpdated(handleStatusUpdated);
    
    // Cleanup function
    return () => {
      websocketService.removeHandler('comment_added');
      websocketService.removeHandler('status_updated');
      websocketService.leaveIssue();
    };
  }, [issue?.id]);

  // Initial load of activity logs
  useEffect(() => {
    if (issue?.id) {
      fetchActivityLogs();
    }
  }, [issue?.id]);
  
  // Helper to format date in IST timezone
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown time";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      // Format in IST timezone
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid Date";
    }
  };

  // Helper to get display text for activity log
  const getActivityLabel = (log: any) => {
    const performer = getPerformerFromJson(log.details);
    const employeeName = performer?.name || employeeNames[log.employeeId] || "Suvidha";
    
    switch (log.action) {
      case 'issue_created':
        return `Issue created by ${employeeName}`;
      case 'status_updated':
        return `Status updated by ${employeeName}`;
      case 'assigned':
        return `Issue assigned by ${employeeName}`;
      case 'comment_added':
        return `Comment added by ${employeeName}`;
      case 'internal_comment_added':
        return `Internal comment added by ${employeeName}`;
      case 'issue_reopened':
        return `Issue reopened by ${employeeName}`;
      case 'feedback_submitted':
        return `Feedback submitted by ${employeeName}`;
      default:
        return `${log.action.replace(/_/g, ' ')} by ${employeeName}`;
    }
  };

  // Helper to get activity icon
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'issue_created':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'status_updated':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'assigned':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      case 'internal_comment_added':
        return <Lock className="h-4 w-4 text-orange-500" />;
      case 'issue_reopened':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'feedback_submitted':
        return <CheckSquare className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Helper to get activity badge color
  const getActivityBadge = (action: string) => {
    switch (action) {
      case 'issue_created':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'status_updated':
        return "bg-green-100 text-green-800 border-green-200";
      case 'assigned':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'comment_added':
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 'internal_comment_added':
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 'issue_reopened':
        return "bg-red-100 text-red-800 border-red-200";
      case 'feedback_submitted':
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  // Helper to get simple action type for badge display
  const getSimpleActionType = (action: string): string => {
    if (!action || typeof action !== 'string') {
      return 'unknown action';
    }
    if (action.includes('status')) return 'status change';
    if (action.includes('assign')) return 'assignment';
    if (action.includes('internal_comment')) return 'internal comment added';
    if (action.includes('comment')) return 'comment added';
    if (action.includes('reopen')) return 'ticket reopened';
    if (action === 'feedback_submitted') return 'feedback received';
    return action.replace(/_/g, ' ');
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm italic text-center">
            No activity recorded yet
          </div>
        ) : (
          <div className="relative p-4 space-y-4 max-h-[350px] overflow-y-auto">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>
            
            {activityLogs.map((log, index) => {
              const performer = getPerformerFromJson(log.details);
              const employeeName = performer?.name || employeeNames[log.employeeId] || "Suvidha";
              
              return (
                <div 
                  key={log.id} 
                  className="relative flex gap-4 items-start animate-in slide-in-from-left duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Timeline node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                      log.action.includes('status') ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      log.action.includes('comment') ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      log.action.includes('assign') ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                      log.action.includes('internal') ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-gray-400 to-gray-600'
                    }`}>
                      <div className="text-white text-xs">
                        {getActivityIcon(log.action)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity card */}
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header with user and action */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{employeeName}</span>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${getActivityBadge(log.action)}`}
                          >
                            {getSimpleActionType(log.action)}
                          </Badge>
                        </div>
                        
                        {/* Activity description */}
                        <p className="text-sm text-gray-700 mb-2">{getActivityLabel(log)}</p>
                        
                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueActivity;