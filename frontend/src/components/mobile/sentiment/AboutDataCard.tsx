
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface AboutDataCardProps {
  dataCount: number;
}

const AboutDataCard: React.FC<AboutDataCardProps> = ({ dataCount }) => {
  return (
    <Card className="bg-white/90">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-medium text-gray-800">About This Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          This analysis shows the distribution of feedback sentiment and topics from the last 30 days.
          The charts provide insights into the most common feedback topics and the overall sentiment
          of employee feedback.
        </p>
        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-xs text-blue-700">
            Based on {dataCount} feedback submissions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutDataCard;
