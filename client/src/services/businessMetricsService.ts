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
    console.log('Fetching business metrics from /api/analytics/business-metrics');
    const response = await authenticatedAxios.get('/api/analytics/business-metrics');
    console.log('Business metrics API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching business metrics:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
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