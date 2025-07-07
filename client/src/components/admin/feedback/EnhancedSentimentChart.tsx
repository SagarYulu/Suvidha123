import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';

interface FeedbackItem {
  id: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  created_at?: string;
  createdAt?: string;
  feedback_option?: string;
  feedbackOption?: string;
}

interface EnhancedSentimentChartProps {
  rawFeedbackData: FeedbackItem[];
  dateRange: { startDate: string; endDate: string };
  title?: string;
}

const SENTIMENT_COLORS = {
  happy: '#10B981',
  neutral: '#F59E0B', 
  sad: '#EF4444'
};



const EnhancedSentimentChart: React.FC<EnhancedSentimentChartProps> = ({
  rawFeedbackData,
  dateRange,
  title = "Sentiment Distribution Over Time"
}) => {
  
  const processedData = useMemo(() => {
    console.log("Processing raw feedback data:", rawFeedbackData);
    
    if (!rawFeedbackData || rawFeedbackData.length === 0) {
      return [];
    }

    // Create date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dateList = eachDayOfInterval({ start: startDate, end: endDate });

    // Group feedback by date
    const feedbackByDate: Record<string, { happy: number; neutral: number; sad: number }> = {};
    
    rawFeedbackData.forEach(item => {
      // Handle both created_at and createdAt field naming
      const dateString = item.created_at || item.createdAt;
      if (!dateString) {
        console.warn("Missing date field in feedback item:", item);
        return;
      }
      
      const feedbackDate = startOfDay(new Date(dateString as string));
      if (isNaN(feedbackDate.getTime())) {
        console.warn("Invalid date in feedback item:", dateString);
        return;
      }
      
      const dateKey = format(feedbackDate, 'yyyy-MM-dd');
      
      if (!feedbackByDate[dateKey]) {
        feedbackByDate[dateKey] = { happy: 0, neutral: 0, sad: 0 };
      }
      
      feedbackByDate[dateKey][item.sentiment]++;
    });

    console.log("Feedback grouped by date:", feedbackByDate);

    // Create chart data with all dates
    const chartData = dateList.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = feedbackByDate[dateKey] || { happy: 0, neutral: 0, sad: 0 };
      
      return {
        date: dateKey,
        formattedDate: format(date, 'MMM dd'),
        happy: dayData.happy,
        neutral: dayData.neutral,
        sad: dayData.sad,
        total: dayData.happy + dayData.neutral + dayData.sad
      };
    });

    console.log("Final chart data:", chartData);
    return chartData;
  }, [rawFeedbackData, dateRange]);



  const maxValue = Math.max(...processedData.map(d => Math.max(d.happy, d.neutral, d.sad)));

  if (processedData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600">No feedback data available</p>
            <p className="text-sm text-gray-500">Try adjusting your date range or filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            <XAxis 
              dataKey="formattedDate" 
              stroke="#888"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              stroke="#888"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              domain={[0, Math.max(maxValue + 1, 5)]}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string) => [
                `${value} responses`, 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            
            <Legend />
            
            <Line
              type="monotone"
              dataKey="happy"
              stroke={SENTIMENT_COLORS.happy}
              strokeWidth={3}
              dot={{ fill: SENTIMENT_COLORS.happy, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: SENTIMENT_COLORS.happy, strokeWidth: 2 }}
              name="Happy"
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke={SENTIMENT_COLORS.neutral}
              strokeWidth={3}
              dot={{ fill: SENTIMENT_COLORS.neutral, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: SENTIMENT_COLORS.neutral, strokeWidth: 2 }}
              name="Neutral"
            />
            <Line
              type="monotone"
              dataKey="sad"
              stroke={SENTIMENT_COLORS.sad}
              strokeWidth={3}
              dot={{ fill: SENTIMENT_COLORS.sad, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: SENTIMENT_COLORS.sad, strokeWidth: 2 }}
              name="Sad"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EnhancedSentimentChart;