
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MobileTopicRadarChartProps {
  data: Array<{
    subject: string;
    count: number;
    fullMark: number;
  }>;
}

const MobileTopicRadarChart: React.FC<MobileTopicRadarChartProps> = ({ data }) => {
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">Topic Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} width={500} height={250} data={data}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#6B7280', fontSize: 10 }} />
                <Radar
                  name="Topic Frequency"
                  dataKey="count"
                  stroke="#2563EB"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Tooltip
                  formatter={(value) => [`${value} mentions`, "Frequency"]}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
              </RadarChart>
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

export default MobileTopicRadarChart;
