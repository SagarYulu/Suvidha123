
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';
import authenticatedAxios from '@/services/authenticatedAxios';

interface TATData {
  '≤14 days': number;
  '14-30 days': number;
  '>30 days': number;
}

interface TATChartProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
  };
}

const COLORS = {
  '≤14 days': '#10B981',
  '14-30 days': '#F59E0B',
  '>30 days': '#EF4444'
};

export const TATChart: React.FC<TATChartProps> = ({ filters = {} }) => {
  const [data, setData] = useState<TATData>({
    '≤14 days': 0,
    '14-30 days': 0,
    '>30 days': 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTATData();
  }, [filters]);

  const fetchTATData = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.cluster) queryParams.append('cluster', filters.cluster);

      const response = await authenticatedAxios.get(`/api/analytics/tat-metrics?${queryParams.toString()}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching TAT data:', error);
      toast.error('Failed to load TAT analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value: value,
    color: COLORS[key as keyof typeof COLORS]
  }));

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} issues ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">TAT data will appear once issues are resolved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {Object.entries(data).map(([key, value]) => {
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return (
            <div key={key} className="p-2">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }}
              />
              <p className="text-xs text-gray-600">{key}</p>
              <p className="font-semibold">{value}</p>
              <p className="text-xs text-gray-500">{percentage}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TATChart;
