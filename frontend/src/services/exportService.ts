
import { toast } from '@/hooks/use-toast';

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  priority?: string;
  format?: 'csv' | 'excel';
}

class ExportService {
  private baseUrl = '/api/export';

  async exportIssues(filters: ExportFilters = {}) {
    return this.performExport('issues', filters);
  }

  async exportAnalytics(filters: ExportFilters = {}) {
    return this.performExport('analytics', filters);
  }

  async exportFeedback(filters: ExportFilters = {}) {
    return this.performExport('feedback', filters);
  }

  private async performExport(type: string, filters: ExportFilters) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/${type}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with status ${response.status}`);
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${type}-export-${new Date().toISOString().split('T')[0]}.${filters.format === 'excel' ? 'xlsx' : 'csv'}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} data has been exported successfully.`,
      });

      return { success: true, filename };
    } catch (error) {
      console.error(`Export ${type} error:`, error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting the data.",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const exportService = new ExportService();
