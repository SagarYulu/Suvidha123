import authenticatedAxios from '@/services/authenticatedAxios';

export interface BusinessMetrics {
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  avgResolutionTimeFormatted: string;
  avgFirstResponseTimeFormatted: string;
  resolvedCount: number;
  respondedCount: number;
  totalIssues: number;
}

export const fetchBusinessMetrics = async (): Promise<BusinessMetrics> => {
  try {
    const response = await authenticatedAxios.get('/api/analytics/business-metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    return {
      avgResolutionTime: 0,
      avgFirstResponseTime: 0,
      avgResolutionTimeFormatted: '0 hrs',
      avgFirstResponseTimeFormatted: '0 hrs',
      resolvedCount: 0,
      respondedCount: 0,
      totalIssues: 0
    };
  }
};