
import { IssueComment } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Clock } from "lucide-react";
import { FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentSectionProps {
  comments: IssueComment[];
  newComment: string;
  setNewComment: (value: string) => void;
  handleSubmitComment: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  commenterNames: Record<string, string>;
  formatDate: (date: string) => string;
  currentUserId?: string;
  disabled?: boolean; // Added disabled prop
}

const CommentSection = ({
  comments,
  newComment,
  setNewComment,
  handleSubmitComment,
  isSubmitting,
  commenterNames,
  formatDate,
  currentUserId,
  disabled = false // Default to false
}: CommentSectionProps) => {
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Add a controlled input handler to prevent flash on backspace
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Use the event's value directly to avoid input reversal
    setNewComment(e.target.value);
  };

  // Prevent default form submission to avoid page reloads
  const onSubmitComment = (e: FormEvent) => {
    e.preventDefault();
    handleSubmitComment(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmitComment(e as any);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <MessageSquare className="mr-2 h-5 w-5" />
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">
              {comments.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {comments.map((comment, index) => {
              const isCurrentUser = comment.employeeId === parseInt(currentUserId || '0');
              const isAdmin = !comment.isEmployee;
              const userName = isAdmin ? "Suvidha" : (commenterNames[comment.employeeId.toString()] || comment.commenterName || "Unknown");
              
              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {!isCurrentUser && (
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className={`w-full max-w-[65%] ${isCurrentUser ? "text-right" : "text-left"}`}>
                    {/* Header with name and timestamp */}
                    <div className={`mb-2 flex items-center gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <span className="text-sm font-medium text-gray-700">{userName}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Message bubble */}
                    <div 
                      className={`relative p-4 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md min-h-[3rem] flex items-center ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300"
                          : "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Message tail */}
                      <div 
                        className={`absolute top-3 w-0 h-0 ${
                          isCurrentUser
                            ? "right-[-8px] border-l-[8px] border-l-blue-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                            : "left-[-8px] border-r-[8px] border-r-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                        }`}
                      />
                      
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                    
                    {isCurrentUser && (
                      <div className="flex-shrink-0 mt-4">
                        <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold">
                            {getInitials(commenterNames[comment.employeeId.toString()] || "You")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Add comment section */}
        <div className="mt-4 space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting || disabled}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Press Ctrl+Enter to send
            </span>
            <Button
              onClick={onSubmitComment}
              disabled={isSubmitting || !newComment.trim() || disabled}
              className="bg-yulu-blue hover:bg-cyan-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
