
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { CHART_COLORS, SENTIMENT_COLORS, getSentimentColor, hasData } from './ChartUtils';

interface SentimentPieChartProps {
  data: Array<{
    name: string;
    value: number;
    previousValue?: number;
  }>;
  showComparison?: boolean;
}

const SentimentPieChart: React.FC<SentimentPieChartProps> = ({ 
  data = [], 
  showComparison = false 
}) => {
  // Safely check if data exists and has items
  if (!hasData(data)) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-500">
        No sentiment data available to display.
      </div>
    );
  }
  
  // Calculate total values for percentages (with safety checks)
  const totalCurrent = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalPrevious = showComparison 
    ? data.reduce((sum, item) => sum + (item.previousValue || 0), 0)
    : 0;

  // Verify we have previous data if showComparison is true
  const hasPreviousData = showComparison && 
    totalPrevious > 0 && 
    data.some(item => item.previousValue !== undefined);

  // Custom tooltip for showing comparison data
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const currentPercent = totalCurrent > 0 
        ? ((item.value / totalCurrent) * 100).toFixed(1)
        : '0.0';
      
      let previousPercent = '0.0';
      let change = 0;
      
      if (hasPreviousData && item.previousValue !== undefined && totalPrevious > 0) {
        previousPercent = ((item.previousValue / totalPrevious) * 100).toFixed(1);
        change = parseFloat(currentPercent) - parseFloat(previousPercent);
      }

      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{item.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              Current: <span className="font-medium">{item.value}</span> 
              <span className="ml-1">({currentPercent}%)</span>
            </p>
            
            {hasPreviousData && item.previousValue !== undefined && (
              <p className="text-sm">
                Previous: <span className="font-medium">{item.previousValue}</span>
                <span className="ml-1">({previousPercent}%)</span>
              </p>
            )}
            
            {hasPreviousData && item.previousValue !== undefined && change !== 0 && (
              <p className="text-sm pt-1 border-t border-gray-100">
                Change: {" "}
                <span className={
                  change > 0 
                    ? "text-green-600 font-medium" 
                    : change < 0 
                      ? "text-red-600 font-medium" 
                      : "text-gray-600"
                }>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for the donut chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Custom legend that displays unique items only
  const CustomLegend = ({ payload }: any) => {
    // Filter out duplicate legend items
    const uniqueNames = new Set();
    const uniqueItems = payload.filter((entry: any) => {
      if (uniqueNames.has(entry.value)) {
        return false;
      }
      uniqueNames.add(entry.value);
      return true;
    });

    return (
      <ul className="flex justify-center flex-wrap mt-4">
        {uniqueItems.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center mx-2 mb-1">
            <span 
              className="inline-block w-3 h-3 mr-1 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Previous period data (if comparison is enabled) */}
          {hasPreviousData && (
            <Pie
              data={data.filter(item => item.previousValue !== undefined)}
              dataKey="previousValue"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={70}
              fill="#8884d8"
              paddingAngle={1}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-prev-${index}`}
                  fill={getSentimentColor(entry.name)}
                  opacity={0.6}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                />
              ))}
            </Pie>
          )}
          
          {/* Current period data */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={hasPreviousData ? 65 : 80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={3}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={getSentimentColor(entry.name)}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
          
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentPieChart;
