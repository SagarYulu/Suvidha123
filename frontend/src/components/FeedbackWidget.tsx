
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FeedbackWidgetProps {
  issueId: string;
  onFeedbackSubmit?: (feedback: string, sentiment: string) => void;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ 
  issueId, 
  onFeedbackSubmit 
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackOptions = [
    { emoji: '😊', sentiment: 'positive', label: 'Satisfied' },
    { emoji: '😐', sentiment: 'neutral', label: 'Neutral' },
    { emoji: '😞', sentiment: 'negative', label: 'Unsatisfied' }
  ];

  const handleFeedbackSubmit = async () => {
    if (!selectedFeedback) {
      toast.error('Please select a feedback option');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedOption = feedbackOptions.find(opt => opt.emoji === selectedFeedback);
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          issue_id: issueId,
          feedback_option: selectedFeedback,
          sentiment: selectedOption?.sentiment
        })
      });

      if (response.ok) {
        toast.success('Thank you for your feedback!');
        onFeedbackSubmit?.(selectedFeedback, selectedOption?.sentiment || 'neutral');
        setSelectedFeedback('');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        How satisfied are you with the resolution?
      </h3>
      
      <div className="flex space-x-4 mb-4">
        {feedbackOptions.map((option) => (
          <button
            key={option.emoji}
            onClick={() => setSelectedFeedback(option.emoji)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              selectedFeedback === option.emoji
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl mb-1">{option.emoji}</span>
            <span className="text-xs text-gray-600">{option.label}</span>
          </button>
        ))}
      </div>

      <Button 
        onClick={handleFeedbackSubmit} 
        disabled={!selectedFeedback || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </div>
  );
};

export default FeedbackWidget;
