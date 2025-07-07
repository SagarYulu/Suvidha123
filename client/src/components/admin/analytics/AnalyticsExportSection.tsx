
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { exportToCSV } from '@/utils/csvExportUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AnalyticsExportSectionProps {
  issues: any[];
  analytics: any;
  filters: any;
  dateRange: { from?: Date; to?: Date };
}

const AnalyticsExportSection: React.FC<AnalyticsExportSectionProps> = ({
  issues,
  analytics,
  filters,
  dateRange
}) => {

  const formatIssueForExport = (issue: any) => {
    return {
      'Issue ID': issue.id,
      'Employee ID': issue.employeeId,
      'Type ID': issue.typeId,
      'Sub Type ID': issue.subTypeId,
      'Description': issue.description,
      'Status': issue.status,
      'Priority': issue.priority,
      'Created At': format(new Date(issue.created_at || issue.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      'Updated At': format(new Date(issue.updated_at || issue.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      'Closed At': issue.closed_at || issue.closedAt ? format(new Date(issue.closed_at || issue.closedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      'Assigned To': issue.assigned_to || issue.assignedTo || '',
      'Mapped Type ID': issue.mapped_type_id || issue.mappedTypeId || '',
      'Mapped Sub Type ID': issue.mapped_sub_type_id || issue.mappedSubTypeId || '',
      'Mapped At': issue.mapped_at || issue.mappedAt ? format(new Date(issue.mapped_at || issue.mappedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      'Mapped By': issue.mapped_by || issue.mappedBy || '',
      'Comments Count': issue.comments ? issue.comments.length : 0,
      'Has Attachments': issue.attachments ? 'Yes' : 'No',
      'Attachment URL': issue.attachment_url || issue.attachmentUrl || ''
    };
  };

  const getFilteredIssues = () => {
    let filteredIssues = [...issues];

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filteredIssues = filteredIssues.filter(issue => {
        const issueDate = new Date(issue.created_at || issue.createdAt);
        
        if (dateRange.from && issueDate < dateRange.from) {
          return false;
        }
        
        if (dateRange.to && issueDate > dateRange.to) {
          return false;
        }
        
        return true;
      });
    }

    return filteredIssues;
  };

  const exportAllIssues = () => {
    try {
      const filteredIssues = getFilteredIssues();
      
      if (filteredIssues.length === 0) {
        toast.error('No issues found to export');
        return;
      }
      
      const formattedData = filteredIssues.map(formatIssueForExport);
      
      let filename = 'issues-export';
      
      // Add date range to filename if applied
      if (dateRange.from || dateRange.to) {
        const fromStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : 'start';
        const toStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : 'end';
        filename += `-${fromStr}-to-${toStr}`;
      }
      
      // Add current date
      filename += `-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      console.log('Exporting issues:', formattedData.length, 'issues');
      exportToCSV(formattedData, filename);
      
      toast.success(`Exported ${formattedData.length} issues successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const exportAnalyticsSummary = () => {
    try {
      if (!analytics) {
        toast.error('No analytics data available');
        return;
      }

      // Create properly structured data with clear headers and sections
      const summaryData = [];

      // Main Metrics Section
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Total Issues',
        'Value': analytics.totalIssues || 0,
        'Description': 'Total number of issues in the system',
        'Unit': 'count'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Open Issues',
        'Value': analytics.openIssues || 0,
        'Description': 'Number of issues currently open',
        'Unit': 'count'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Resolution Rate',
        'Value': analytics.resolutionRate?.toFixed(1) || 0,
        'Description': 'Percentage of issues that have been resolved',
        'Unit': 'percentage'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Average Resolution Time',
        'Value': analytics.avgResolutionTime || 0,
        'Description': 'Average time taken to resolve issues',
        'Unit': 'hours'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Average First Response Time',
        'Value': analytics.avgFirstResponseTime || 0,
        'Description': 'Average time taken for first response to issues',
        'Unit': 'hours'
      });

      // Issues by Type Section
      if (analytics.typeCounts) {
        Object.entries(analytics.typeCounts).forEach(([type, count]: [string, any]) => {
          summaryData.push({
            'Section': 'Issues by Type',
            'Metric': type,
            'Value': count,
            'Description': `Number of issues of type ${type}`,
            'Unit': 'count'
          });
        });
      }

      // Issues by City Section
      if (analytics.cityCounts) {
        Object.entries(analytics.cityCounts).forEach(([city, count]: [string, any]) => {
          summaryData.push({
            'Section': 'Issues by City',
            'Metric': city,
            'Value': count,
            'Description': `Number of issues from ${city}`,
            'Unit': 'count'
          });
        });
      }

      // Issues by Cluster Section
      if (analytics.clusterCounts) {
        Object.entries(analytics.clusterCounts).forEach(([cluster, count]: [string, any]) => {
          summaryData.push({
            'Section': 'Issues by Cluster',
            'Metric': cluster,
            'Value': count,
            'Description': `Number of issues from ${cluster} cluster`,
            'Unit': 'count'
          });
        });
      }

      const filename = `analytics-summary-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      console.log('Exporting analytics summary:', summaryData.length, 'rows');
      exportToCSV(summaryData, filename);
      
      toast.success('Analytics summary exported successfully!');
    } catch (error) {
      console.error('Analytics export failed:', error);
      toast.error('Failed to export analytics summary. Please try again.');
    }
  };

  const filteredCount = getFilteredIssues().length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          {dateRange.from || dateRange.to ? (
            <p>Filtered data: {filteredCount} issues</p>
          ) : (
            <p>Total data: {issues.length} issues</p>
          )}
        </div>
        
        <Button 
          onClick={exportAllIssues}
          className="w-full"
          variant="default"
          disabled={filteredCount === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export All Issues Data
        </Button>
        
        <Button 
          onClick={exportAnalyticsSummary}
          className="w-full"
          variant="outline"
          disabled={!analytics}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Analytics Summary
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExportSection;
