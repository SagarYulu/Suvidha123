
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Clock, AlertCircle } from "lucide-react";
import { Issue } from "@/types";

interface IssueDetailsCardProps {
  issue: Issue;
  status: Issue["status"];
  handleStatusChange: (newStatus: Issue["status"]) => void;
  isUpdatingStatus: boolean;
  formatDate: (date: string) => string;
  getIssueTypeLabel: (typeId: string) => string;
  getIssueSubTypeLabel: (typeId: string, subTypeId: string) => string;
}

const IssueDetailsCard = ({ 
  issue, 
  status, 
  handleStatusChange, 
  isUpdatingStatus, 
  formatDate, 
  getIssueTypeLabel, 
  getIssueSubTypeLabel
}: IssueDetailsCardProps) => {
  // Get priority badge variant based on priority level
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200 animate-pulse";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  // Determine if the issue is closed or resolved
  const isClosedOrResolved = status === "closed" || status === "resolved";
  
  // Check if issue has breached SLA (is critical)
  const isBreachedSLA = issue.priority === 'critical' && !isClosedOrResolved;
  
  return (
    <Card className={isBreachedSLA ? "border-red-300 bg-red-50" : undefined}>
      {isBreachedSLA && (
        <div className="bg-red-100 px-4 py-2 border-b border-red-200 flex items-center">
          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">SLA Breach: This ticket has exceeded the 40-hour working time resolution window</span>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{getIssueTypeLabel(issue.typeId)}</CardTitle>
            <CardDescription>{getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}</CardDescription>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              Created: {formatDate(issue.createdAt)}
            </div>
            {issue.closedAt && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Closed: {formatDate(issue.closedAt)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">Description:</h3>
        <p className="text-gray-700">{issue.description}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center">
            <span className="font-medium mr-2">Priority:</span>
            {!isClosedOrResolved ? (
              <Badge 
                variant="outline" 
                className={`capitalize ${getPriorityBadgeVariant(issue.priority)}`}
              >
                {issue.priority === 'critical' ? (
                  <span className="font-bold">CRITICAL</span>
                ) : issue.priority}
                {isBreachedSLA && (
                  <span className="ml-2 text-xs bg-red-200 px-1 rounded">SLA BREACH</span>
                )}
              </Badge>
            ) : (
              <span className="text-gray-500 italic">Not applicable</span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-medium mr-2">Change Status:</span>
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueDetailsCard;
