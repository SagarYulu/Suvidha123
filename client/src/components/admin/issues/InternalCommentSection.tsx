
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InternalComment } from "@/services/issues/internalCommentService";
import { Loader2, Lock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface InternalCommentSectionProps {
  issueId: string;
  internalComments: InternalComment[];
  newInternalComment: string;
  setNewInternalComment: (comment: string) => void;
  handleAddInternalComment: () => void;
  isSubmittingInternalComment: boolean;
  commentersNames: Record<string, string>;
  formatDate: (date: string) => string;
  currentUserId: string;
  canViewInternalComments: boolean;
  canAddInternalComments: boolean;
  isLoading: boolean;
}

const InternalCommentSection: React.FC<InternalCommentSectionProps> = ({
  issueId,
  internalComments,
  newInternalComment,
  setNewInternalComment,
  handleAddInternalComment,
  isSubmittingInternalComment,
  commentersNames,
  formatDate,
  currentUserId,
  canViewInternalComments,
  canAddInternalComments,
  isLoading
}) => {
  // If user doesn't have permission, show restricted access message
  if (!canViewInternalComments) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <Lock className="h-4 w-4 mr-2 text-orange-600" />
            Internal Communication (Restricted Access)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <p>
            You don't have permission to view internal communications for this ticket.
            Only ticket assignees and administrators can access this section.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddInternalComment();
    }
  };
  
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 border-b border-blue-100 pb-2">
        <CardTitle className="text-sm flex items-center">
          <Lock className="h-4 w-4 mr-2 text-blue-600" />
          Internal Communication (Not Visible to Employee)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : internalComments.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm italic text-center">
            No internal communications yet. Use this section to discuss the ticket privately.
          </div>
        ) : (
          <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
            {internalComments.map((comment) => (
              <div 
                key={comment.id}
                className={`flex gap-3 ${
                  comment.employeeId === Number(currentUserId)
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {comment.employeeId !== Number(currentUserId) && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                      {getInitials(commentersNames[comment.employeeId] || "UN")}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    comment.employeeId === Number(currentUserId)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className={`font-medium ${
                      comment.employeeId === Number(currentUserId) ? "text-blue-100" : "text-gray-600"
                    }`}>
                      {comment.employeeId === Number(currentUserId)
                        ? "You"
                        : commentersNames[comment.employeeId] || "Suvidha"}
                    </span>
                    <span className={`ml-2 ${
                      comment.employeeId === Number(currentUserId) ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
                </div>
                {comment.employeeId === Number(currentUserId) && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getInitials(commentersNames[comment.employeeId] || "ME")}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {canAddInternalComments && (
        <>
          <div className="p-4 border-t border-gray-100">
            <Textarea
              placeholder="Add an internal comment (not visible to the employee)..."
              value={newInternalComment}
              onChange={(e) => setNewInternalComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] resize-none"
              disabled={isSubmittingInternalComment}
            />
            <div className="text-xs text-gray-500 mt-1">
              Press Ctrl+Enter to submit quickly
            </div>
          </div>
          <CardFooter className="border-t pt-3 pb-3">
            <Button
              onClick={handleAddInternalComment}
              disabled={!newInternalComment.trim() || isSubmittingInternalComment}
              className="ml-auto"
            >
              {isSubmittingInternalComment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Internal Comment
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default InternalCommentSection;
