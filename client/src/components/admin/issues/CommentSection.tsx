
import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, AlertTriangle, Wifi, WifiOff, Clock } from "lucide-react";
import { Issue, IssueComment } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TypingIndicator from "./TypingIndicator";

interface TypingUser {
  userName: string;
  timestamp: Date;
}

interface CommentSectionProps {
  issue: Issue;
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: () => void;
  isSubmittingComment: boolean;
  commenterNames: Record<string, string>;
  formatDate: (date: string) => string;
  currentUser: string;
  canReplyToEmployee?: boolean;
  // Real-time props
  typingUsers?: TypingUser[];
  isConnected?: boolean;
  sendTyping?: (isTyping: boolean, userName: string) => void;
  notifyNewComment?: (comment: any) => void;
}

const CommentSection = ({
  issue,
  newComment,
  setNewComment,
  handleAddComment,
  isSubmittingComment,
  commenterNames,
  formatDate,
  currentUser,
  canReplyToEmployee = true,
  typingUsers = [],
  isConnected = false,
  sendTyping,
  notifyNewComment
}: CommentSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserName = commenterNames[currentUser] || "Current User";

  // Is ticket closed or resolved?
  const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle typing detection for real-time updates
  const handleTypingStart = () => {
    if (!isTyping && sendTyping) {
      setIsTyping(true);
      sendTyping(true, currentUserName);
    }
    
    // Reset typing timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (sendTyping) {
        sendTyping(false, currentUserName);
      }
    }, 3000);
  };

  // Enhanced comment change handler with typing detection
  const handleCommentChange = (value: string) => {
    setNewComment(value);
    if (value.trim() && sendTyping) {
      handleTypingStart();
    }
  };

  // Enhanced comment submission with real-time notification
  const handleEnhancedAddComment = async () => {
    // Stop typing indicator
    if (isTyping && sendTyping) {
      setIsTyping(false);
      sendTyping(false, currentUserName);
    }
    
    // Call original handler
    await handleAddComment();
    
    // Notify other users of new comment if connected
    if (notifyNewComment && isConnected) {
      const newCommentData = {
        content: newComment,
        authorName: currentUserName,
        timestamp: new Date()
      };
      notifyNewComment(newCommentData);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <MessageSquare className="mr-2 h-5 w-5" />
          Comments
          {issue.comments.length > 0 && (
            <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">
              {issue.comments.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issue.comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No comments yet</p>
          </div>
        ) : (
          <div
            className={`space-y-4 ${
              !isExpanded && issue.comments.length > 3
                ? "max-h-[400px] overflow-y-auto"
                : ""
            }`}
          >
            {/* Show all comments or just the first 3 if not expanded */}
            {(isExpanded
              ? issue.comments
              : issue.comments.slice(-3)
            ).map((comment: IssueComment, index) => {
              const userName = commenterNames[comment.employeeId] || "Suvidha";
              const isEmployee = comment.employeeId !== Number(currentUser);
              
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                    isEmployee ? "justify-start" : "justify-end"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isEmployee && (
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className={`w-full max-w-[65%] ${isEmployee ? "text-left" : "text-right"}`}>
                    {/* Header with name and timestamp */}
                    <div className={`mb-2 flex items-center gap-2 ${isEmployee ? "justify-start" : "justify-end"}`}>
                      <span className="text-sm font-medium text-gray-700">{userName}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Message bubble */}
                    <div 
                      className={`relative p-4 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md min-h-[3rem] flex items-center ${
                        isEmployee
                          ? "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300"
                      }`}
                    >
                      {/* Message tail */}
                      <div 
                        className={`absolute top-3 w-0 h-0 ${
                          isEmployee
                            ? "left-[-8px] border-r-[8px] border-r-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                            : "right-[-8px] border-l-[8px] border-l-blue-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                        }`}
                      />
                      
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                  
                  {!isEmployee && (
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold">
                          {getInitials("You")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show button to expand/collapse comments if there are more than 3 */}
            {issue.comments.length > 3 && (
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded
                  ? "Show less comments"
                  : `Show all ${issue.comments.length} comments`}
              </Button>
            )}
          </div>
        )}

        {/* Only show add comment if ticket is not closed/resolved */}
        {!isClosedOrResolved ? (
          <>
            {!canReplyToEmployee && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800">Restricted Reply Access</h4>
                    <p className="text-sm text-orange-700">
                      Only HR Admin and Super Admin users can reply directly to the employee. 
                      Please use the internal comments section above to communicate with the team.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {canReplyToEmployee && (
              <>
                <Textarea
                  placeholder="Add a comment visible to the employee..."
                  value={newComment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[100px] resize-none"
                  disabled={isSubmittingComment || !canReplyToEmployee}
                />
                
                {/* Real-time typing indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator typingUsers={typingUsers} className="mb-3" />
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <strong>Note:</strong> This comment will be visible to the employee.
                    Press Ctrl+Enter to submit quickly.
                  </div>
                  {/* Connection status indicator */}
                  <div className="flex items-center space-x-1 text-xs">
                    {isConnected ? (
                      <>
                        <Wifi className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">Offline</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-600">
            This ticket is {issue.status}. New comments cannot be added.
          </div>
        )}
      </CardContent>
      
      {!isClosedOrResolved && canReplyToEmployee && (
        <CardFooter className="border-t pt-3">
          <Button
            onClick={handleEnhancedAddComment}
            disabled={
              !newComment.trim() ||
              isSubmittingComment ||
              isClosedOrResolved ||
              !canReplyToEmployee
            }
            className="ml-auto"
          >
            {isSubmittingComment && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Reply to Employee
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CommentSection;
