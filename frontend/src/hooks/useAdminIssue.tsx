
import { useIssueDetails } from "./issues/useIssueDetails";
import { useIssueAssignment } from "./issues/useIssueAssignment";
import { useIssueStatus } from "./issues/useIssueStatus";
import { useIssueComments } from "./issues/useIssueComments";
import { useIssueReopen } from "./issues/useIssueReopen";
import { useInternalComments } from "./issues/useInternalComments";

export const useAdminIssue = (issueId?: string) => {
  // Get core issue details
  const {
    issue,
    setIssue,
    employee,
    isLoading,
    commenterNames,
    status,
    setStatus,
    formatDate,
    currentUserId
  } = useIssueDetails(issueId);
  
  // Handle issue assignment
  const {
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    handleAssignIssue
  } = useIssueAssignment(issue, currentUserId, setIssue);
  
  // Handle issue status management
  const {
    isUpdatingStatus,
    handleStatusChange
  } = useIssueStatus(issueId, issue, status, currentUserId, setIssue);
  
  // Handle issue comments (visible to employee)
  const {
    newComment,
    setNewComment,
    isSubmittingComment,
    handleAddComment
  } = useIssueComments(issueId, currentUserId, setIssue);
  
  // Handle internal comments (not visible to employee)
  const {
    internalComments,
    newInternalComment,
    setNewInternalComment,
    isSubmittingInternalComment,
    commentersNames: internalCommenterNames,
    isLoading: isLoadingInternalComments,
    handleAddInternalComment,
    canViewInternalComments,
    canAddInternalComments
  } = useInternalComments(issueId, currentAssigneeId ? String(currentAssigneeId) : null);
  
  // Handle issue reopening
  const {
    reopenReason,
    setReopenReason,
    isReopeningTicket,
    showReopenDialog,
    setShowReopenDialog,
    handleReopenTicket,
    processReopenTicket,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
  } = useIssueReopen(issueId, currentUserId, setIssue, setStatus);

  // Combine and return all the hooks' values and functions
  return {
    // Issue details
    issue,
    setIssue,
    employee,
    isLoading,
    commenterNames,
    status,
    
    // Comments (visible to employee)
    newComment,
    setNewComment,
    isSubmittingComment,
    
    // Internal comments (not visible to employee)
    internalComments,
    newInternalComment,
    setNewInternalComment,
    isSubmittingInternalComment,
    internalCommenterNames,
    isLoadingInternalComments,
    handleAddInternalComment,
    canViewInternalComments,
    canAddInternalComments,
    
    // Status
    isUpdatingStatus,
    
    // Assignment
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    
    // Actions
    handleAssignIssue,
    handleStatusChange,
    handleAddComment,
    handleReopenTicket,
    formatDate,
    currentUserId,
    
    // Reopen dialog properties and state
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    showReopenDialog,
    setShowReopenDialog,
    reopenReason,
    setReopenReason,
    isReopeningTicket,
    processReopenTicket
  };
};
