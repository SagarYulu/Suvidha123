
import { useState } from "react";
import { Issue } from "@/types";
import { updateIssueStatus } from "@/services/issues/issueStatusService";
import { toast } from "@/hooks/use-toast";

export const useIssueStatus = (
  issueId: string | undefined, 
  issue: Issue | null, 
  initialStatus: Issue["status"], 
  currentUserId: string,
  setIssue: (issue: Issue) => void
) => {
  const [status, setStatus] = useState<Issue["status"]>(initialStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: Issue["status"]) => {
    if (!issueId || !issue || status === newStatus) return;
    
    // Ensure issueId is a valid string
    const validIssueId = String(issueId);
    if (!validIssueId || validIssueId === 'undefined' || validIssueId === 'null') {
      console.error('Invalid issue ID:', issueId);
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      const updatedIssue = await updateIssueStatus(validIssueId, newStatus, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setStatus(newStatus);
        toast({
          title: "Success",
          description: `Ticket status updated to ${newStatus.replace("_", " ")}`,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return {
    status,
    setStatus,
    isUpdatingStatus,
    handleStatusChange
  };
};
