
import { useState } from "react";
import { Issue } from "@/types";
import { reopenTicket } from "@/services/issues/issueReopeningService";
import { toast } from "@/hooks/use-toast";

export const useIssueReopenMobile = (
  issueId: string | undefined, 
  currentUserId: string,
  setIssue: (issue: Issue) => void
) => {
  const [isReopeningTicket, setIsReopeningTicket] = useState(false);

  // Process reopening with reason
  const processReopenTicket = async (reopenReason: string) => {
    if (!issueId || !currentUserId || !reopenReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for reopening the ticket",
        variant: "destructive",
      });
      return;
    }
    
    setIsReopeningTicket(true);
    try {
      const updatedIssue = await reopenTicket(issueId, reopenReason, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        toast({
          title: "Success",
          description: "Ticket reopened successfully",
        });
        return Promise.resolve();
      }
    } catch (error) {
      console.error("Error reopening ticket:", error);
      toast({
        title: "Error",
        description: "Failed to reopen ticket",
        variant: "destructive",
      });
      return Promise.reject(error);
    } finally {
      setIsReopeningTicket(false);
    }
  };

  return {
    isReopeningTicket,
    processReopenTicket
  };
};
