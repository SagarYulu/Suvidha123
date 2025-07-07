import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyDataState from '@/components/charts/EmptyDataState';

// Emoji mapping for sentiment types
const SENTIMENT_EMOJIS: Record<string, string> = {
  'Happy': '😊',
  'Neutral': '😐', 
  'Sad': '😞'
};

// Color mapping for sentiments
const SENTIMENT_COLORS: Record<string, string> = {
  'Happy': '#10B981',
  'Neutral': '#F59E0B', 
  'Sad': '#EF4444'
};

interface DonutChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface DonutChartProps {
  data: DonutChartData[];
  title?: string;
  totalCount: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="text-sm space-y-1">
          <div>Count: <span className="font-semibold">{data.value}</span></div>
          <div>Percentage: <span className="font-semibold">{data.percentage.toFixed(1)}%</span></div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend component with emojis
const CustomLegend = ({ data }: { data: DonutChartData[] }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm font-medium">
            {SENTIMENT_EMOJIS[item.name] && (
              <span className="mr-1">{SENTIMENT_EMOJIS[item.name]}</span>
            )}
            {item.name}
          </span>
          <span className="text-xs text-gray-500">
            ({item.value} | {item.percentage.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );
};

const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  title = "Sentiment Distribution",
  totalCount
}) => {
  // Check if data is empty (only show empty state if no data structure at all)
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyDataState message="No feedback data available for the selected period." />
        </CardContent>
      </Card>
    );
  }

  // Process data for the chart - include all items even with 0 values
  const chartData = data.map(item => ({
    ...item,
    percentage: totalCount > 0 ? (item.value / totalCount) * 100 : 0
  }));

  // For chart display, we need to handle zero values carefully
  // If all values are 0, show equal segments for visual representation
  const hasAnyData = chartData.some(item => item.value > 0);
  const displayData = hasAnyData ? chartData : chartData.map(item => ({ ...item, value: 1 }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-600">Total responses: {totalCount}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              
              {/* Center text showing total count */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg font-bold fill-gray-700"
              >
                <tspan x="50%" dy="-5">Total</tspan>
                <tspan x="50%" dy="20" fontSize="24">
                  {totalCount}
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend below the chart */}
        <CustomLegend data={chartData} />
      </CardContent>
    </Card>
  );
};

export default DonutChart;