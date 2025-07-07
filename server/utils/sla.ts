/**
 * SLA (Service Level Agreement) and TAT (Turnaround Time) calculation utilities
 * All calculations are done in IST timezone for consistency
 */

import { Issue } from "@shared/schema";

export interface SLAConfig {
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationTimeHours: number;
}

// SLA configurations based on priority (corrected as per requirements)
export const SLA_CONFIGS: SLAConfig[] = [
  {
    priority: "low",
    responseTimeHours: 1,
    resolutionTimeHours: 4,
    escalationTimeHours: 2
  },
  {
    priority: "medium",
    responseTimeHours: 2,
    resolutionTimeHours: 8,
    escalationTimeHours: 4
  },
  {
    priority: "high",
    responseTimeHours: 4,
    resolutionTimeHours: 24,
    escalationTimeHours: 12
  },
  {
    priority: "critical",
    responseTimeHours: 8,
    resolutionTimeHours: 48,
    escalationTimeHours: 24
  }
];

/**
 * Convert UTC timestamp to IST Date for calculations
 */
export function convertToIST(utcTimestamp: string | Date | null): Date {
  if (!utcTimestamp) return new Date();
  
  const utcDate = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp;
  
  // Create IST date using timezone conversion
  const istDate = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  return istDate;
}

/**
 * Get current IST time
 */
export function getCurrentIST(): Date {
  const now = new Date();
  return convertToIST(now);
}

/**
 * Calculate time difference in hours between two timestamps in IST
 */
export function calculateHoursDifference(startTime: string | Date | null, endTime: string | Date | null): number {
  if (!startTime || !endTime) return 0;
  
  const start = convertToIST(startTime);
  const end = convertToIST(endTime);
  
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // Convert to hours
}

/**
 * Get SLA configuration for a priority level
 */
export function getSLAConfig(priority: string): SLAConfig {
  return SLA_CONFIGS.find(config => config.priority === priority) || SLA_CONFIGS[2]; // Default to medium
}

/**
 * Calculate SLA metrics for an issue
 */
export function calculateSLAMetrics(issue: Issue) {
  const slaConfig = getSLAConfig(issue.priority);
  const createdAt = convertToIST(issue.createdAt);
  const currentTime = getCurrentIST();
  
  // Calculate elapsed time
  const elapsedHours = calculateHoursDifference(issue.createdAt, currentTime);
  
  // Calculate response time (time to first comment/status change)
  const responseTime = issue.firstResponseAt 
    ? calculateHoursDifference(issue.createdAt, issue.firstResponseAt)
    : null;
  
  // Calculate resolution time (time to resolution)
  const resolutionTime = (issue.status === 'resolved' || issue.status === 'closed') && issue.resolvedAt
    ? calculateHoursDifference(issue.createdAt, issue.resolvedAt)
    : null;
  
  // Check SLA breaches
  const isResponseSLABreached = responseTime !== null 
    ? responseTime > slaConfig.responseTimeHours
    : elapsedHours > slaConfig.responseTimeHours;
  
  const isResolutionSLABreached = resolutionTime !== null
    ? resolutionTime > slaConfig.resolutionTimeHours
    : elapsedHours > slaConfig.resolutionTimeHours;
  
  const isEscalationDue = elapsedHours > slaConfig.escalationTimeHours;
  
  // Calculate remaining time until SLA breach
  const responseTimeRemaining = Math.max(0, slaConfig.responseTimeHours - elapsedHours);
  const resolutionTimeRemaining = Math.max(0, slaConfig.resolutionTimeHours - elapsedHours);
  const escalationTimeRemaining = Math.max(0, slaConfig.escalationTimeHours - elapsedHours);
  
  return {
    slaConfig,
    elapsedHours,
    responseTime,
    resolutionTime,
    isResponseSLABreached,
    isResolutionSLABreached,
    isEscalationDue,
    responseTimeRemaining,
    resolutionTimeRemaining,
    escalationTimeRemaining,
    slaStatus: isResolutionSLABreached ? 'breached' : 
               isResponseSLABreached ? 'response_breached' : 
               isEscalationDue ? 'escalation_due' : 'on_track'
  };
}

/**
 * Format hours to human readable format
 */
export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : ''}`;
  }
}

/**
 * Calculate TAT (Turnaround Time) statistics for multiple issues
 */
export function calculateTATStats(issues: Issue[]) {
  const resolvedIssues = issues.filter(issue => 
    issue.status === 'resolved' || issue.status === 'closed'
  );
  
  if (resolvedIssues.length === 0) {
    return {
      averageTAT: 0,
      medianTAT: 0,
      minTAT: 0,
      maxTAT: 0,
      totalResolved: 0,
      slaComplianceRate: 0
    };
  }
  
  const tatValues = resolvedIssues.map(issue => {
    const resolvedAt = issue.resolvedAt || issue.updatedAt;
    return calculateHoursDifference(issue.createdAt, resolvedAt);
  });
  
  const slaCompliantIssues = resolvedIssues.filter(issue => {
    const slaConfig = getSLAConfig(issue.priority);
    const resolvedAt = issue.resolvedAt || issue.updatedAt;
    const tat = calculateHoursDifference(issue.createdAt, resolvedAt);
    return tat <= slaConfig.resolutionTimeHours;
  });
  
  const averageTAT = tatValues.reduce((sum, tat) => sum + tat, 0) / tatValues.length;
  const sortedTAT = tatValues.sort((a, b) => a - b);
  const medianTAT = sortedTAT[Math.floor(sortedTAT.length / 2)];
  const minTAT = Math.min(...tatValues);
  const maxTAT = Math.max(...tatValues);
  const slaComplianceRate = (slaCompliantIssues.length / resolvedIssues.length) * 100;
  
  return {
    averageTAT,
    medianTAT,
    minTAT,
    maxTAT,
    totalResolved: resolvedIssues.length,
    slaComplianceRate
  };
}

/**
 * Get issues that are about to breach SLA
 */
export function getIssuesNearSLABreach(issues: Issue[], hoursBeforeBreach: number = 1) {
  return issues
    .filter(issue => issue.status !== 'resolved' && issue.status !== 'closed')
    .map(issue => ({
      issue,
      slaMetrics: calculateSLAMetrics(issue)
    }))
    .filter(({ slaMetrics }) => 
      slaMetrics.resolutionTimeRemaining <= hoursBeforeBreach &&
      slaMetrics.resolutionTimeRemaining > 0
    );
}