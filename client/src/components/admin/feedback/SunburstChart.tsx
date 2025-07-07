
import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';
import { TooltipProps } from 'recharts/types/component/Tooltip';

// Emoji mapping for sentiment types
const SENTIMENT_EMOJIS: Record<string, string> = {
  'Happy': '😊',
  'Neutral': '😐', 
  'Sad': '😞'
};

// Define the data structure for sunburst chart
export interface SunburstItem {
  id: string;
  name: string;
  value: number;
  color: string;
  children?: SunburstItem[];
}

interface SunburstChartProps {
  data: SunburstItem[];
  title?: string;
  totalCount: number;
}

// Custom tooltip for the Sunburst chart with enhanced styling
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isChild = data.parent !== undefined;
    const name = data.name;
    const value = data.value;
    const parentName = isChild ? data.parent : null;
    const parentValue = isChild ? data.parentValue : data.totalValue;
    
    // Calculate percentages correctly based on whether it's a parent or child segment
    const categoryPercentage = isChild 
      ? `${((value / parentValue) * 100).toFixed(1)}% of ${parentName}`
      : '';
    const totalPercentage = `${((value / data.totalValue) * 100).toFixed(1)}% of total feedback`;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        {isChild ? (
          <div className="font-medium mb-1 text-gray-600">
            <span className="text-gray-800">{parentName}</span> &gt; {name}
          </div>
        ) : (
          <div className="font-medium mb-1">{name}</div>
        )}
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Count:</span> {value}</div>
          {isChild && <div><span className="font-semibold">Category:</span> {categoryPercentage}</div>}
          <div><span className="font-semibold">Overall:</span> {totalPercentage}</div>
        </div>
      </div>
    );
  }
  return null;
};

// Define active shape for hover effect with enhanced styling
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value, totalValue, parentValue, parent
  } = props;
  
  // Calculate percentage for label
  const isMainCategory = !parent;
  let percentage = '';
  
  if (isMainCategory) {
    percentage = ((value / totalValue) * 100).toFixed(0) + '%';
  } else if (parentValue) {
    percentage = ((value / parentValue) * 100).toFixed(0) + '%';
  }
  
  // Only show percentage on outer ring if segment is large enough
  const showPercentage = (endAngle - startAngle) > 15;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      
      {/* Show percentage label if segment is large enough */}
      {showPercentage && (
        <text
          x={
            cx +
            (outerRadius + (isMainCategory ? 0 : 15) - (outerRadius - innerRadius) / 2) *
            Math.cos((startAngle + endAngle) / 2 * Math.PI / 180)
          }
          y={
            cy +
            (outerRadius + (isMainCategory ? 0 : 15) - (outerRadius - innerRadius) / 2) *
            Math.sin((startAngle + endAngle) / 2 * Math.PI / 180)
          }
          textAnchor="middle"
          fill={isMainCategory ? "#333" : "#fff"}
          fontSize={isMainCategory ? 12 : 10}
          fontWeight="bold"
        >
          {percentage}
        </text>
      )}
      
      {/* Optional: Show label for small segments as a line to outside */}
      {!showPercentage && !isMainCategory && (
        <>
          <path
            d={`M${
              cx + outerRadius * Math.cos((startAngle + endAngle) / 2 * Math.PI / 180)
            },${
              cy + outerRadius * Math.sin((startAngle + endAngle) / 2 * Math.PI / 180)
            }L${
              cx + (outerRadius + 20) * Math.cos((startAngle + endAngle) / 2 * Math.PI / 180)
            },${
              cy + (outerRadius + 20) * Math.sin((startAngle + endAngle) / 2 * Math.PI / 180)
            }`}
            stroke="#fff"
            strokeWidth={1}
            fill="none"
          />
        </>
      )}
    </g>
  );
};

// Legend item component - Enhanced for better readability
const LegendItem = ({ color, name, value, total }: { color: string, name: string, value: number, total: number }) => {
  const percentage = ((value / total) * 100).toFixed(1);
  const emoji = SENTIMENT_EMOJIS[name] || '';
  
  return (
    <div className="flex items-center gap-2">
      <div 
        className="h-3 w-3 rounded-full" 
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium">
        {emoji && <span className="mr-1">{emoji}</span>}
        {name}
      </span>
      <span className="text-xs text-gray-500">({value} | {percentage}%)</span>
    </div>
  );
};

const SunburstChart: React.FC<SunburstChartProps> = ({ 
  data, 
  title = "Feedback Breakdown by Sentiment and Reason",
  totalCount
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Function to generate gradient colors within a sentiment family
  const generateGradientShades = (baseColor: string, childCount: number, index: number) => {
    // Convert hex to HSL for easier manipulation
    const hexToHSL = (hex: string) => {
      // Remove the # if present
      hex = hex.replace(/^#/, '');
      
      // Convert hex to RGB
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      
      // Find greatest and smallest channel values
      const cmin = Math.min(r, g, b);
      const cmax = Math.max(r, g, b);
      const delta = cmax - cmin;
      
      let h = 0;
      let s = 0;
      let l = 0;
      
      // Calculate hue
      if (delta === 0) h = 0;
      else if (cmax === r) h = ((g - b) / delta) % 6;
      else if (cmax === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      
      // Calculate lightness
      l = (cmax + cmin) / 2;
      
      // Calculate saturation
      s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      
      // Convert to percentages
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);
      
      return { h, s, l };
    };
    
    // Create distinct gradient colors for each child
    const hsl = hexToHSL(baseColor);
    
    // Adjust saturation and lightness based on index to create visually distinct segments
    // For small datasets, we make a more noticeable difference
    const minLightness = Math.max(hsl.l - 18, 25); // Darker for higher values
    const maxLightness = Math.min(hsl.l + 10, 70); // Don't go too light
    
    // Calculate unique lightness and saturation values for each child
    const lightnessRange = maxLightness - minLightness;
    const lightness = maxLightness - (index / Math.max(childCount - 1, 1)) * lightnessRange;
    
    // Adjust saturation to enhance visual distinction
    const saturation = Math.min(hsl.s + (index * 5), 100);
    
    // Convert back to hex
    const hslToHex = (h: number, s: number, l: number) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };
    
    return hslToHex(hsl.h, saturation, lightness);
  };
  
  // Process data for the chart
  const processData = useCallback((data: SunburstItem[]) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const outerRingData: any[] = [];
    
    // Process inner ring (sentiment categories)
    const innerRingData = data.map((item, index) => {
      // Sort children by value (descending) to ensure consistent color assignment
      const sortedChildren = item.children 
        ? [...item.children].sort((a, b) => b.value - a.value)
        : [];
      
      // Process children (sub-reasons)
      if (sortedChildren && sortedChildren.length > 0) {
        sortedChildren.forEach((child, childIndex) => {
          outerRingData.push({
            id: `${item.id}-${child.id}`,
            name: child.name,
            value: child.value,
            color: generateGradientShades(item.color, sortedChildren.length, childIndex),
            parent: item.name,
            parentValue: item.value,
            totalValue,
            parentIndex: index
          });
        });
      }
      
      return {
        id: item.id,
        name: item.name,
        value: item.value,
        color: item.color,
        totalValue
      };
    });
    
    return { innerRingData, outerRingData };
  }, []);
  
  // Handle pie enter/leave events
  const onPieEnter = (_, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };
  
  // Check if data is empty
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
  
  const { innerRingData, outerRingData } = processData(data);
  
  // Create legend data from inner ring
  const legendData = innerRingData.map(item => ({
    name: item.name,
    color: item.color,
    value: item.value,
    total: item.totalValue
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Center text showing total count */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium"
                fill="#333"
              >
                <tspan x="50%" dy="-10">Total Feedback</tspan>
                <tspan x="50%" dy="20" fontSize="18" fontWeight="bold">
                  {totalCount}
                </tspan>
              </text>
              
              {/* Inner ring - Main categories (Sentiment) */}
              <Pie
                data={innerRingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={2}
                activeIndex={activeIndex === null ? undefined : activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {innerRingData.map((entry, index) => (
                  <Cell 
                    key={`cell-inner-${index}`} 
                    fill={entry.color} 
                    stroke="#fff" 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              
              {/* Outer ring - Sub-reasons */}
              <Pie
                data={outerRingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={1}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {outerRingData.map((entry, index) => (
                  <Cell 
                    key={`cell-outer-${index}`} 
                    fill={entry.color} 
                    stroke="#fff" 
                    strokeWidth={1.5}
                  />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend - Enhanced for better visualization */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 px-2 bg-gray-50 py-3 rounded-md">
          {legendData.map((item, index) => (
            <LegendItem 
              key={`legend-${index}`} 
              color={item.color} 
              name={item.name} 
              value={item.value} 
              total={item.total} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SunburstChart;
