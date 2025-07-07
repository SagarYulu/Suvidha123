// Business Hours Analytics Service
// Handles SLA, TAT, and response time calculations based on Indian business hours

import { BusinessHoursCalculator, GOVERNMENT_HOLIDAYS_2025 } from '../shared/holidays';
import { Issue } from '../shared/schema';

export interface BusinessHoursMetrics {
  avgResolutionTime: number; // in business hours
  avgFirstResponseTime: number; // in business hours
  slaCompliance: number; // percentage
  tatMetrics: {
    withinSLA: number;
    exceededSLA: number;
    avgTAT: number;
  };
}

export interface SLAConfig {
  critical: { responseHours: 1; resolutionHours: 4 };
  high: { responseHours: 2; resolutionHours: 8 };
  medium: { responseHours: 4; resolutionHours: 24 };
  low: { responseHours: 8; resolutionHours: 48 };
}

export const DEFAULT_SLA_CONFIG: SLAConfig = {
  critical: { responseHours: 1, resolutionHours: 4 },
  high: { responseHours: 2, resolutionHours: 8 },
  medium: { responseHours: 4, resolutionHours: 24 },
  low: { responseHours: 8, resolutionHours: 48 },
};

export class BusinessHoursAnalytics {
  private calculator: BusinessHoursCalculator;
  private slaConfig: SLAConfig;

  constructor(holidays = GOVERNMENT_HOLIDAYS_2025, slaConfig = DEFAULT_SLA_CONFIG) {
    this.calculator = new BusinessHoursCalculator(holidays);
    this.slaConfig = slaConfig;
  }

  // Calculate business hours metrics for a set of issues
  calculateMetrics(issues: Issue[]): BusinessHoursMetrics {
    const resolvedIssues = issues.filter(issue => 
      issue.status === 'closed' || issue.status === 'resolved'
    );

    const resolutionTimes = resolvedIssues
      .filter(issue => issue.resolvedAt)
      .map(issue => this.calculateResolutionTime(issue))
      .filter(time => time > 0);

    const responseTimeData = issues
      .filter(issue => issue.firstResponseAt)
      .map(issue => this.calculateFirstResponseTime(issue))
      .filter(time => time > 0);

    const slaCompliance = this.calculateSLACompliance(issues);
    const tatMetrics = this.calculateTATMetrics(issues);

    return {
      avgResolutionTime: resolutionTimes.length > 0 
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
        : 0,
      avgFirstResponseTime: responseTimeData.length > 0 
        ? responseTimeData.reduce((sum, time) => sum + time, 0) / responseTimeData.length 
        : 0,
      slaCompliance,
      tatMetrics,
    };
  }

  // Calculate resolution time in business hours
  private calculateResolutionTime(issue: Issue): number {
    if (!issue.resolvedAt || !issue.createdAt) return 0;
    
    const createdAt = new Date(issue.createdAt);
    const resolvedAt = new Date(issue.resolvedAt);
    
    return this.calculator.calculateBusinessHours(createdAt, resolvedAt);
  }

  // Calculate first response time in business hours
  private calculateFirstResponseTime(issue: Issue): number {
    if (!issue.firstResponseAt || !issue.createdAt) return 0;
    
    const createdAt = new Date(issue.createdAt);
    const firstResponseAt = new Date(issue.firstResponseAt);
    
    return this.calculator.calculateBusinessHours(createdAt, firstResponseAt);
  }

  // Calculate SLA compliance percentage
  private calculateSLACompliance(issues: Issue[]): number {
    if (issues.length === 0) return 0;

    const slaCompliantCount = issues.filter(issue => {
      const priority = issue.priority || 'medium';
      const slaConfig = this.slaConfig[priority as keyof SLAConfig];
      
      if (!slaConfig) return false;

      // Check response time SLA
      if (issue.firstResponseAt) {
        const responseTime = this.calculateFirstResponseTime(issue);
        if (responseTime > slaConfig.responseHours) return false;
      }

      // Check resolution time SLA (only for resolved issues)
      if (issue.resolvedAt) {
        const resolutionTime = this.calculateResolutionTime(issue);
        if (resolutionTime > slaConfig.resolutionHours) return false;
      }

      return true;
    }).length;

    return (slaCompliantCount / issues.length) * 100;
  }

  // Calculate TAT metrics
  private calculateTATMetrics(issues: Issue[]): BusinessHoursMetrics['tatMetrics'] {
    const resolvedIssues = issues.filter(issue => 
      issue.status === 'closed' || issue.status === 'resolved'
    );

    if (resolvedIssues.length === 0) {
      return { withinSLA: 0, exceededSLA: 0, avgTAT: 0 };
    }

    let withinSLA = 0;
    let exceededSLA = 0;
    let totalTAT = 0;

    resolvedIssues.forEach(issue => {
      const priority = issue.priority || 'medium';
      const slaConfig = this.slaConfig[priority as keyof SLAConfig];
      const resolutionTime = this.calculateResolutionTime(issue);
      
      totalTAT += resolutionTime;
      
      if (resolutionTime <= slaConfig.resolutionHours) {
        withinSLA++;
      } else {
        exceededSLA++;
      }
    });

    return {
      withinSLA,
      exceededSLA,
      avgTAT: totalTAT / resolvedIssues.length,
    };
  }

  // Get SLA status for a specific issue
  getSLAStatus(issue: Issue): 'onTime' | 'nearBreach' | 'breached' | 'pending' {
    const priority = issue.priority || 'medium';
    const slaConfig = this.slaConfig[priority as keyof SLAConfig];
    
    if (!slaConfig) return 'pending';

    const createdAt = issue.createdAt ? new Date(issue.createdAt) : new Date();
    const now = new Date();
    
    // If issue is resolved, check if it was within SLA
    if (issue.resolvedAt) {
      const resolutionTime = this.calculateResolutionTime(issue);
      return resolutionTime <= slaConfig.resolutionHours ? 'onTime' : 'breached';
    }

    // For open issues, check how much time has passed
    const elapsedTime = this.calculator.calculateBusinessHours(createdAt, now);
    const resolutionSLA = slaConfig.resolutionHours;
    
    if (elapsedTime >= resolutionSLA) {
      return 'breached';
    } else if (elapsedTime >= resolutionSLA * 0.8) {
      return 'nearBreach';
    } else {
      return 'pending';
    }
  }

  // Calculate trend data with business hours
  calculateTrendData(issues: Issue[], startDate: Date, endDate: Date) {
    const trendData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayIssues = issues.filter(issue => {
        const issueDate = issue.createdAt ? new Date(issue.createdAt) : new Date();
        return issueDate.toISOString().split('T')[0] === dateStr;
      });

      const resolvedToday = dayIssues.filter(issue => {
        if (!issue.resolvedAt) return false;
        const resolvedDate = new Date(issue.resolvedAt);
        return resolvedDate.toISOString().split('T')[0] === dateStr;
      });

      const avgResponseTime = this.calculateDayAverageResponseTime(dayIssues);
      const avgResolutionTime = this.calculateDayAverageResolutionTime(resolvedToday);

      trendData.push({
        date: dateStr,
        avgResponseTime,
        avgResolutionTime,
        ticketCount: dayIssues.length,
        resolvedCount: resolvedToday.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trendData;
  }

  private calculateDayAverageResponseTime(issues: Issue[]): number {
    const responseTimes = issues
      .filter(issue => issue.firstResponseAt)
      .map(issue => this.calculateFirstResponseTime(issue))
      .filter(time => time > 0);

    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
  }

  private calculateDayAverageResolutionTime(issues: Issue[]): number {
    const resolutionTimes = issues
      .filter(issue => issue.resolvedAt)
      .map(issue => this.calculateResolutionTime(issue))
      .filter(time => time > 0);

    return resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
      : 0;
  }
}

// Export default instance
export const businessHoursAnalytics = new BusinessHoursAnalytics();