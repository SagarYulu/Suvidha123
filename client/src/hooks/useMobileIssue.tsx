import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/types";
import { getIssueById, addComment } from "@/services/issueService";
import { getUserById } from "@/services/userService";
import { toast } from "@/hooks/use-toast";
import { formatDate, getStatusBadgeColor } from "@/utils/formatUtils";
import { isTicketReopenable } from "@/utils/workingTimeUtils";
import { useIssueReopenMobile } from "@/hooks/issues/useIssueReopenMobile";

export function useMobileIssue(issueId: string | undefined) {
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  
  const currentUserId = authState.user?.id || "";
  
  // Add reopen ticket functionality
  const {
    isReopeningTicket,
    processReopenTicket
  } = useIssueReopenMobile(issueId, currentUserId, setIssue);
  
  // Check if ticket is reopenable
  const isReopenable = issue && 
    (issue.status === 'closed' || issue.status === 'resolved') && 
    issue.closedAt && 
    isTicketReopenable(issue.closedAt);

  useEffect(() => {
    const fetchIssue = async () => {
      if (!issueId) return;
      
      setIsLoading(true);
      try {
        const issueData = await getIssueById(issueId);
        if (!issueData) {
          setErrorMessage("Issue not found");
          return;
        }
        
        // Check permission - compare employee ID as numbers
        const userIdNum = Number(authState.user?.id || 0);
        const issueEmployeeIdNum = Number(issueData.employeeId || 0);
        
        console.log(`Mobile access check - User ID: ${userIdNum}, Issue Employee ID: ${issueEmployeeIdNum}`);
        
        if (issueEmployeeIdNum !== userIdNum) {
          console.log(`Mobile access denied: Employee ${userIdNum} cannot access issue created by employee ${issueEmployeeIdNum}`);
          setErrorMessage("You do not have permission to view this issue");
          return;
        }
        
        console.log(`Mobile access granted: Employee ${userIdNum} can access their own issue`);
        
        setIssue(issueData);
        console.log("Fetched issue data:", issueData);
        
        // Extract commenter names from the comment data (if available from backend)
        const names: Record<string, string> = {};
        issueData.comments.forEach(comment => {
          if (comment.employeeId) {
            // Use a placeholder name for now - the backend should provide commenter names
            names[comment.employeeId.toString()] = `Employee ${comment.employeeId}`;
          }
        });
        
        setCommenterNames(names);
      } catch (error) {
        console.error("Error fetching issue:", error);
        setErrorMessage("An error occurred while fetching the issue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [issueId, authState.user?.id]);

  useEffect(() => {
    // Poll for updates every 30 seconds to get new comments
    const intervalId = setInterval(async () => {
      if (issueId && issue) {
        try {
          const refreshedIssue = await getIssueById(issueId);
          
          if (refreshedIssue && refreshedIssue.comments.length !== issue?.comments.length) {
            console.log("Refreshed issue with updated comments:", refreshedIssue);
            setIssue(refreshedIssue);
            
            // Update commenter names from comment data (no additional API calls)
            const names: Record<string, string> = { ...commenterNames };
            refreshedIssue.comments.forEach(comment => {
              if (comment.employeeId) {
                // Use a placeholder name for now - the backend should provide commenter names
                names[comment.employeeId.toString()] = `Employee ${comment.employeeId}`;
              }
            });
            setCommenterNames(names);
          }
        } catch (error) {
          console.error("Error polling for updates:", error);
        }
      }
    }, 60000); // Poll every 60 seconds instead of 30 (better performance)
    
    return () => clearInterval(intervalId);
  }, [issueId, issue]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user?.id || !issueId) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Adding comment as user:", authState.user.id);
      
      const comment = await addComment(Number(issueId), authState.user.id, newComment.trim());
      
      if (comment) {
        // Fetch the updated issue to get all comments
        const updatedIssue = await getIssueById(Number(issueId));
        if (updatedIssue) {
          console.log("Updated issue after adding comment:", updatedIssue);
          setIssue(updatedIssue);
          setNewComment("");
          toast({
            title: "Success",
            description: "Comment added successfully",
          });
          
          // Update commenter names
          if (authState.user && !commenterNames[authState.user.id.toString()]) {
            setCommenterNames(prev => ({
              ...prev,
              [authState.user!.id.toString()]: authState.user!.name,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    issue,
    isLoading,
    errorMessage,
    newComment,
    setNewComment,
    isSubmitting,
    commenterNames,
    handleSubmitComment,
    getStatusBadgeColor,
    formatDate,
    currentUserId,
    isReopenable,
    processReopenTicket
  };
}
