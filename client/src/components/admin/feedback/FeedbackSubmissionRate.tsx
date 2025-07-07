
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface FeedbackSubmissionRateProps {
  totalFeedback: number;
  totalClosedTickets: number;
  submissionRate: number;
}

const FeedbackSubmissionRate: React.FC<FeedbackSubmissionRateProps> = ({
  totalFeedback,
  totalClosedTickets,
  submissionRate,
}) => {  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Feedback Submission Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Metrics Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-500 mb-1">Total Closed Tickets</h4>
            <p className="text-2xl font-bold">{totalClosedTickets}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-500 mb-1">Feedback Received</h4>
            <p className="text-2xl font-bold">{totalFeedback}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-600 mb-1">Submission Rate</h4>
            <p className="text-2xl font-bold text-blue-700">{submissionRate.toFixed(1)}%</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex justify-between mb-1 text-xs text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <Progress value={submissionRate} className="h-2" 
            style={{
              background: '#e5e7eb',
              borderRadius: '9999px',
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSubmissionRate;
