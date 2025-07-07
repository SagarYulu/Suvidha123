
import { saveAs } from 'file-saver';
import * as papa from 'papaparse';

/**
 * Convert data to CSV format and trigger download
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv',
  options?: papa.UnparseConfig
): void => {
  try {
    // Use PapaParse to convert data to CSV
    const csv = papa.unparse(data, {
      header: true,
      ...options
    });
    
    // Create a blob and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
    
    console.log(`Successfully exported data to ${filename}`);
  } catch (error) {
    console.error('Error exporting data to CSV:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Format resolution time data for CSV export
 */
export const formatResolutionTimeDataForExport = (
  data: Array<{ name: string, time: number, volume?: number, datasetType?: string }>,
  period: string
): Array<Record<string, any>> => {
  // Check if we have comparison data in the dataset
  const hasComparisonData = data.some(item => item.datasetType === 'comparison');
  
  if (!hasComparisonData) {
    // Regular export format
    return data.map(item => ({
      'Period': item.name,
      'Average Resolution Time (hours)': parseFloat(item.time.toFixed(2)),
      'Ticket Volume': item.volume || 0
    }));
  } else {
    // Group by period name for comparison data
    const groupedByName: Record<string, { primary?: any, comparison?: any }> = {};
    
    data.forEach(item => {
      if (!groupedByName[item.name]) {
        groupedByName[item.name] = {};
      }
      
      const type = item.datasetType === 'comparison' ? 'comparison' : 'primary';
      groupedByName[item.name][type] = item;
    });
    
    // Convert to comparison format
    return Object.entries(groupedByName).map(([name, group]) => {
      const primary = group.primary || { time: 0, volume: 0 };
      const comparison = group.comparison || { time: 0, volume: 0 };
      const timeDifference = primary.time - comparison.time;
      
      return {
        'Period': name,
        'Primary Resolution Time (hours)': parseFloat(primary.time.toFixed(2)),
        'Primary Ticket Volume': primary.volume || 0,
        'Comparison Resolution Time (hours)': parseFloat(comparison.time.toFixed(2)),
        'Comparison Ticket Volume': comparison.volume || 0,
        'Resolution Time Difference (hours)': parseFloat(timeDifference.toFixed(2)),
        'Difference (%)': primary.time && comparison.time 
          ? parseFloat((((primary.time - comparison.time) / comparison.time) * 100).toFixed(1)) 
          : 0
      };
    });
  }
};

/**
 * Export resolution time trend data to CSV
 */
export const exportResolutionTimeTrendToCSV = (
  data: Array<{ name: string, time: number, volume?: number, datasetType?: string }>,
  period: string
): void => {
  // Determine if this is a comparison export
  const isComparisonExport = data.some(item => item.datasetType === 'comparison');
  
  const formattedData = formatResolutionTimeDataForExport(data, period);
  let filename = `resolution-time-trend-${period}-${new Date().toISOString().split('T')[0]}.csv`;
  
  // Update filename for comparison exports
  if (isComparisonExport) {
    filename = `resolution-time-comparison-${period}-${new Date().toISOString().split('T')[0]}.csv`;
  }
  
  exportToCSV(formattedData, filename);
};
