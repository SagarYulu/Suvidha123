
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
    <div className="flex flex-col h-full" style={{ background: '#e5ddd5' }}>
      {/* WhatsApp-style header */}
      <div className="bg-[#075e54] text-white px-4 py-3 rounded-t-lg shadow-lg">
        <h3 className="font-semibold flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Chat ({comments.length})
        </h3>
      </div>
      
      {/* Chat messages area with WhatsApp background */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d4' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          minHeight: '350px'
        }}
      >
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isCurrentUser = comment.employeeId === parseInt(currentUserId || '0');
            const isAdmin = !comment.isEmployee; // Check if it's an admin/dashboard user
            const userName = isAdmin ? "Suvidha" : (commenterNames[comment.employeeId.toString()] || comment.commenterName || "Unknown");
            
            return (
              <div 
                key={comment.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}
              >
                <div className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div 
                    className={`rounded-lg px-3 py-2 shadow-sm relative ${
                      isCurrentUser 
                        ? 'bg-[#dcf8c6] text-gray-800' 
                        : 'bg-white text-gray-800'
                    }`}
                    style={{
                      borderRadius: isCurrentUser ? '10px 10px 0 10px' : '10px 10px 10px 0'
                    }}
                  >
                    {!isCurrentUser && (
                      <div className="text-xs font-semibold mb-1" style={{ color: '#075e54' }}>
                        {userName}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                      <span>{formatDate(comment.createdAt).split(',')[1]?.trim() || 'Just now'}</span>
                      {isCurrentUser && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* WhatsApp-style message tail */}
                  <div 
                    className={`absolute ${isCurrentUser ? 'right-0 -mr-1' : 'left-0 -ml-1'}`}
                    style={{
                      bottom: '0',
                      width: '0',
                      height: '0',
                      borderStyle: 'solid',
                      borderWidth: isCurrentUser ? '0 0 10px 10px' : '0 10px 10px 0',
                      borderColor: isCurrentUser ? `transparent transparent #dcf8c6 transparent` : `transparent white transparent transparent`
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-lg px-6 py-4 shadow-sm text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs">Start the conversation!</p>
            </div>
          </div>
        )}
      </div>
      
      {/* WhatsApp-style input area */}
      <div className="bg-[#f0f0f0] px-3 py-2 border-t border-gray-300">
        <form onSubmit={onSubmitComment} className="flex items-end gap-2">
          <div className="flex-grow relative">
            <Textarea
              value={newComment}
              onChange={handleInputChange}
              placeholder="Type a message"
              className="min-h-[44px] resize-none rounded-full px-4 py-2 pr-12 bg-white border-0 shadow-sm focus:ring-1 focus:ring-[#075e54]"
              rows={1}
              disabled={disabled || isSubmitting}
              style={{ paddingRight: '48px' }}
            />
            {/* Emoji placeholder button */}
            <button type="button" className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <Button 
            type="submit" 
            className="bg-[#075e54] hover:bg-[#064e46] rounded-full h-11 w-11 flex items-center justify-center p-0 shadow-sm"
            disabled={disabled || isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;
