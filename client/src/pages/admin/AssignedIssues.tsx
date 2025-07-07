
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignedIssues, getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { Issue, User } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AssignedIssues = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedIssues = async () => {
      if (!authState.user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const assignedIssues = await getAssignedIssues(authState.user.id);
        setIssues(assignedIssues);
      } catch (error) {
        console.error("Error fetching assigned issues:", error);
        toast({
          title: "Error",
          description: "Failed to load assigned issues",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedIssues();
  }, [authState.user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeColor = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-green-700";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <AdminLayout title="Assigned Tickets">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tickets Assigned To You</CardTitle>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Refresh the list
                  if (authState.user?.id) {
                    setIsLoading(true);
                    getAssignedIssues(authState.user.id)
                      .then(assignedIssues => {
                        setIssues(assignedIssues);
                      })
                      .catch(error => {
                        console.error("Error refreshing assigned issues:", error);
                        toast({
                          title: "Error",
                          description: "Failed to refresh assigned issues",
                          variant: "destructive",
                        });
                      })
                      .finally(() => {
                        setIsLoading(false);
                      });
                  }
                }}
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
              </div>
            ) : issues.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getIssueTypeLabel(issue.typeId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm truncate">
                        {issue.description}
                      </TableCell>
                      <TableCell>{formatDate(issue.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {issue.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(issue.status)}>
                          {issue.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/issues/${issue.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No tickets have been assigned to you
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AssignedIssues;
