import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

interface TypingUser {
  userName: string;
  timestamp: Date;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

const TypingIndicator = ({ typingUsers, className = "" }: TypingIndicatorProps) => {
  const [visibleUsers, setVisibleUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    // Filter out users who stopped typing more than 3 seconds ago
    const now = new Date();
    const filtered = typingUsers.filter(user => 
      now.getTime() - user.timestamp.getTime() < 3000
    );
    setVisibleUsers(filtered);
  }, [typingUsers]);

  if (visibleUsers.length === 0) {
    return null;
  }

  const formatTypingText = () => {
    if (visibleUsers.length === 1) {
      return `${visibleUsers[0].userName} is typing...`;
    } else if (visibleUsers.length === 2) {
      return `${visibleUsers[0].userName} and ${visibleUsers[1].userName} are typing...`;
    } else {
      return `${visibleUsers.length} people are typing...`;
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-500 animate-pulse ${className}`}>
      <MessageSquare className="h-4 w-4" />
      <span>{formatTypingText()}</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;