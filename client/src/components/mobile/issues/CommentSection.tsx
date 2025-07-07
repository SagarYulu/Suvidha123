
import { IssueComment } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { FormEvent } from "react";

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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="font-semibold flex items-center mb-3">
        <MessageSquare className="h-4 w-4 mr-1" />
        Conversation ({comments.length})
      </h3>
      
      <div className="space-y-3 max-h-[350px] overflow-y-auto mb-4 p-1">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isCurrentUser = comment.employeeId === parseInt(currentUserId || '0');
            const isAdmin = comment.employeeId === 1;
            const userName = commenterNames[comment.employeeId.toString()] || (isAdmin ? "Admin" : "Suvidha");
            
            return (
              <div 
                key={comment.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      isCurrentUser 
                        ? 'ml-2 bg-yulu-blue' 
                        : isAdmin 
                          ? 'mr-2 bg-blue-600' 
                          : 'mr-2 bg-gray-500'
                    }`}
                  >
                    {userName[0] || "?"}
                  </div>
                  
                  <div 
                    className={`rounded-lg px-3 py-2 ${
                      isCurrentUser 
                        ? 'bg-yulu-blue text-white rounded-tr-none' 
                        : isAdmin
                          ? 'bg-blue-100 text-blue-900 rounded-tl-none'
                          : 'bg-gray-200 text-gray-900 rounded-tl-none'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {isCurrentUser ? 'You' : userName}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {formatDate(comment.createdAt).split(',')[1]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>
      
      <form onSubmit={onSubmitComment} className="flex items-end">
        <div className="flex-grow mr-2">
          <Textarea
            value={newComment}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="min-h-[60px] resize-none"
            rows={2}
            disabled={disabled || isSubmitting}
          />
        </div>
        <Button 
          type="submit" 
          className="bg-yulu-blue hover:bg-blue-700 h-[60px] aspect-square flex items-center justify-center"
          disabled={disabled || isSubmitting || !newComment.trim()}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default CommentSection;
