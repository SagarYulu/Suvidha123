
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MobileTopicBarChartProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const MobileTopicBarChart: React.FC<MobileTopicBarChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs">
              Current: <span className="font-medium">{item.count}</span> mentions
            </p>
            
            {showComparison && item.previousCount !== undefined && (
              <p className="text-xs">
                Previous: <span className="font-medium">{item.previousCount}</span> mentions
              </p>
            )}
            
            {showComparison && item.previousCount !== undefined && (
              <p className="text-xs pt-1 border-t border-gray-100">
                Change: {" "}
                <span className={
                  item.count > item.previousCount 
                    ? "text-green-600 font-medium" 
                    : item.count < item.previousCount 
                      ? "text-red-600 font-medium" 
                      : "text-gray-600"
                }>
                  {item.count > item.previousCount ? '+' : ''}
                  {item.count - item.previousCount}
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
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">Topic Frequency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  label={{ 
                    value: 'Mentions', 
                    position: 'insideLeft', 
                    angle: -90, 
                    dy: 40, 
                    dx: -5, 
                    style: { 
                      textAnchor: 'middle', 
                      fontSize: 11 
                    } 
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => (value === "previousCount" ? "Previous" : "Current")} 
                />
                
                {/* Previous period bars (if comparison enabled) */}
                {showComparison && (
                  <Bar 
                    dataKey="previousCount"
                    name="previousCount"
                    fill="#9CA3AF"
                    fillOpacity={0.6}
                    radius={[0, 0, 0, 0]}
                    barSize={12}
                  />
                )}
                
                {/* Current period bars */}
                <Bar 
                  dataKey="count" 
                  name="Current Period"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={showComparison ? 12 : 20}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${210 - index * (150 / Math.max(data.length, 1))}, 80%, 55%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No topic data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileTopicBarChart;
