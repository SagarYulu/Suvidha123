import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataItem {
  name: string;
  value: number;
}

interface ScalableDistributionChartProps {
  data: DataItem[];
  title: string;
  dataKey?: string;
  colors?: string[];
  maxDisplayItems?: number;
}

const ScalableDistributionChart: React.FC<ScalableDistributionChartProps> = ({
  data,
  title,
  dataKey = "value",
  colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C', '#38BDF8', '#A3E635', '#FDE047', '#FF8A80'],
  maxDisplayItems = 8
}) => {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState('bar');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const topData = useMemo(() => {
    if (sortedData.length <= maxDisplayItems) {
      return sortedData;
    }

    const top = sortedData.slice(0, maxDisplayItems - 1);
    const others = sortedData.slice(maxDisplayItems - 1);
    const othersSum = others.reduce((sum, item) => sum + item.value, 0);
    
    return [
      ...top,
      { name: `Others (${others.length})`, value: othersSum }
    ];
  }, [sortedData, maxDisplayItems]);

  const pieData = useMemo(() => {
    return topData.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length]
    }));
  }, [topData, colors]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            {`${dataKey}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-blue-600">
            {`Issues: ${payload[0].payload.value}`}
          </p>
        </div>
      );
    }
    return null;
  };



  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline" className="ml-2">
            {data.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bar">Ranking</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="list">Full List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="mt-4">
            <div className="h-[350px] space-y-2 overflow-y-auto">
              {(() => {
                // Group items by value to handle ties
                const groupedByValue = topData.reduce((acc, item) => {
                  if (!acc[item.value]) acc[item.value] = [];
                  acc[item.value].push(item);
                  return acc;
                }, {});
                
                // Sort by value descending and create ranked groups
                const sortedValues = Object.keys(groupedByValue)
                  .map(Number)
                  .sort((a, b) => b - a);
                
                let currentRank = 1;
                const rankedGroups = [];
                
                sortedValues.forEach(value => {
                  const items = groupedByValue[value];
                  rankedGroups.push({
                    rank: currentRank,
                    value: value,
                    items: items,
                    count: items.length
                  });
                  currentRank += items.length;
                });
                
                return rankedGroups.map((group, groupIndex) => {
                  const percentage = (group.value / Math.max(...topData.map(d => d.value))) * 100;
                  
                  // Define gradient colors with decreasing intensity
                  const getGradientColors = (rank) => {
                    const colors = [
                      { bg: 'from-red-100 to-red-50', badge: 'from-red-600 to-red-700', bar: 'from-red-500 to-red-600', border: 'border-red-200' },
                      { bg: 'from-orange-100 to-orange-50', badge: 'from-orange-500 to-orange-600', bar: 'from-orange-400 to-orange-500', border: 'border-orange-200' },
                      { bg: 'from-yellow-100 to-yellow-50', badge: 'from-yellow-500 to-yellow-600', bar: 'from-yellow-400 to-yellow-500', border: 'border-yellow-200' },
                      { bg: 'from-green-100 to-green-50', badge: 'from-green-500 to-green-600', bar: 'from-green-400 to-green-500', border: 'border-green-200' },
                      { bg: 'from-blue-100 to-blue-50', badge: 'from-blue-500 to-blue-600', bar: 'from-blue-400 to-blue-500', border: 'border-blue-200' },
                      { bg: 'from-indigo-100 to-indigo-50', badge: 'from-indigo-500 to-indigo-600', bar: 'from-indigo-400 to-indigo-500', border: 'border-indigo-200' },
                      { bg: 'from-purple-100 to-purple-50', badge: 'from-purple-500 to-purple-600', bar: 'from-purple-400 to-purple-500', border: 'border-purple-200' },
                      { bg: 'from-pink-100 to-pink-50', badge: 'from-pink-500 to-pink-600', bar: 'from-pink-400 to-pink-500', border: 'border-pink-200' },
                      { bg: 'from-teal-100 to-teal-50', badge: 'from-teal-500 to-teal-600', bar: 'from-teal-400 to-teal-500', border: 'border-teal-200' },
                      { bg: 'from-cyan-100 to-cyan-50', badge: 'from-cyan-500 to-cyan-600', bar: 'from-cyan-400 to-cyan-500', border: 'border-cyan-200' }
                    ];
                    return colors[(rank - 1) % colors.length];
                  };
                  
                  const colors = getGradientColors(group.rank);
                  
                  return (
                    <div 
                      key={`group-${groupIndex}`}
                      className={`relative flex items-center p-3 rounded-lg border bg-gradient-to-r ${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-md`}
                    >
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 bg-gradient-to-r ${colors.badge} text-white`}>
                        {group.rank}
                      </div>
                      
                      {/* Names and Progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            {group.count === 1 ? (
                              <span className="font-medium text-gray-900 truncate">{group.items[0].name}</span>
                            ) : group.count <= 3 ? (
                              <div className="flex flex-wrap gap-1">
                                {group.items.map((item, itemIndex) => (
                                  <span 
                                    key={itemIndex}
                                    className="text-xs font-medium text-gray-800 bg-white bg-opacity-60 px-2 py-1 rounded"
                                  >
                                    {item.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <div className="flex items-center gap-2 cursor-pointer hover:bg-white hover:bg-opacity-30 rounded-md p-1 transition-all duration-200">
                                    <span className="font-medium text-gray-900">
                                      {group.count} tied
                                    </span>
                                    <span className="text-xs text-gray-600 hover:text-blue-600 transition-colors">
                                      ({group.items.slice(0, 2).map(item => item.name).join(', ')}{group.count > 2 ? `, +${group.count - 2} more` : ''})
                                    </span>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r ${getGradientColors(group.rank).badge}`}>
                                        {group.rank}
                                      </span>
                                      Rank {group.rank} - {group.value} Issues ({group.count} tied)
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <p className="text-sm text-gray-600 mb-4">
                                      All participants tied for rank {group.rank}:
                                    </p>
                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                                      {group.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                                          <span className="font-medium text-gray-900">{item.name}</span>
                                          <Badge variant="secondary" className="text-xs">
                                            {group.value} issues
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-gray-700 ml-2">{group.value} issues</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${colors.bar}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </TabsContent>
          
          <TabsContent value="pie" className="mt-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            <div className="h-[350px]">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {sortedData.slice(0, showAll ? sortedData.length : 20).map((item, index) => {
                    // Calculate proper ranking for equal values
                    const uniqueValues = [...new Set(sortedData.map(d => d.value))].sort((a, b) => b - a);
                    const rank = uniqueValues.indexOf(item.value) + 1;
                    
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.value}</Badge>
                          <Badge variant="outline" className="text-xs">
                            #{rank}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {sortedData.length > 20 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show All ({sortedData.length - 20} more)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScalableDistributionChart;