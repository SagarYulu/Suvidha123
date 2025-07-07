import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '@/services/websocketService';
import { Issue } from '@/types';
import { toast } from '@/hooks/use-toast';

interface TypingUser {
  userName: string;
  timestamp: Date;
}

export const useRealTimeIssue = (
  issueId: string | undefined,
  issue: Issue | null,
  setIssue: (issue: Issue) => void
) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Join issue chat room when component mounts
  useEffect(() => {
    if (issueId) {
      websocketService.joinIssue(issueId);
      
      return () => {
        websocketService.leaveIssue();
      };
    }
  }, [issueId]);

  // Set up real-time event listeners
  useEffect(() => {
    // Handle new comments
    const handleCommentAdded = (data: any) => {
      if (data.comment && issue) {
        const updatedIssue = {
          ...issue,
          comments: [...(issue.comments || []), data.comment]
        };
        setIssue(updatedIssue);
        
        toast({
          title: "New Comment",
          description: "A new comment has been added to this issue.",
        });
      }
    };

    // Handle status updates
    const handleStatusUpdated = (data: any) => {
      if (data.status && issue) {
        const updatedIssue = {
          ...issue,
          status: data.status,
          updatedAt: data.timestamp || new Date().toISOString()
        };
        setIssue(updatedIssue);
        
        toast({
          title: "Status Updated",
          description: `Issue status changed to ${data.status.replace('_', ' ')}`,
        });
      }
    };

    // Handle typing indicators
    const handleTypingIndicator = (data: any) => {
      if (data.isTyping) {
        // Add user to typing list
        setTypingUsers(prev => {
          const existing = prev.find(user => user.userName === data.userName);
          if (!existing) {
            return [...prev, { userName: data.userName, timestamp: new Date() }];
          }
          return prev;
        });
      } else {
        // Remove user from typing list
        setTypingUsers(prev => prev.filter(user => user.userName !== data.userName));
      }
      
      // Auto-remove typing indicators after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => 
          prev.filter(user => 
            new Date().getTime() - user.timestamp.getTime() < 3000
          )
        );
      }, 3000);
    };

    // Register event handlers
    websocketService.onCommentAdded(handleCommentAdded);
    websocketService.onStatusUpdated(handleStatusUpdated);
    websocketService.onTyping(handleTypingIndicator);

    return () => {
      // Clean up event handlers
      websocketService.removeHandler('comment_added');
      websocketService.removeHandler('status_updated');
      websocketService.removeHandler('typing_indicator');
    };
  }, [issue, setIssue]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean, userName: string) => {
    if (issueId) {
      websocketService.sendTyping(isTyping, userName, issueId);
    }
  }, [issueId]);

  // Send new comment notification
  const notifyNewComment = useCallback((comment: any) => {
    if (issueId) {
      websocketService.sendComment(comment, issueId);
    }
  }, [issueId]);

  // Send status change notification
  const notifyStatusChange = useCallback((status: string) => {
    if (issueId) {
      websocketService.sendStatusChange(status, issueId);
    }
  }, [issueId]);

  return {
    typingUsers,
    isConnected,
    sendTyping,
    notifyNewComment,
    notifyStatusChange
  };
};