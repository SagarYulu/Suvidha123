
import { useState } from "react";
import { Issue } from "@/types";
import { addComment } from "@/services/issueService";
import { getIssueById } from "@/services/issues/issueFetchService";
import { toast } from "@/hooks/use-toast";

export const useIssueComments = (
  issueId: string | undefined,
  currentUserId: string,
  setIssue: (issue: Issue) => void
) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleAddComment = async () => {
    if (!issueId || !newComment.trim() || !currentUserId) return;
    
    setIsSubmittingComment(true);
    try {
      // Get current user info for better audit logs
      let userData = null;
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`/api/dashboard-users/${currentUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          userData = await response.json();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      
      const userName = userData?.name || "Suvidha";
      const userRole = userData?.role;
      
      console.log(`Adding comment as user: ${userName} (${currentUserId})`);
      
      // Pass the correct arguments to addComment (based on its signature)
      await addComment(issueId, Number(currentUserId), newComment, false);
      
      // Fetch the updated issue with the new comment
      const updatedIssue = await getIssueById(issueId);
      
      if (updatedIssue) {
        setIssue(updatedIssue);
        setNewComment("");
        toast({
          title: "Success",
          description: "Comment added",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return {
    newComment,
    setNewComment,
    isSubmittingComment,
    handleAddComment
  };
};
