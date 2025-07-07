import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { StatusTimeline } from './StatusTimeline';
import { FeedbackWidget } from './FeedbackWidget';
import { MessageCircle, Clock, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import authenticatedAxios from '@/services/authenticatedAxios';

interface Issue {
  id: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  employee_id: number;
  escalation_level?: number; // Add escalation fields
  escalated_at?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  employee_id: number;
  author_name?: string;
}

interface IssueDetailModalProps {
  issueId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issueId,
  isOpen,
  onClose
}) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssueDetails();
    }
  }, [isOpen, issueId]);

  const fetchIssueDetails = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedAxios.get(`/api/issues/${issueId}`);
      const data = response.data;
      setIssue(data.issue);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching issue details:', error);
      toast.error('Failed to fetch issue details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await authenticatedAxios.post(`/api/issues/${issueId}/comments`, {
        content: newComment
      });

      const newCommentData = response.data;
      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Issue Details #{issueId.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : issue ? (
          <div className="space-y-6">
            {/* Issue Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Created: {new Date(issue.created_at).toLocaleString()}
                  </div>
                  {issue.assigned_to && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Assigned to: {issue.assigned_to}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{issue.description}</p>
            </div>



            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comments ({comments.length})
              </h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {comment.author_name || 'Suvidha'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  size="sm"
                >
                  {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>

            {/* Feedback Widget */}
            {issue.status === 'resolved' || issue.status === 'closed' ? (
              <FeedbackWidget 
                issueId={issue.id}
                onFeedbackSubmit={() => {
                  toast.success('Thank you for your feedback!');
                }}
              />
            ) : null}

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="font-medium">Activity Timeline</h3>
              <StatusTimeline 
                issueId={issue.id}
                events={[
                  {
                    id: '1',
                    type: 'creation',
                    timestamp: issue.created_at,
                    user: 'System',
                    description: 'Issue created'
                  },
                  // Add more timeline events from audit trail
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            Issue not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailModal;
