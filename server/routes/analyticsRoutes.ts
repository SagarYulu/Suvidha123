import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware } from '../middleware/rbac';
import { db } from '../config/db';
import { issues, employees, dashboardUsers, ticketFeedback } from '@shared/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { BusinessHoursAnalytics } from '../utils/businessHoursAnalytics';

const router = Router();

// Dashboard analytics
router.get('/dashboard', authMiddleware, rbacMiddleware(['view:dashboard']), async (req, res) => {
  try {
    const { startDate, endDate, city, cluster } = req.query;
    
    // Build filters
    const filters = [];
    if (startDate) filters.push(gte(issues.createdAt, new Date(startDate as string)));
    if (endDate) filters.push(lte(issues.createdAt, new Date(endDate as string)));
    
    // Get issues with filters
    const issuesData = await db.select().from(issues).where(and(...filters));
    
    // Calculate metrics
    const totalIssues = issuesData.length;
    const openIssues = issuesData.filter(i => i.status === 'open').length;
    const resolvedIssues = issuesData.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    const avgResolutionTime = issuesData
      .filter(i => i.closedAt)
      .reduce((acc, i) => {
        const created = new Date(i.createdAt);
        const closed = new Date(i.closedAt!);
        return acc + (closed.getTime() - created.getTime());
      }, 0) / (resolvedIssues || 1);
    
    res.json({
      totalIssues,
      openIssues,
      resolvedIssues,
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60)), // in hours
      issuesByStatus: {
        open: issuesData.filter(i => i.status === 'open').length,
        in_progress: issuesData.filter(i => i.status === 'in_progress').length,
        resolved: issuesData.filter(i => i.status === 'resolved').length,
        closed: issuesData.filter(i => i.status === 'closed').length
      },
      issuesByPriority: {
        low: issuesData.filter(i => i.priority === 'low').length,
        medium: issuesData.filter(i => i.priority === 'medium').length,
        high: issuesData.filter(i => i.priority === 'high').length,
        critical: issuesData.filter(i => i.priority === 'critical').length
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// Business metrics (average resolution time, first response time)
router.get('/business-metrics', authMiddleware, rbacMiddleware(['view:dashboard']), async (req, res) => {
  try {
    const { startDate, endDate, city, cluster } = req.query;
    
    // Build filters
    const filters = [];
    if (startDate) filters.push(gte(issues.createdAt, new Date(startDate as string)));
    if (endDate) filters.push(lte(issues.createdAt, new Date(endDate as string)));
    
    // Get issues with filters
    const issuesData = await db.select().from(issues).where(and(...filters));
    
    // Use BusinessHoursAnalytics to calculate metrics
    const analytics = new BusinessHoursAnalytics();
    const metrics = analytics.calculateMetrics(issuesData);
    
    // Count resolved and responded issues
    const resolvedCount = issuesData.filter(i => 
      i.status === 'resolved' || i.status === 'closed'
    ).length;
    
    const respondedCount = issuesData.filter(i => i.firstResponseAt).length;
    
    // Format time to hours
    const formatHours = (hours: number): string => {
      if (hours === 0) return '0 hrs';
      if (hours < 1) return `${Math.round(hours * 60)} mins`;
      return `${hours.toFixed(1)} hrs`;
    };
    
    res.json({
      avgResolutionTime: metrics.avgResolutionTime,
      avgFirstResponseTime: metrics.avgFirstResponseTime,
      avgResolutionTimeFormatted: formatHours(metrics.avgResolutionTime),
      avgFirstResponseTimeFormatted: formatHours(metrics.avgFirstResponseTime),
      resolvedCount,
      respondedCount,
      totalIssues: issuesData.length
    });
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    res.status(500).json({ error: 'Failed to fetch business metrics' });
  }
});

// Tickets by city
router.get('/tickets-by-city', authMiddleware, rbacMiddleware(['view:issue_analytics']), async (req, res) => {
  try {
    const result = await db.select({
      city: employees.city,
      count: sql<number>`count(${issues.id})`
    })
    .from(issues)
    .leftJoin(employees, eq(issues.employeeId, employees.id))
    .groupBy(employees.city);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching tickets by city:', error);
    res.status(500).json({ error: 'Failed to fetch tickets by city' });
  }
});

// Tickets by type
router.get('/tickets-by-type', authMiddleware, rbacMiddleware(['view:issue_analytics']), async (req, res) => {
  try {
    const result = await db.select({
      type: issues.typeId,
      subType: issues.subTypeId,
      count: sql<number>`count(${issues.id})`
    })
    .from(issues)
    .groupBy(issues.typeId, issues.subTypeId);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching tickets by type:', error);
    res.status(500).json({ error: 'Failed to fetch tickets by type' });
  }
});

// Agent performance
router.get('/agent-performance', authMiddleware, rbacMiddleware(['view:issue_analytics']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = [];
    if (startDate) filters.push(gte(issues.updatedAt, new Date(startDate as string)));
    if (endDate) filters.push(lte(issues.updatedAt, new Date(endDate as string)));
    
    const result = await db.select({
      agentId: issues.assignedTo,
      agentName: dashboardUsers.name,
      totalAssigned: sql<number>`count(${issues.id})`,
      resolved: sql<number>`count(case when ${issues.status} = 'resolved' or ${issues.status} = 'closed' then 1 end)`,
      avgResolutionTime: sql<number>`avg(EXTRACT(EPOCH FROM (${issues.closedAt} - ${issues.createdAt})) / 3600)`
    })
    .from(issues)
    .leftJoin(dashboardUsers, eq(issues.assignedTo, dashboardUsers.id))
    .where(and(...filters))
    .groupBy(issues.assignedTo, dashboardUsers.name);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    res.status(500).json({ error: 'Failed to fetch agent performance' });
  }
});

// Trends analysis
router.get('/trends', authMiddleware, rbacMiddleware(['view:issue_analytics']), async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }
    
    // Get daily issue counts
    const result = await db.select({
      date: sql<string>`DATE(${issues.createdAt})`,
      count: sql<number>`count(${issues.id})`,
      resolvedCount: sql<number>`count(case when ${issues.status} = 'resolved' or ${issues.status} = 'closed' then 1 end)`
    })
    .from(issues)
    .where(and(
      gte(issues.createdAt, startDate),
      lte(issues.createdAt, endDate)
    ))
    .groupBy(sql`DATE(${issues.createdAt})`)
    .orderBy(sql`DATE(${issues.createdAt})`);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Export analytics data
router.get('/export', authMiddleware, rbacMiddleware(['view:issue_analytics']), async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const filters = [];
    if (startDate) filters.push(gte(issues.createdAt, new Date(startDate as string)));
    if (endDate) filters.push(lte(issues.createdAt, new Date(endDate as string)));
    
    const data = await db.select({
      issueId: issues.id,
      description: issues.description,
      type: issues.typeId,
      subType: issues.subTypeId,
      status: issues.status,
      priority: issues.priority,
      createdAt: issues.createdAt,
      closedAt: issues.closedAt,
      employeeName: employees.name,
      employeeCity: employees.city,
      assignedTo: dashboardUsers.name
    })
    .from(issues)
    .leftJoin(employees, eq(issues.employeeId, employees.id))
    .leftJoin(dashboardUsers, eq(issues.assignedTo, dashboardUsers.id))
    .where(and(...filters));
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

export default router;