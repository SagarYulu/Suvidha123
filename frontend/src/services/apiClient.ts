// API client to replace Supabase calls with server API calls
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Don't auto-redirect during login attempts
          if (!error.config?.url?.includes('/auth/login')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            
            // Redirect to appropriate login page based on current location
            if (window.location.pathname.includes('/admin')) {
              window.location.href = '/admin/login';
            } else if (window.location.pathname.includes('/mobile')) {
              window.location.href = '/mobile/login';
            } else {
              window.location.href = '/';
            }
          }
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  private async request<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>({
      url: endpoint,
      ...config,
    });
    return response as T;
  }

  // Employee methods
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployeeById(id: string) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employee: any) {
    return this.request('/employees', {
      method: 'POST',
      data: employee,
    });
  }

  async updateEmployee(id: string, updates: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      data: updates,
    });
  }

  async deleteEmployee(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateEmployees(employees: any[]) {
    return this.request('/employees/bulk', {
      method: 'POST',
      data: { employees },
    });
  }

  // Dashboard user methods
  async getDashboardUsers() {
    return this.request('/dashboard-users');
  }

  async getDashboardUserById(id: string) {
    return this.request(`/dashboard-users/${id}`);
  }

  async createDashboardUser(user: any) {
    return this.request('/dashboard-users', {
      method: 'POST',
      data: user,
    });
  }

  async updateDashboardUser(id: string, updates: any) {
    return this.request(`/dashboard-users/${id}`, {
      method: 'PUT',
      data: updates,
    });
  }

  async deleteDashboardUser(id: string) {
    return this.request(`/dashboard-users/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateDashboardUsers(users: any[]) {
    return this.request('/dashboard-users/bulk', {
      method: 'POST',
      data: { users },
    });
  }

  // Issue methods
  async getIssues(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
    }
    const queryString = params.toString();
    return this.request(`/issues${queryString ? `?${queryString}` : ''}`);
  }

  async getIssueById(id: string) {
    return this.request(`/issues/${id}`);
  }

  async createIssue(issue: any) {
    return this.request('/issues', {
      method: 'POST',
      data: issue,
    });
  }

  async updateIssue(id: string, updates: any) {
    return this.request(`/issues/${id}`, {
      method: 'PUT',
      data: updates,
    });
  }

  // Issue comment methods
  async getIssueComments(issueId: string) {
    return this.request(`/issues/${issueId}/comments`);
  }

  async createIssueComment(issueId: string, comment: any) {
    return this.request(`/issues/${issueId}/comments`, {
      method: 'POST',
      data: comment,
    });
  }

  // Ticket feedback methods
  async getTicketFeedback(issueId?: string) {
    const params = issueId ? `?issueId=${issueId}` : '';
    return this.request(`/ticket-feedback${params}`);
  }

  async createTicketFeedback(feedback: any) {
    return this.request('/ticket-feedback', {
      method: 'POST',
      data: feedback,
    });
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
  }

  // Sentiment analysis method
  async analyzeSentiment(feedback: string) {
    return this.request('/analyze-sentiment', {
      method: 'POST',
      data: { feedback },
    });
  }

  // Master data methods
  async getMasterCities() {
    return this.request('/master-cities');
  }

  async getMasterClusters() {
    return this.request('/master-clusters');
  }

  async getMasterRoles() {
    return this.request('/master-roles');
  }

  // Seed data method (for development)
  async seedData() {
    return this.request('/seed-data', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();