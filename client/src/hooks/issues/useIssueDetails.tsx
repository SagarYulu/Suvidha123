
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/types";
import { getIssueById } from "@/services/issues/issueFetchService";
import { getUserById } from "@/services/userService";
import { getEmployeeNameByUuid } from "@/services/issues/issueUtils";

import { toast } from "@/hooks/use-toast";

export const useIssueDetails = (issueId?: string) => {
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Issue["status"]>("open");

  const currentUserId = authState.user?.id || "";

  useEffect(() => {
    const fetchIssueDetails = async () => {
      if (!issueId) return;

      setIsLoading(true);
      try {
        const issueData = await getIssueById(issueId);
        if (issueData) {
          setIssue(issueData);
          setStatus(issueData.status);
          
          // Fetch employee information
          if (issueData.employeeId) {
            const employeeData = await getUserById(String(issueData.employeeId));
            if (employeeData) {
              setEmployee(employeeData);
            }
          }
          
          // Get commenter names
          const uniqueCommenterIds = Array.from(new Set(issueData.comments.map(c => String(c.employeeId))));
          const names: Record<string, string> = {};
          
          for (const commenterId of uniqueCommenterIds) {
            const name = await getEmployeeNameByUuid(commenterId);
            names[commenterId] = name || "Unknown";
          }
          
          // Add current user to the names list for future comments
          if (currentUserId && !names[currentUserId]) {
            const currentUserName = authState.user?.name || "Current User";
            names[currentUserId] = currentUserName;
          }
          
          setCommenterNames(names);
        }
      } catch (error) {
        console.error("Error fetching issue details:", error);
        toast({
          title: "Error",
          description: "Failed to load ticket details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueDetails();
  }, [issueId, authState.user, currentUserId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    issue,
    setIssue,
    employee,
    isLoading,
    commenterNames,
    status,
    setStatus,
    formatDate,
    currentUserId
  };
};
