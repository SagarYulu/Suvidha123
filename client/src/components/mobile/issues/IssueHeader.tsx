
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/types";
import { Clock } from "lucide-react";
import MobileIssueStatus from "./MobileIssueStatus";

interface IssueHeaderProps {
  issue: Issue;
  formatDate: (date: string) => string;
  getIssueTypeLabel: (typeId: string) => string;
  getIssueSubTypeLabel: (typeId: string, subTypeId: string) => string;
  getStatusBadgeColor: (status: Issue["status"]) => string;
  isReopenable: boolean;
  handleReopenTicket: (reason: string) => void;
}

const IssueHeader = ({ 
  issue, 
  formatDate, 
  getIssueTypeLabel, 
  getIssueSubTypeLabel,
  getStatusBadgeColor,
  isReopenable,
  handleReopenTicket
}: IssueHeaderProps) => {
  const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";
  
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h2 className="font-semibold text-lg">
          {getIssueTypeLabel(issue.typeId)}
        </h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
      </p>
      
      <div className="text-sm mb-4">
        <p className="flex items-center text-gray-500 mb-1">
          <Clock className="h-3 w-3 mr-1" />
          Created on {formatDate(issue.createdAt)}
        </p>
      </div>
      
      <MobileIssueStatus 
        issue={issue}
        formatDate={formatDate}
        isReopenable={isReopenable}
        handleReopenTicket={handleReopenTicket}
      />
      
      <div className="border-t border-gray-200 pt-3">
        <h3 className="font-medium mb-2">Description:</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
      </div>
    </div>
  );
};

export default IssueHeader;
