
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Issue } from "@/types";
import { useNavigate } from "react-router-dom";

interface IssueHeaderProps {
  issue: Issue;
}

const IssueHeader = ({ issue }: IssueHeaderProps) => {
  const navigate = useNavigate();

  // Safety check - return null if issue data isn't loaded yet
  if (!issue || !issue.status) {
    return null;
  }

  const getStatusBadgeColor = (statusValue: Issue["status"]) => {
    switch (statusValue) {
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
  
  // Check if issue has breached SLA (is critical priority and not closed/resolved)
  const isBreachedSLA = issue.priority === 'critical' && 
    issue.status !== 'closed' && 
    issue.status !== 'resolved';

  return (
    <div className="flex items-center mb-8">
      <Button 
        variant="outline" 
        onClick={() => navigate("/admin/issues")}
        className="mr-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Issues
      </Button>
      
      <Badge className={getStatusBadgeColor(issue.status)}>
        {issue.status.replace("_", " ")}
      </Badge>
      
      {isBreachedSLA && (
        <Badge className="bg-red-600 ml-2 animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          CRITICAL SLA BREACH (40+ hours)
        </Badge>
      )}
    </div>
  );
};

export default IssueHeader;
