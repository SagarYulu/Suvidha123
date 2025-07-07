
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getIssueTypeLabel } from "@/services/issues/issueTypeHelpers";

type ChartSectionProps = {
  typePieData: any[];
  cityBarData: any[];
  isLoading: boolean;
};

// Using memo to prevent unnecessary re-renders
const ChartSection = memo(({ typePieData, cityBarData, isLoading }: ChartSectionProps) => {
  if (isLoading) return null;
  
  // Constants for chart colors - lighter and more distinct colors
  const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C', '#38BDF8', '#A3E635'];
  
  // Special colors for cities to make them distinct
  const CITY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Format the issue type names for better display - FOR ADMIN DASHBOARD, ONLY SHOW ENGLISH
  const formattedTypePieData = typePieData.map(item => ({
    ...item,
    name: getIssueTypeLabel(item.name, false) // Pass false to only show English labels
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tickets by Type</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {formattedTypePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Outer ring */}
                <Pie
                  data={formattedTypePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {formattedTypePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* Center text overlay */}
                <text 
                  x="50%" 
                  y="45%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="fill-gray-700 text-sm font-semibold"
                >
                  Total
                </text>
                <text 
                  x="50%" 
                  y="55%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="fill-gray-800 text-lg font-bold"
                >
                  {formattedTypePieData.reduce((sum, item) => sum + item.value, 0)} issues
                </text>
                <Tooltip formatter={(value, name) => [`${value} issues`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tickets by City</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {cityBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cityBarData}
                margin={{
                  top: 20,
                  right: 40,
                  left: 20,
                  bottom: 20,
                }}
                barCategoryGap="30%"
                maxBarSize={80}
              >
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  tickFormatter={(value: any) => Math.round(Number(value)).toString()}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  domain={[0, 'dataMax + 1']}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value: any) => [Math.round(Number(value)), 'Tickets']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Tickets" 
                  radius={[4, 4, 0, 0]}
                >
                  {cityBarData.map((entry, index) => {
                    const gradients = ['url(#blueGradient)', 'url(#greenGradient)', 'url(#purpleGradient)'];
                    return (
                      <Cell key={`cell-${index}`} fill={gradients[index % gradients.length]} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

// Display name for debugging
ChartSection.displayName = 'ChartSection';

export default ChartSection;
