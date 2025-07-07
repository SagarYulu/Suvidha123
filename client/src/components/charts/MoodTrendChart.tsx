
import React from 'react';
import { format, parseISO } from 'date-fns';
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
import { moodTooltipFormatter, hasData } from './ChartUtils';

interface MoodTrendChartProps {
  data: Array<{
    date: string;
    rating: number;
    count: number;
    previousRating?: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
}

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ 
  data = [], 
  showComparison = false 
}) => {
  // Safely check if data exists and has items
  if (!hasData(data)) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 text-gray-500">
        No mood trend data available to display.
      </div>
    );
  }

  // Ensure the data is sorted by date to guarantee chronological ordering
  const sortedData = [...data].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Custom tooltip that handles both current and previous data
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">
            {format(new Date(label), 'MMMM dd, yyyy')}
          </p>
          
          {/* Current period data */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-blue-500 rounded-sm" style={{ height: '2px' }} />
              <p className="text-sm text-gray-700">
                Current: <span className="font-medium">{payload[0]?.value || 'N/A'}</span> 
                <span className="ml-2 text-xs text-gray-500">
                  ({payload[0]?.payload?.count || 0} responses)
                </span>
              </p>
            </div>
            
            {/* Previous period data if available */}
            {showComparison && payload[0]?.payload?.previousRating !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-1 bg-gray-400 rounded-sm" style={{ height: '2px', borderStyle: 'dashed' }} />
                <p className="text-sm text-gray-700">
                  Previous: <span className="font-medium">{payload[0].payload.previousRating}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({payload[0]?.payload?.previousCount || 0} responses)
                  </span>
                </p>
              </div>
            )}
            
            {/* Show change if comparison is enabled */}
            {showComparison && payload[0]?.payload?.previousRating !== undefined && (
              <div className="mt-1 pt-1 border-t border-gray-200">
                <p className="text-sm">
                  Change: {" "}
                  <span className={
                    payload[0].value > payload[0].payload.previousRating 
                      ? "text-green-600 font-medium"
                      : payload[0].value < payload[0].payload.previousRating
                        ? "text-red-600 font-medium"
                        : "text-gray-600"
                  }>
                    {((payload[0].value - payload[0].payload.previousRating) || 0).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            domain={[1, 5]} 
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(value) => value.toString()}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => {
              if (value === "rating") return "Current Period";
              if (value === "previousRating") return "Previous Period";
              return value;
            }}
          />
          
          {/* Previous period line (dashed) - render conditionally but make sure it's rendered when needed */}
          {showComparison && (
            <Line
              type="monotone"
              dataKey="previousRating"
              name="previousRating"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#9CA3AF', strokeWidth: 1, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#6B7280', strokeWidth: 1, stroke: '#FFFFFF' }}
              connectNulls={true}
            />
          )}
          
          {/* Current period line (solid) */}
          <Line
            type="monotone"
            dataKey="rating"
            name="rating"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 8, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodTrendChart;
