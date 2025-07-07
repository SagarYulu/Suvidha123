
import React from 'react';
import { Clock, User, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'assignment' | 'comment' | 'escalation' | 'creation';
  timestamp: string;
  user: string;
  description: string;
  oldValue?: string;
  newValue?: string;
}

interface StatusTimelineProps {
  issueId: string;
  events: TimelineEvent[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ issueId, events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'assignment':
        return <User className="w-4 h-4 text-green-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'creation':
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "Unknown time";
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";
      
      // Format in IST timezone
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp);
      return "Invalid Date";
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-gray-300">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900">{event.description}</p>
                    {event.oldValue && event.newValue && (
                      <p className="text-xs text-gray-500">
                        From "{event.oldValue}" to "{event.newValue}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500">by {event.user}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusTimeline;
