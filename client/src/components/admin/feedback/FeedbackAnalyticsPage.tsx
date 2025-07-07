
import React, { useState, useEffect } from 'react';
import AdminLayout from "@/components/AdminLayout";
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';
import FeedbackFiltersPanel from './FeedbackFiltersPanel';
import FeedbackMetricsOverview from './FeedbackMetricsOverview';
import FeedbackInsightsSummary from './FeedbackInsightsSummary';
import EnhancedSentimentChart from './EnhancedSentimentChart';
import DonutChart from './DonutChart';
import FeedbackSubmissionRate from './FeedbackSubmissionRate';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/utils/csvExportUtils';
import { formatDateToDDMMYYYY } from '@/utils/dateUtils';

const FeedbackAnalyticsPage: React.FC = () => {
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    isLoading,
    error,
    metrics,
    comparisonMetrics,
    rawData,
    filters,
    updateFilters,
    toggleComparison
  } = useFeedbackAnalytics();
  
  // Mark as initialized after first load
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized]);
  
  // Handle comparison toggle
  const handleComparisonToggle = (enabled: boolean) => {
    setIsComparisonEnabled(enabled);
    toggleComparison(enabled);
  };

  // Handle export data to CSV
  const handleExportData = () => {
    if (!rawData || rawData.length === 0) return;
    
    // Format data for export with date in DD-MM-YYYY format
    const formattedData = rawData.map(item => {
      // Convert date from ISO to DD-MM-YYYY
      const formattedDate = item.created_at ? formatDateToDDMMYYYY(item.created_at) : 'N/A';
      
      return {
        'Feedback ID': item.id,
        'Issue ID': item.issue_id,
        'Employee ID': item.employee_id,
        'Date': formattedDate,
        'Sentiment': item.sentiment,
        'Feedback Option': item.feedback_option,
        'Cluster': item.cluster || 'N/A',
        'City': item.city || 'N/A',
        'Agent ID': item.agent_id || 'N/A',
        'Agent Name': item.agent_name || 'N/A'
      };
    });
    
    // Generate filename with current date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `feedback-data-export-${dateStr}.csv`;
    
    // Export to CSV
    exportToCSV(formattedData, filename);
  };
  
  const renderContent = () => {
    if (isLoading && !isInitialized) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <span className="text-lg">Loading feedback data...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading feedback data: {error.message}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!metrics || metrics.totalCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-lg shadow p-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium">No feedback data available</h3>
          <p className="text-muted-foreground mt-2">
            Try changing your filters or check if feedback has been submitted for the selected period.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Feedback Submission Rate - Positioned above Metrics Overview */}
        <FeedbackSubmissionRate
          totalFeedback={metrics.totalCount}
          totalClosedTickets={metrics.totalClosedTickets || 0}
          submissionRate={metrics.feedbackSubmissionRate || 0}
        />
        
        {/* Insights Summary */}
        <FeedbackInsightsSummary 
          insights={metrics.insightData || []}
          showComparison={isComparisonEnabled}
        />
        
        {/* Metrics Overview */}
        <FeedbackMetricsOverview 
          metrics={metrics} 
          comparisonMetrics={isComparisonEnabled ? comparisonMetrics : null}
          comparisonMode={isComparisonEnabled ? (filters.comparisonMode || 'none') : 'none'}
        />
        
        {/* Sentiment Distribution Chart */}
        <DonutChart 
          data={(() => {
            // Always show all three sentiment types, even if count is 0
            const sentimentCounts = { happy: 0, neutral: 0, sad: 0 };
            
            // Count actual feedback if rawData exists
            if (rawData && rawData.length > 0) {
              rawData.forEach(item => {
                const sentiment = item.sentiment || 'neutral';
                if (sentiment in sentimentCounts) {
                  sentimentCounts[sentiment as keyof typeof sentimentCounts]++;
                }
              });
            }
            
            // Always return all three sentiments
            return [
              {
                name: 'Happy',
                value: sentimentCounts.happy,
                color: '#10B981',
                percentage: 0 // Will be calculated in the component
              },
              {
                name: 'Neutral', 
                value: sentimentCounts.neutral,
                color: '#F59E0B',
                percentage: 0 // Will be calculated in the component
              },
              {
                name: 'Sad',
                value: sentimentCounts.sad,
                color: '#EF4444',
                percentage: 0 // Will be calculated in the component
              }
            ];
          })()}
          totalCount={rawData ? rawData.length : 0}
          title="Sentiment & Reason Breakdown"
        />
        
        {/* Enhanced Sentiment Distribution Chart */}
        <EnhancedSentimentChart 
          rawFeedbackData={rawData}
          dateRange={{ startDate: filters.startDate || '', endDate: filters.endDate || '' }}
          title="Sentiment Distribution Over Time"
        />
      </div>
    );
  };
  
  return (
    <AdminLayout title="Feedback Analytics">
      <div className="space-y-6">
        {/* Header with Export Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Feedback Analytics</h2>
            <p className="text-muted-foreground">
              Analyze and visualize customer feedback data
            </p>
          </div>
          <Button 
            onClick={handleExportData} 
            className="ml-auto" 
            disabled={!rawData || rawData.length === 0 || isLoading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
        
        {/* Filters Panel */}
        <FeedbackFiltersPanel 
          filters={filters}
          onFilterChange={updateFilters}
          isComparisonEnabled={isComparisonEnabled}
          onComparisonToggle={handleComparisonToggle}
        />
        
        {/* Loading state overlay for subsequent data loads */}
        <div className="relative">
          {isLoading && isInitialized && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center space-x-2 px-6 py-3 bg-white border rounded-lg shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="font-medium">Updating data...</span>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeedbackAnalyticsPage;
