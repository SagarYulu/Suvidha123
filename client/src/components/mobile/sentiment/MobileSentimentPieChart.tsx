
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SENTIMENT_COLORS, getSentimentColor, hasData } from '@/components/charts/ChartUtils';

interface MobileSentimentPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }> | undefined;
}

const MobileSentimentPieChart: React.FC<MobileSentimentPieChartProps> = ({ data }) => {
  // Safely check if data exists and has items
  const validData = hasData(data) ? data : [];
  
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {validData && validData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={validData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => {
                    // Safe handling of undefined values
                    const displayName = name || 'Unknown';
                    const displayPercent = percent ? (percent * 100).toFixed(0) : '0';
                    return `${displayName}: ${displayPercent}%`;
                  }}
                >
                  {validData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getSentimentColor(entry.name)} 
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} responses`, "Count"]}
                  contentStyle={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No sentiment data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileSentimentPieChart;
