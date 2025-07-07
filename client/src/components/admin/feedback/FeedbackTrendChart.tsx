
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';
import { ComparisonMode } from '../sentiment/ComparisonModeDropdown';

interface TrendData {
  date: string;
  happy: number;
  neutral: number;
  sad: number;
  total?: number;
}

interface FeedbackTrendChartProps {
  data: TrendData[];
  showComparison?: boolean;
  comparisonMode?: ComparisonMode;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({
  data,
  showComparison = false,
  comparisonMode = 'none'
}) => {
  // Check if data is loading or empty
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyDataState message="No feedback trend data available for the selected period." />
        </CardContent>
      </Card>
    );
  }

  console.log("Trend chart raw data:", data);
  
  // Format the data to ensure dates are displayed correctly
  const formattedData = [...data]
    .filter(item => item && item.date) // Filter out invalid entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => {
      const dateObj = new Date(item.date);
      // Include year in display to avoid confusion
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return {
        ...item,
        formattedDate,
        // Make sure all sentiment values exist (even if 0)
        happy: typeof item.happy === 'number' ? Number(item.happy) : 0,
        neutral: typeof item.neutral === 'number' ? Number(item.neutral) : 0,
        sad: typeof item.sad === 'number' ? Number(item.sad) : 0
      };
    });
  
  console.log("Trend chart formatted data:", formattedData);

  // Calculate max value for Y-axis domain
  const maxValue = Math.max(
    ...formattedData.map(item => Math.max(
      item.happy || 0,
      item.neutral || 0,
      item.sad || 0
    ))
  );

  // Add some padding to the max value
  const yAxisMax = Math.max(maxValue + 1, 5);

  // Create a title based on comparison mode
  let title = "Feedback Trend";
  if (showComparison && comparisonMode !== 'none') {
    const comparisonLabels: Record<ComparisonMode, string> = {
      'dod': 'Day-over-Day',
      'wow': 'Week-over-Week',
      'mom': 'Month-over-Month',
      'qoq': 'Quarter-over-Quarter',
      'yoy': 'Year-over-Year',
      'none': ''
    };
    title = `${title} (${comparisonLabels[comparisonMode]})`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                allowDecimals={false}
                domain={[0, yAxisMax]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  padding: '10px'
                }}
                formatter={(value, name) => {
                  const displayNames = {
                    happy: 'Happy',
                    neutral: 'Neutral',
                    sad: 'Sad'
                  };
                  return [value, displayNames[name as keyof typeof displayNames] || name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
              
              {/* Happy Line - Listed first to ensure it's rendered */}
              <Line
                type="monotone"
                dataKey="happy"
                name="Happy"
                stroke={SENTIMENT_COLORS.happy}
                fill={SENTIMENT_COLORS.happy}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, stroke: SENTIMENT_COLORS.happy }}
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                isAnimationActive={false}
              />
              
              {/* Neutral Line */}
              <Line
                type="monotone"
                dataKey="neutral"
                name="Neutral"
                stroke={SENTIMENT_COLORS.neutral}
                fill={SENTIMENT_COLORS.neutral}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, stroke: SENTIMENT_COLORS.neutral }}
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                isAnimationActive={false}
              />
              
              {/* Sad Line */}
              <Line
                type="monotone"
                dataKey="sad"
                name="Sad"
                stroke={SENTIMENT_COLORS.sad}
                fill={SENTIMENT_COLORS.sad}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 1, stroke: SENTIMENT_COLORS.sad }}
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendChart;
