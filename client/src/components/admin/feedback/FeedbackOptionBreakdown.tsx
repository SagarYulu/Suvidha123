
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Sector
} from 'recharts';

// Enhanced color palette for better visual distinction
const COLORS = [
  '#6366F1',    // Indigo
  '#F59E0B',    // Amber
  '#EC4899',    // Pink
  '#10B981',    // Emerald
  '#8B5CF6',    // Violet
  '#3B82F6',    // Blue
  '#EF4444',    // Red
  '#14B8A6',    // Teal
  '#F97316',    // Orange
  '#06B6D4'     // Cyan
];

interface FeedbackOptionBreakdownProps {
  options: Array<{ option: string; count: number; sentiment: 'happy' | 'neutral' | 'sad' }>;
  showComparison: boolean;
}

// Custom active shape for better interaction
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, 
    fill, payload, value, percent 
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      <text x={cx} y={cy - 20} textAnchor="middle" fill="#333" fontSize={14} fontWeight={500}>
        {payload.name}
      </text>
      <text x={cx} y={cy} textAnchor="middle" fill="#333" fontSize={16} fontWeight={600}>
        {value} responses
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="#666" fontSize={14}>
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

const FeedbackOptionBreakdown: React.FC<FeedbackOptionBreakdownProps> = ({
  options,
  showComparison
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Take the top options for the chart to avoid clutter
  const topOptions = options.slice(0, 8);
  const totalResponses = topOptions.reduce((sum, item) => sum + item.count, 0);
  
  // Format data for the donut chart
  const chartData = topOptions.map((item) => ({
    name: item.option,
    value: item.count,
    sentiment: item.sentiment,
    percentage: ((item.count / totalResponses) * 100).toFixed(1)
  }));
  
  // Custom legend that shows sentiment color and percentage
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div 
            key={`item-${index}`} 
            className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full"
            style={{ borderLeft: `4px solid ${entry.color}` }}
          >
            <span className="text-xs font-medium truncate max-w-[180px]">
              {entry.value} ({entry.payload.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  // Custom tooltip with enhanced styling
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              Count: <span className="font-medium">{payload[0].value}</span>
            </p>
            <p className="text-sm">
              Percentage: <span className="font-medium">{payload[0].payload.percentage}%</span>
            </p>
            <p className="text-sm">
              Sentiment: <span className="font-medium capitalize">{payload[0].payload.sentiment}</span>
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Option Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#FFFFFF"
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend
                  content={renderCustomLegend}
                  layout="vertical"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No feedback option data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackOptionBreakdown;
