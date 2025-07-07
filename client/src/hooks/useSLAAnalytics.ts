
import { useState, useEffect } from 'react';
import { IssueFilters } from '@/services/issues/issueFilters';
import { getIssues } from '@/services/issues/issueFilters';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { getIssueTypeLabel } from '@/services/issues/issueTypeHelpers';
import { calculateWorkingHours } from '@/utils/workingTimeUtils';

interface SLAOverviewData {
  name: string;
  value: number;
}

interface SLABreachTrendData {
  date: string;
  breached: number;
  onTime: number;
  atRisk: number;
}

interface SLAPerformanceData {
  type: string;
  complianceRate: number;
  breachRate: number;
  avgResolutionTime: number;
}

interface SLAMetrics {
  onTime: number;
  breached: number;
  atRisk: number;
  compliance: string;
}

// SLA thresholds in WORKING HOURS - ALIGNED WITH SUPABASE
const SLA_THRESHOLDS = {
  'low': 4,        // 4 working hours
  'medium': 24,    // 24 working hours
  'high': 72,      // 72 working hours
  'critical': 72   // More than 72 working hours (we use 72 as threshold)
};

export const useSLAAnalytics = (filters: IssueFilters) => {
  const [slaOverviewData, setSlaOverviewData] = useState<SLAOverviewData[]>([]);
  const [slaBreachTrendData, setSlaBreachTrendData] = useState<SLABreachTrendData[]>([]);
  const [slaPerformanceData, setSlaPerformanceData] = useState<SLAPerformanceData[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getSLAThreshold = (priority: string): number => {
    return SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS] || SLA_THRESHOLDS.medium;
  };

  const calculateSLAStatus = (issue: any) => {
    const threshold = getSLAThreshold(issue.priority);
    const now = new Date().toISOString();
    const createdAt = issue.createdAt;
    
    if (issue.closedAt) {
      // Closed ticket - check if it was resolved within SLA using working hours
      const workingHoursToResolve = calculateWorkingHours(createdAt, issue.closedAt);
      
      if (issue.priority === 'critical') {
        return workingHoursToResolve > 72 ? 'breached' : 'onTime';
      } else {
        return workingHoursToResolve <= threshold ? 'onTime' : 'breached';
      }
    } else {
      // Open ticket - check current working hours age against SLA
      const currentWorkingAge = calculateWorkingHours(createdAt, now);
      
      if (issue.priority === 'critical') {
        if (currentWorkingAge > 72) {
          return 'breached';
        } else if (currentWorkingAge > 72 * 0.8) {
          return 'atRisk';
        } else {
          return 'pending';
        }
      } else {
        if (currentWorkingAge > threshold) {
          return 'breached';
        } else if (currentWorkingAge > threshold * 0.8) {
          return 'atRisk';
        } else {
          return 'pending';
        }
      }
    }
  };

  useEffect(() => {
    const fetchSLAData = async () => {
      setIsLoading(true);
      try {
        // Fetch all issues with current filters
        const allIssues = await getIssues(filters);
        console.log("SLA Analytics: Processing", allIssues.length, "issues");
        
        if (allIssues.length === 0) {
          setSlaOverviewData([
            { name: 'On Time', value: 0 },
            { name: 'Breached', value: 0 },
            { name: 'At Risk', value: 0 },
            { name: 'Pending', value: 0 }
          ]);
          setSlaMetrics({
            onTime: 0,
            breached: 0,
            atRisk: 0,
            compliance: '0%'
          });
          setSlaBreachTrendData([]);
          setSlaPerformanceData([]);
          setIsLoading(false);
          return;
        }
        
        // Calculate SLA status for each issue using WORKING HOURS and correct priority-based SLA
        const issuesWithSLA = allIssues.map(issue => {
          const slaStatus = calculateSLAStatus(issue);
          console.log(`Issue ${issue.id}: Priority = ${issue.priority}, Status = ${slaStatus}`);
          return {
            ...issue,
            slaStatus
          };
        });

        // Generate overview data
        const slaStatusCounts = issuesWithSLA.reduce((acc, issue) => {
          acc[issue.slaStatus] = (acc[issue.slaStatus] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log("SLA Status Counts:", slaStatusCounts);

        const overview: SLAOverviewData[] = [
          { name: 'On Time', value: slaStatusCounts.onTime || 0 },
          { name: 'Breached', value: slaStatusCounts.breached || 0 },
          { name: 'At Risk', value: slaStatusCounts.atRisk || 0 },
          { name: 'Pending', value: slaStatusCounts.pending || 0 }
        ];

        setSlaOverviewData(overview);

        // Calculate metrics
        const totalIssues = issuesWithSLA.length;
        const onTimeCount = slaStatusCounts.onTime || 0;
        const compliance = totalIssues > 0 ? ((onTimeCount / totalIssues) * 100).toFixed(1) + '%' : '0%';

        setSlaMetrics({
          onTime: onTimeCount,
          breached: slaStatusCounts.breached || 0,
          atRisk: slaStatusCounts.atRisk || 0,
          compliance
        });

        // Generate trend data for the last 7 days - simpler calculation
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return {
            date: format(date, 'yyyy-MM-dd'),
            start: startOfDay(date),
            end: endOfDay(date)
          };
        });

        const trendData: SLABreachTrendData[] = last7Days.map(({ date, start, end }) => {
          // Filter issues that were created or active on this date
          const relevantIssues = issuesWithSLA.filter(issue => {
            const createdDate = new Date(issue.createdAt);
            const closedDate = issue.closedAt ? new Date(issue.closedAt) : null;
            
            // Include issues that were created on or before this date
            // and either not closed yet or closed after this date
            return createdDate <= end && (!closedDate || closedDate >= start);
          });

          // Use the actual SLA status for each issue (already calculated)
          const counts = relevantIssues.reduce((acc, issue) => {
            acc[issue.slaStatus] = (acc[issue.slaStatus] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return {
            date,
            breached: counts.breached || 0,
            onTime: counts.onTime || 0,
            atRisk: counts.atRisk || 0
          };
        });

        setSlaBreachTrendData(trendData);

        // Generate performance by type data using WORKING HOURS for SLA calculation
        const typeGroups = issuesWithSLA.reduce((acc, issue) => {
          const typeLabel = getIssueTypeLabel(issue.typeId);
          if (!acc[typeLabel]) {
            acc[typeLabel] = [];
          }
          acc[typeLabel].push(issue);
          return acc;
        }, {} as Record<string, any[]>);

        const performanceData: SLAPerformanceData[] = Object.entries(typeGroups).map(([type, issues]) => {
          const onTimeCount = issues.filter(i => i.slaStatus === 'onTime').length;
          const breachedCount = issues.filter(i => i.slaStatus === 'breached').length;
          const total = issues.length;

          const complianceRate = total > 0 ? (onTimeCount / total) * 100 : 0;
          const breachRate = total > 0 ? (breachedCount / total) * 100 : 0;

          // Calculate average resolution time for closed issues using working hours
          const closedIssues = issues.filter(i => i.closedAt);
          const avgResolutionTime = closedIssues.length > 0 
            ? closedIssues.reduce((sum, issue) => {
                const workingHours = calculateWorkingHours(issue.createdAt, issue.closedAt);
                return sum + workingHours;
              }, 0) / closedIssues.length
            : 0;

          return {
            type,
            complianceRate: Math.round(complianceRate),
            breachRate: Math.round(breachRate),
            avgResolutionTime: Math.round(avgResolutionTime)
          };
        });

        setSlaPerformanceData(performanceData);

      } catch (error) {
        console.error('Error fetching SLA analytics:', error);
        setSlaOverviewData([]);
        setSlaBreachTrendData([]);
        setSlaPerformanceData([]);
        setSlaMetrics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSLAData();
  }, [filters]);

  return {
    slaOverviewData,
    slaBreachTrendData,
    slaPerformanceData,
    slaMetrics,
    isLoading
  };
};
