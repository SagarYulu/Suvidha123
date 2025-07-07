
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

// Define visually distinct colors with improved palette
const COLORS = {
  happy: '#8B5CF6',    // Vivid Purple
  neutral: '#F59E0B',  // Amber
  sad: '#EC4899',      // Magenta Pink
  grid: '#e2e8f0',
  tooltip: '#ffffff',
  happy_area: 'rgba(139, 92, 246, 0.1)',
  neutral_area: 'rgba(245, 158, 11, 0.1)',
  sad_area: 'rgba(236, 72, 153, 0.1)',
};

interface FeedbackTrendAnalysisProps {
  data: Array<{ 
    date: string; 
    formattedDate?: string;
    happy: number; 
    neutral: number; 
    sad: number; 
    total: number 
  }>;
  showComparison?: boolean;
}

const FeedbackTrendAnalysis: React.FC<FeedbackTrendAnalysisProps> = ({ 
  data,
  showComparison = false
}) => {
  // Format data for the chart
  const formattedData = data.map(item => ({
    ...item,
    // If formattedDate is already set, use it, otherwise format from date
    name: item.formattedDate || item.date,
  }));
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    // Map internal names to display names
    const displayNames: Record<string, string> = {
      happy: 'Happy',
      neutral: 'Neutral',
      sad: 'Sad',
      total: 'Total'
    };
    
    return [`${value} responses`, displayNames[name] || name];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={formattedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.happy} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.happy} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.neutral} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.neutral} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.sad} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.sad} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: COLORS.tooltip, 
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0'
                  }}
                />
                <Legend 
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                
                {/* Areas under the curves */}
                <Area 
                  type="monotone" 
                  dataKey="happy" 
                  stroke="transparent" 
                  fillOpacity={1}
                  fill="url(#colorHappy)" 
                  stackId="1"
                  name="Happy Area"
                  hide={true} // Hide from legend but show area
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke="transparent" 
                  fillOpacity={1}
                  fill="url(#colorNeutral)"
                  stackId="1"
                  name="Neutral Area"
                  hide={true} // Hide from legend but show area
                />
                <Area 
                  type="monotone" 
                  dataKey="sad" 
                  stroke="transparent" 
                  fillOpacity={1}
                  fill="url(#colorSad)"
                  stackId="1" 
                  name="Sad Area"
                  hide={true} // Hide from legend but show area
                />
                
                {/* Curved Lines with dots */}
                <Line 
                  type="monotone" 
                  dataKey="happy" 
                  name="Happy"
                  stroke={COLORS.happy} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: COLORS.happy }}
                  dot={{ r: 4, fill: COLORS.happy, strokeWidth: 2, stroke: '#fff' }}
                  strokeWidth={3}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  name="Neutral"
                  stroke={COLORS.neutral} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: COLORS.neutral }}
                  dot={{ r: 4, fill: COLORS.neutral, strokeWidth: 2, stroke: '#fff' }}
                  strokeWidth={3}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="sad" 
                  name="Sad"
                  stroke={COLORS.sad} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: COLORS.sad }}
                  dot={{ r: 4, fill: COLORS.sad, strokeWidth: 2, stroke: '#fff' }}
                  strokeWidth={3}
                  animationDuration={1000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No trend data available for the selected period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendAnalysis;
