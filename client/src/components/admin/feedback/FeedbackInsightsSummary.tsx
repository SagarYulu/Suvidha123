
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, TrendingUp, TrendingDown, XCircle } from 'lucide-react';

interface InsightItem {
  label: string;
  value: string;
  change: number;
}

interface FeedbackInsightsSummaryProps {
  insights: InsightItem[];
  showComparison: boolean;
}

const FeedbackInsightsSummary: React.FC<FeedbackInsightsSummaryProps> = ({ 
  insights, 
  showComparison 
}) => {
  if (!showComparison || !insights || insights.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-white border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Key Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, index) => {
            // Determine change icon and color
            let Icon = MinusIcon;
            let colorClass = "text-gray-600";
            let trendIcon = null;
            
            if (insight.change > 0) {
              Icon = ArrowUpIcon;
              trendIcon = <TrendingUp size={16} className="ml-1" />;
              colorClass = insight.label.includes('Negative') ? "text-red-600" : "text-green-600";
            } else if (insight.change < 0) {
              Icon = ArrowDownIcon;
              trendIcon = <TrendingDown size={16} className="ml-1" />;
              colorClass = insight.label.includes('Negative') ? "text-green-600" : "text-red-600";
            }
            
            return (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700">{insight.label}</h4>
                <div className="flex items-center mt-2 justify-between">
                  <span className="text-lg font-bold">{insight.value}</span>
                  <div className={`flex items-center ${colorClass}`}>
                    <Icon size={16} className="mr-1" />
                    <span className="text-sm font-medium">
                      {insight.change > 0 ? '+' : ''}{Math.abs(insight.change).toFixed(1)}%
                    </span>
                    {trendIcon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackInsightsSummary;
