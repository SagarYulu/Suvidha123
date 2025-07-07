
import { useState, useEffect } from "react";
import { InternalComment, getInternalComments, addInternalComment } from "@/services/issues/internalCommentService";
import { getEmployeeNameByUuid } from "@/services/issues/issueUtils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRBAC } from "@/contexts/RBACContext";

export const useInternalComments = (issueId: string | undefined, assigneeId: string | null) => {
  const [internalComments, setInternalComments] = useState<InternalComment[]>([]);
  const [newInternalComment, setNewInternalComment] = useState("");
  const [isSubmittingInternalComment, setIsSubmittingInternalComment] = useState(false);
  const [commentersNames, setCommentersNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();
  
  const currentUserId = authState.user?.id || "";
  
  // Check if current user can interact with internal comments
  const canViewInternalComments = 
    hasPermission("manage:tickets_all") || 
    hasPermission("manage:tickets_assigned") ||
    hasPermission("access:security") ||
    currentUserId === assigneeId;
    
  const canAddInternalComments = canViewInternalComments;
  
  // Fetch internal comments
  useEffect(() => {
    const fetchInternalComments = async () => {
      if (!issueId || !canViewInternalComments) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const comments = await getInternalComments(issueId);
        setInternalComments(comments);
        
        // Get commenter names with enhanced reliability
        const uniqueCommenterIds = Array.from(
          new Set(comments.map(c => c.employeeId))
        );
        
        const names: Record<string, string> = {};
        for (const commenterId of uniqueCommenterIds) {
          try {
            // Try dashboard users first
            const dashboardUserResponse = await fetch(`/api/dashboard-users/${commenterId}`);
            if (dashboardUserResponse.ok) {
              const dashboardUser = await dashboardUserResponse.json();
              if (dashboardUser && dashboardUser.name) {
                names[commenterId] = dashboardUser.name;
                continue;
              }
            }
            
            // Try employees table if not found in dashboard users
            const employeeResponse = await fetch(`/api/employees/${commenterId}`);
            if (employeeResponse.ok) {
              const employee = await employeeResponse.json();
              if (employee && employee.name) {
                names[commenterId] = employee.name;
                continue;
              }
            }
            
            // Fallback to our utility function
            const name = await getEmployeeNameByUuid(commenterId);
            names[commenterId] = name || "Suvidha";
          } catch (err) {
            console.error(`Error fetching name for ${commenterId}:`, err);
            names[commenterId] = "Suvidha";
          }
        }
        
        // Add current user to names list
        if (currentUserId && !names[currentUserId]) {
          const currentUserName = authState.user?.name || "Current User";
          names[currentUserId] = currentUserName;
        }
        
        console.log("Fetched commenter names:", names);
        setCommentersNames(names);
      } catch (error) {
        console.error("Error fetching internal comments:", error);
        toast({
          title: "Error",
          description: "Failed to load internal comments",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInternalComments();
  }, [issueId, canViewInternalComments, currentUserId, authState.user]);
  
  // Add internal comment
  const handleAddInternalComment = async () => {
    if (!issueId || !newInternalComment.trim() || !currentUserId || !canAddInternalComments) {
      return;
    }
    
    setIsSubmittingInternalComment(true);
    try {
      console.log(`Adding internal comment as user: ${authState.user?.name || currentUserId}`);
      
      const addedComment = await addInternalComment(
        issueId,
        Number(currentUserId),
        newInternalComment
      );
      
      if (addedComment) {
        setInternalComments(prev => [...prev, addedComment]);
        setNewInternalComment("");
        toast({
          title: "Success",
          description: "Internal comment added",
        });
      }
    } catch (error) {
      console.error("Error adding internal comment:", error);
      toast({
        title: "Error",
        description: "Failed to add internal comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingInternalComment(false);
    }
  };
  
  return {
    internalComments,
    newInternalComment,
    setNewInternalComment,
    isSubmittingInternalComment,
    commentersNames,
    isLoading,
    handleAddInternalComment,
    canViewInternalComments,
    canAddInternalComments,
  };
};
