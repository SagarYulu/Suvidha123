
import { useState, useEffect } from "react";
import { Issue } from "@/types";
import { assignIssueToUser } from "@/services/issues/issueAssignmentService";
import { getAvailableAssignees, getEmployeeNameByUuid } from "@/services/issues/issueUtils";
import { toast } from "@/hooks/use-toast";

export const useIssueAssignment = (issue: Issue | null, currentUserId: string, setIssue: (issue: Issue) => void) => {
  const [availableAssignees, setAvailableAssignees] = useState<{ value: string; label: string }[]>([]);
  const [currentAssigneeId, setCurrentAssigneeId] = useState<number | null>(null);
  const [currentAssigneeName, setCurrentAssigneeName] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

  useEffect(() => {
    const fetchAssigneeInfo = async () => {
      try {
        // Fetch assignee information if issue has one
        if (issue?.assignedTo) {
          setCurrentAssigneeId(issue.assignedTo);
          const assigneeName = await getEmployeeNameByUuid(String(issue.assignedTo));
          setCurrentAssigneeName(assigneeName || "Unknown");
        }
        
        // Fetch available assignees
        const assignees = await getAvailableAssignees();
        setAvailableAssignees(assignees);
      } catch (error) {
        console.error("Error fetching assignee information:", error);
      }
    };

    if (issue) {
      fetchAssigneeInfo();
    }
  }, [issue]);

  const handleAssignIssue = async () => {
    if (!issue?.id || !selectedAssignee || !currentUserId) return;
    
    // Ensure issue.id is a valid number/string
    const issueId = typeof issue.id === 'number' ? issue.id.toString() : String(issue.id);
    if (!issueId || issueId === 'undefined' || issueId === 'null') {
      console.error('Invalid issue ID:', issue.id);
      return;
    }
    
    setIsAssigning(true);
    try {
      const updatedIssue = await assignIssueToUser(issueId, selectedAssignee, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setCurrentAssigneeId(Number(selectedAssignee));
        
        const assigneeName = await getEmployeeNameByUuid(selectedAssignee);
        setCurrentAssigneeName(assigneeName || "Unknown");
        
        toast({
          title: "Success",
          description: `Ticket assigned to ${assigneeName || "selected agent"}`,
        });
      }
    } catch (error) {
      console.error("Error assigning issue:", error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
      setSelectedAssignee("");
    }
  };

  return {
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    handleAssignIssue
  };
};
