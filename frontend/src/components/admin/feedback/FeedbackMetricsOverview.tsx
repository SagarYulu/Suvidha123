
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { FeedbackMetrics } from '@/services/feedbackAnalyticsService';

type ComparisonMode = 'none' | 'dod' | 'wow' | 'mom' | 'qoq' | 'yoy';

const COMPARISON_LABELS: Record<string, string> = {
  'dod': 'vs. Previous Day',
  'wow': 'vs. Previous Week',
  'mom': 'vs. Previous Month',
  'qoq': 'vs. Previous Quarter',
  'yoy': 'vs. Previous Year'
};

interface FeedbackMetricsOverviewProps {
  metrics: FeedbackMetrics;
  comparisonMetrics: FeedbackMetrics | null;
  comparisonMode: ComparisonMode;
}

const FeedbackMetricsOverview: React.FC<FeedbackMetricsOverviewProps> = ({
  metrics,
  comparisonMetrics,
  comparisonMode
}) => {
  const showComparison = comparisonMode !== 'none' && comparisonMetrics !== null;
  
  // Calculate percentage change
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  // For happy sentiment, positive change is good
  const getHappyChangeStyle = (change: number) => {
    return change > 0 
      ? 'text-green-600' 
      : change < 0 
        ? 'text-red-600' 
        : 'text-gray-500';
  };
  
  // For sad sentiment, negative change is good
  const getSadChangeStyle = (change: number) => {
    return change < 0 
      ? 'text-green-600' 
      : change > 0 
        ? 'text-red-600' 
        : 'text-gray-500';
  };

  // For neutral sentiment, use neutral styling
  const getNeutralChangeStyle = (change: number) => {
    return change !== 0
      ? 'text-blue-600'
      : 'text-gray-500';
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Feedback Count */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Total Feedback
            </span>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold tracking-tight">
                {metrics.totalCount}
              </span>
              {showComparison && (
                <div className="ml-4 flex items-baseline">
                  {(() => {
                    const change = calculateChange(
                      metrics.totalCount, 
                      comparisonMetrics?.totalCount || 0
                    );
                    const isPositive = change > 0;
                    const changeStyle = isPositive ? 'text-green-600' : 'text-red-600';
                    
                    return (
                      <div className={`flex items-center ${changeStyle}`}>
                        {isPositive ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })()}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {COMPARISON_LABELS[comparisonMode]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Happy Sentiment Percentage */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Happy Sentiment
            </span>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold tracking-tight text-green-600">
                {metrics.sentimentPercentages.happy}%
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({metrics.sentimentCounts.happy} responses)
              </span>
              
              {showComparison && (
                <div className="ml-4 flex items-baseline">
                  {(() => {
                    const change = calculateChange(
                      metrics.sentimentPercentages.happy, 
                      comparisonMetrics?.sentimentPercentages.happy || 0
                    );
                    const changeStyle = getHappyChangeStyle(change);
                    
                    return (
                      <div className={`flex items-center ${changeStyle}`}>
                        {change > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : change < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        ) : null}
                        <span className="text-sm font-medium">
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Neutral Sentiment Percentage */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Neutral Sentiment
            </span>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold tracking-tight text-amber-500">
                {metrics.sentimentPercentages.neutral}%
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({metrics.sentimentCounts.neutral} responses)
              </span>
              
              {showComparison && (
                <div className="ml-4 flex items-baseline">
                  {(() => {
                    const change = calculateChange(
                      metrics.sentimentPercentages.neutral, 
                      comparisonMetrics?.sentimentPercentages.neutral || 0
                    );
                    const changeStyle = getNeutralChangeStyle(change);
                    
                    return (
                      <div className={`flex items-center ${changeStyle}`}>
                        {change > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : change < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        ) : null}
                        <span className="text-sm font-medium">
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sad Sentiment Percentage */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Sad Sentiment
            </span>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold tracking-tight text-red-600">
                {metrics.sentimentPercentages.sad}%
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                ({metrics.sentimentCounts.sad} responses)
              </span>
              
              {showComparison && (
                <div className="ml-4 flex items-baseline">
                  {(() => {
                    const change = calculateChange(
                      metrics.sentimentPercentages.sad, 
                      comparisonMetrics?.sentimentPercentages.sad || 0
                    );
                    const changeStyle = getSadChangeStyle(change);
                    
                    return (
                      <div className={`flex items-center ${changeStyle}`}>
                        {change > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : change < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        ) : null}
                        <span className="text-sm font-medium">
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackMetricsOverview;
