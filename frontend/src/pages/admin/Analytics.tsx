import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { fetchBusinessMetrics, BusinessMetrics } from "@/services/businessMetricsService";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import { ISSUE_TYPES } from "@/config/issueTypes";
import FilterBar from "@/components/dashboard/FilterBar";
import { useDashboardData } from "@/hooks/useDashboardData";
import TrendAnalysisSection from "@/components/admin/analytics/TrendAnalysisSection";
import SLAAnalysisSection from "@/components/admin/analytics/SLAAnalysisSection";
import AnalyticsDateRangeFilter from "@/components/admin/analytics/AnalyticsDateRangeFilter";
import AnalyticsExportSection from "@/components/admin/analytics/AnalyticsExportSection";
import ExportDialog from "@/components/admin/export/ExportDialog";
import ScalableDistributionChart from "@/components/admin/analytics/ScalableDistributionChart";

const AdminAnalytics = () => {
  const { 
    analytics, 
    isLoading, 
    filters, 
    handleFilterChange,
    typePieData,
    cityBarData,
    issues
  } = useDashboardData();

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  
  useEffect(() => {
    const loadBusinessMetrics = async () => {
      const metrics = await fetchBusinessMetrics();
      setBusinessMetrics(metrics);
    };
    
    loadBusinessMetrics();
  }, []);

  const COLORS = [
    '#1E40AF', '#3B82F6', '#93C5FD', '#BFDBFE', 
    '#FBBF24', '#F59E0B', '#D97706', 
    '#10B981', '#059669', '#047857'
  ];

  const getIssueTypeLabel = (typeId: string) => {
    const issueType = ISSUE_TYPES.find(type => type.id === typeId);
    return issueType?.label || typeId;
  };

  const getClusterBarData = () => {
    if (!analytics?.clusterCounts) return [];
    
    return Object.entries(analytics.clusterCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  };

  const getManagerBarData = () => {
    if (!analytics?.managerCounts) return [];
    
    return Object.entries(analytics.managerCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  };

  // Custom label for the donut chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2; // Position outside the donut
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
      >
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Custom tooltip for issues by type
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = typePieData.reduce((sum, item) => sum + item.value, 0);
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{((data.value / total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout title="Analytics">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for issue management
          </p>
        </div>
        <Button 
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <FilterBar 
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      {/* Date Range Filter and Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnalyticsDateRangeFilter 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <AnalyticsExportSection 
          issues={issues}
          analytics={analytics}
          filters={filters}
          dateRange={dateRange}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalIssues || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All issues raised</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics ? (analytics.resolutionRate.toFixed(1) + '%') : '0%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Issues resolved / total issues</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avg Resolution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{businessMetrics?.avgResolutionTimeFormatted || '0 hrs'}</div>
                <p className="text-xs text-muted-foreground mt-1">Working hours (9AM-5PM, Mon-Sat)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">First Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{businessMetrics?.avgFirstResponseTimeFormatted || '0 hrs'}</div>
                <p className="text-xs text-muted-foreground mt-1">Working hours (9AM-5PM, Mon-Sat)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Open Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.openIssues || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Issues pending resolution</p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis Section */}
          <TrendAnalysisSection filters={filters} />

          {/* SLA Analysis Section */}
          <SLAAnalysisSection filters={filters} />

          {/* Main Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Type</CardTitle>
                <CardDescription>Distribution of issues by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={140}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {typePieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Issues by City</CardTitle>
                <CardDescription>Distribution of issues across cities</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cityBarData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                    barCategoryGap="25%"
                  >
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#1E40AF" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#047857" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#D97706" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fontWeight: 600 }}
                      tickLine={{ stroke: '#6B7280' }}
                      axisLine={{ stroke: '#6B7280' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: '#6B7280' }}
                      axisLine={{ stroke: '#6B7280' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                      }}
                    />
                    <Bar dataKey="value" name="Issues" radius={[8, 8, 0, 0]} maxBarSize={60}>
                      {cityBarData.map((entry, index) => {
                        const gradients = ['url(#blueGradient)', 'url(#greenGradient)', 'url(#orangeGradient)', 'url(#redGradient)', 'url(#purpleGradient)'];
                        return (
                          <Cell key={`cell-${index}`} fill={gradients[index % gradients.length]} />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts - Scalable Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <ScalableDistributionChart
              data={getClusterBarData()}
              title="Issues by Cluster"
              dataKey="value"
              colors={['#FBBF24', '#F59E0B', '#D97706', '#92400E', '#451A03', '#FEF3C7', '#FDE68A', '#FCD34D']}
              maxDisplayItems={10}
            />
            
            <ScalableDistributionChart
              data={getManagerBarData()}
              title="Issues by Manager"
              dataKey="value"
              colors={['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#D1FAE5', '#A7F3D0', '#6EE7B7']}
              maxDisplayItems={8}
            />
          </div>
        </div>
      )}

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        exportType="analytics"
        title="Analytics Data"
      />
    </AdminLayout>
  );
};

export default AdminAnalytics;
