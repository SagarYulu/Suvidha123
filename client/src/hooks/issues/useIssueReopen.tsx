import { useState } from "react";
import { Issue } from "@/types";
import { reopenTicket } from "@/services/issues/issueReopeningService";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const useIssueReopen = (
  issueId: string | undefined, 
  currentUserId: string,
  setIssue: (issue: Issue) => void,
  setStatus: (status: Issue["status"]) => void
) => {
  const [reopenReason, setReopenReason] = useState<string>("");
  const [isReopeningTicket, setIsReopeningTicket] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);

  // Display dialog for reopening ticket
  const handleReopenTicket = () => {
    setShowReopenDialog(true);
  };
  
  // Process the actual reopening with reason
  const processReopenTicket = async () => {
    if (!issueId || !currentUserId || !reopenReason.trim()) return;
    
    setIsReopeningTicket(true);
    try {
      const updatedIssue = await reopenTicket(issueId, reopenReason, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setStatus(updatedIssue.status);
        setShowReopenDialog(false);
        setReopenReason("");
        toast({
          title: "Success",
          description: "Ticket reopened successfully",
        });
      }
    } catch (error) {
      console.error("Error reopening ticket:", error);
      toast({
        title: "Error",
        description: "Failed to reopen ticket",
        variant: "destructive",
      });
    } finally {
      setIsReopeningTicket(false);
    }
  };

  return {
    reopenReason,
    setReopenReason,
    isReopeningTicket,
    showReopenDialog,
    setShowReopenDialog,
    handleReopenTicket,
    processReopenTicket,
    // Dialog components
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
  };
};
