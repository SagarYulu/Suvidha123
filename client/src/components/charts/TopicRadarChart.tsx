
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TopicRadarChartProps {
  data: Array<{
    subject: string;
    count: number;
    previousCount?: number;
    fullMark: number;
  }>;
  showComparison?: boolean;
}

const TopicRadarChart: React.FC<TopicRadarChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  // Custom tooltip for radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{item.subject}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              Current: <span className="font-medium">{item.count}</span> mentions
            </p>
            
            {showComparison && item.previousCount !== undefined && (
              <p className="text-sm">
                Previous: <span className="font-medium">{item.previousCount}</span> mentions
              </p>
            )}
            
            {showComparison && item.previousCount !== undefined && (
              <p className="text-sm pt-1 border-t border-gray-100">
                Change: {" "}
                <span className={
                  item.count > item.previousCount 
                    ? "text-green-600 font-medium" 
                    : item.count < item.previousCount 
                      ? "text-red-600 font-medium" 
                      : "text-gray-600"
                }>
                  {item.count > item.previousCount ? '+' : ''}
                  {item.count - item.previousCount} mentions
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius={90} width={730} height={250} data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickLine={false}
            // Handle long topic names by wrapping text
            tickFormatter={(value) => {
              if (value.length > 12) {
                return value.slice(0, 10) + '...';
              }
              return value;
            }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#6B7280', fontSize: 10 }} />
          
          {/* Previous period radar */}
          {showComparison && (
            <Radar
              name="Previous Period"
              dataKey="previousCount"
              stroke="#9CA3AF"
              fill="#9CA3AF"
              fillOpacity={0.3}
              strokeDasharray="5 5"
            />
          )}
          
          {/* Current period radar */}
          <Radar
            name="Current Period"
            dataKey="count"
            stroke="#2563EB"
            fill="#3B82F6"
            fillOpacity={0.6}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicRadarChart;
