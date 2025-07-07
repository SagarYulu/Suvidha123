
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchFeedbackData,
  calculateFeedbackMetrics,
  fetchComparisonData,
  FeedbackFilters,
  FeedbackMetrics,
  FeedbackItem 
} from '../services/feedbackAnalyticsService';
import { format, subDays, eachDayOfInterval, parse } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { ComparisonMode } from '@/services/feedbackAnalyticsService';

// Colors for sentiment categories
const SENTIMENT_COLORS = {
  happy: '#4ade80',  // Green
  neutral: '#fde047', // Yellow
  sad: '#f87171'     // Red
};

export const useFeedbackAnalytics = (initialFilters?: Partial<FeedbackFilters>) => {
  // Set default date range to last 7 days
  const today = new Date();
  
  const defaultStartDate = format(subDays(today, 7), 'yyyy-MM-dd');
  const defaultEndDate = format(today, 'yyyy-MM-dd');
  
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FeedbackFilters>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    comparisonMode: 'none',
    ...initialFilters
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [rawData, setRawData] = useState<FeedbackItem[]>([]);
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [comparisonMetrics, setComparisonMetrics] = useState<FeedbackMetrics | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [activeDataFetch, setActiveDataFetch] = useState(false);
  const [filterChangeCount, setFilterChangeCount] = useState(0);
  
  // Helper function to ensure we have data points for each day in the date range and all sentiment values are properly initialized
  const fillMissingDates = (data: any[], startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      console.warn("Missing start or end date for fillMissingDates");
      return data;
    }
    
    try {
      // Create a map of existing data by date
      const dataByDate = data.reduce((acc: Record<string, any>, item) => {
        if (item && item.date) {
          console.log(`Mapping existing data for date: ${item.date}`, item);
          acc[item.date] = item;
        }
        return acc;
      }, {});
      
      console.log("dataByDate map:", dataByDate);
      
      // Generate all dates in the range using Date constructor instead of parse
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error("Invalid date format:", { startDate, endDate });
        return data;
      }
      
      const allDates = eachDayOfInterval({ start, end });
      
      // Fill in missing dates with zero values, ensure all are numbers
      const filledData = allDates.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const existingData = dataByDate[dateStr];
        
        if (existingData) {
          console.log(`Found existing data for ${dateStr}:`, existingData);
          // Ensure all sentiment properties exist and are numbers
          return {
            date: dateStr,
            formattedDate: format(date, 'MMM d, yyyy'), // Include year for clarity
            happy: Number(existingData.happy || 0),
            neutral: Number(existingData.neutral || 0),
            sad: Number(existingData.sad || 0),
            total: Number(existingData.total || 0)
          };
        }
        
        console.log(`No data found for ${dateStr}, using zeros`);
        // Return default structure with zeros for new date entries
        return { 
          date: dateStr, 
          formattedDate: format(date, 'MMM d, yyyy'), // Include year for clarity
          happy: 0, 
          neutral: 0, 
          sad: 0, 
          total: 0 
        };
      });
      
      console.log("After filling missing dates:", filledData.length, "entries");
      return filledData;
    } catch (err) {
      console.error("Error filling missing dates:", err);
      return data;
    }
  };
  
  // Generate hierarchical data structure for the feedback visualization
  const generateHierarchyData = (feedbackData: FeedbackItem[]) => {
    if (!feedbackData || feedbackData.length === 0) return [];
    
    const totalCount = feedbackData.length;
    
    // Group by sentiment
    const sentimentGroups: Record<string, {
      count: number,
      subReasons: Record<string, number>
    }> = {};
    
    // First pass: count the occurrences
    feedbackData.forEach(item => {
      const sentiment = item.sentiment;
      const reason = item.feedback_option;
      
      if (!sentimentGroups[sentiment]) {
        sentimentGroups[sentiment] = {
          count: 0,
          subReasons: {}
        };
      }
      
      sentimentGroups[sentiment].count++;
      
      if (!sentimentGroups[sentiment].subReasons[reason]) {
        sentimentGroups[sentiment].subReasons[reason] = 0;
      }
      
      sentimentGroups[sentiment].subReasons[reason]++;
    });
    
    // Second pass: convert to the required format
    return Object.entries(sentimentGroups).map(([sentiment, data], sentimentIndex) => {
      // Format sub-reasons
      const subReasons = Object.entries(data.subReasons).map(([reason, count], index) => ({
        id: `${sentiment}-${reason}`,
        name: reason,
        value: count,
        sentiment: sentiment,
        percentage: (count / totalCount) * 100,
        sentimentIndex: sentimentIndex
      })).sort((a, b) => b.value - a.value); // Sort by count descending
      
      return {
        id: sentiment,
        name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
        value: data.count,
        percentage: (data.count / totalCount) * 100,
        color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || '#94a3b8',
        subReasons
      };
    }).sort((a, b) => b.value - a.value); // Sort by count descending
  };
  
  // Update filters when user changes selection
  const updateFilters = useCallback((newFilters: Partial<FeedbackFilters>) => {
    // Prevent race conditions by ignoring new filter requests during active fetch
    if (activeDataFetch) return;
    
    console.log("Updating filters:", newFilters);
    
    // Ensure we don't reset filters to undefined if they're already set
    setFilters(prev => {
      // Create a new object with the updated filters
      const updatedFilters = { ...prev, ...newFilters };
      
      // Log the final filters for debugging
      console.log("Final filters after update:", updatedFilters);
      
      return updatedFilters;
    });
    
    setDataFetched(false);
    setFilterChangeCount(prev => prev + 1);
  }, [activeDataFetch]);
  
  // Toggle comparison mode
  const toggleComparison = useCallback((enabled: boolean) => {
    // Prevent race conditions by ignoring toggle requests during active fetch
    if (activeDataFetch) return;
    
    console.log("Toggling comparison mode:", enabled);
    setShowComparison(enabled);
    if (!enabled) {
      // Turn off comparison mode
      updateFilters({ comparisonMode: 'none' });
    } else {
      // Default to week on week if turning on
      updateFilters({ comparisonMode: 'wow' });
    }
    setDataFetched(false);
  }, [activeDataFetch, updateFilters]);
  
  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched || activeDataFetch) {
        console.log("Skipping fetch - dataFetched:", dataFetched, "activeDataFetch:", activeDataFetch);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setActiveDataFetch(true);
      console.log("Fetching feedback data with filters:", filters);
      
      try {
        let currentData: FeedbackItem[] = [];
        
        if (showComparison && filters.comparisonMode && filters.comparisonMode !== 'none') {
          // Fetch both current and comparison data
          const result = await fetchComparisonData(filters);
          
          // Fill in missing dates for trend data and ensure proper number types
          if (result.current && result.current.trendData) {
            result.current.trendData = fillMissingDates(
              result.current.trendData,
              filters.startDate || '',
              filters.endDate || ''
            );
          }
          
          if (result.previous && result.previous.trendData) {
            result.previous.trendData = fillMissingDates(
              result.previous.trendData,
              filters.startDate || '',
              filters.endDate || ''
            );
          }
          
          // Generate hierarchical data for the visualization
          currentData = await fetchFeedbackData(filters);
          const hierarchyData = generateHierarchyData(currentData);
          
          // Add hierarchy data to metrics
          result.current.hierarchyData = hierarchyData;
          
          setMetrics(result.current);
          setComparisonMetrics(result.previous);
          setRawData(currentData || []);
        } else {
          // Fetch only current data
          currentData = await fetchFeedbackData(filters);
          console.log("Fetched feedback data:", currentData?.length || 0, "items");
          setRawData(currentData || []);
          const calculatedMetrics = await calculateFeedbackMetrics(currentData || [], filters);
          
          // Fill in missing dates for trend data and ensure proper number types
          if (calculatedMetrics && calculatedMetrics.trendData) {
            calculatedMetrics.trendData = fillMissingDates(
              calculatedMetrics.trendData,
              filters.startDate || '',
              filters.endDate || ''
            );
          }
          
          // Generate hierarchical data for the visualization
          const hierarchyData = generateHierarchyData(currentData);
          
          // Add hierarchy data to metrics
          calculatedMetrics.hierarchyData = hierarchyData;
          
          setMetrics(calculatedMetrics);
          setComparisonMetrics(null);
        }
        
        setDataFetched(true);
        console.log("Successfully fetched and processed feedback data");
      } catch (err) {
        console.error('Error in useFeedbackAnalytics:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback data';
        setError(err instanceof Error ? err : new Error(errorMessage));
        
        toast({
          title: "Error fetching feedback data",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setActiveDataFetch(false);
      }
    };
    
    fetchData();
  }, [filters.startDate, filters.endDate, filters.comparisonMode, showComparison, toast, filterChangeCount]);
  
  return {
    isLoading,
    error,
    rawData,
    metrics,
    comparisonMetrics,
    filters,
    showComparison,
    updateFilters,
    toggleComparison
  };
};
