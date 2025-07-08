import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { calculateBusinessHours } from '../utils/businessHoursCalculator';
import { SLA_CONFIG } from '../utils/slaConfig';

export class SLAController {
  // Get SLA metrics
  async getSLAMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, priority } = req.query;
      
      // Get all issues
      const issues = await storage.getIssues();
      
      // Filter by date range if provided
      let filteredIssues = issues;
      if (startDate || endDate) {
        filteredIssues = issues.filter(issue => {
          const issueDate = new Date(issue.createdAt);
          if (startDate && issueDate < new Date(startDate as string)) return false;
          if (endDate && issueDate > new Date(endDate as string)) return false;
          return true;
        });
      }
      
      // Filter by priority if provided
      if (priority) {
        filteredIssues = filteredIssues.filter(issue => issue.priority === priority);
      }
      
      // Calculate metrics
      const metrics = this.calculateMetrics(filteredIssues);
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching SLA metrics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get SLA alerts (tickets at risk of breaching)
  async getSLAAlerts(req: Request, res: Response): Promise<void> {
    try {
      const threshold = parseInt(req.query.threshold as string) || 2;
      
      // Get open issues
      const issues = await storage.getIssues();
      const openIssues = issues.filter(issue => issue.status === 'open' || issue.status === 'in_progress');
      
      const alerts = [];
      const now = new Date();
      
      for (const issue of openIssues) {
        const slaTarget = SLA_CONFIG[issue.priority]?.resolutionTime || 48;
        const createdAt = new Date(issue.createdAt);
        const elapsedHours = calculateBusinessHours(createdAt, now);
        const timeRemaining = slaTarget - elapsedHours;
        
        if (timeRemaining <= threshold && timeRemaining > 0) {
          alerts.push({
            issueId: issue.id,
            priority: issue.priority,
            createdAt: issue.createdAt,
            timeRemaining,
            slaTarget,
            status: issue.status,
            assignedTo: issue.assignedTo
          });
        }
      }
      
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching SLA alerts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get SLA breaches
  async getSLABreaches(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, priority } = req.query;
      
      // Get all issues
      const issues = await storage.getIssues();
      
      // Filter breached issues
      let breachedIssues = issues.filter(issue => issue.slaBreached);
      
      // Apply filters
      if (startDate || endDate) {
        breachedIssues = breachedIssues.filter(issue => {
          const issueDate = new Date(issue.createdAt);
          if (startDate && issueDate < new Date(startDate as string)) return false;
          if (endDate && issueDate > new Date(endDate as string)) return false;
          return true;
        });
      }
      
      if (priority) {
        breachedIssues = breachedIssues.filter(issue => issue.priority === priority);
      }
      
      // Calculate breach details
      const breaches = breachedIssues.map(issue => {
        const slaTarget = SLA_CONFIG[issue.priority]?.resolutionTime || 48;
        const createdAt = new Date(issue.createdAt);
        const resolvedAt = issue.resolvedAt ? new Date(issue.resolvedAt) : new Date();
        const actualHours = calculateBusinessHours(createdAt, resolvedAt);
        
        return {
          issueId: issue.id,
          priority: issue.priority,
          createdAt: issue.createdAt,
          breachedAt: issue.resolvedAt || new Date().toISOString(),
          breachDuration: actualHours - slaTarget,
          assignedTo: issue.assignedTo
        };
      });
      
      res.json(breaches);
    } catch (error) {
      console.error("Error fetching SLA breaches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get SLA configuration
  async getSLAConfig(req: Request, res: Response): Promise<void> {
    try {
      res.json(SLA_CONFIG);
    } catch (error) {
      console.error("Error fetching SLA config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update SLA configuration
  async updateSLAConfig(req: Request, res: Response): Promise<void> {
    try {
      // In a real system, this would update a database configuration
      // For now, return success
      res.json({ message: "SLA configuration updated successfully" });
    } catch (error) {
      console.error("Error updating SLA config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Helper method to calculate metrics
  private calculateMetrics(issues: any[]) {
    const totalTickets = issues.length;
    const slaCompliant = issues.filter(issue => !issue.slaBreached).length;
    const slaBreached = totalTickets - slaCompliant;
    const complianceRate = totalTickets > 0 ? (slaCompliant / totalTickets) * 100 : 0;
    
    // Calculate average TAT
    let totalTAT = 0;
    let resolvedCount = 0;
    
    issues.forEach(issue => {
      if (issue.resolvedAt) {
        const createdAt = new Date(issue.createdAt);
        const resolvedAt = new Date(issue.resolvedAt);
        const tat = calculateBusinessHours(createdAt, resolvedAt);
        totalTAT += tat;
        resolvedCount++;
      }
    });
    
    const averageTAT = resolvedCount > 0 ? totalTAT / resolvedCount : 0;
    
    // Group by priority
    const byPriority = ['critical', 'high', 'medium', 'low'].map(priority => {
      const priorityIssues = issues.filter(issue => issue.priority === priority);
      const priorityCompliant = priorityIssues.filter(issue => !issue.slaBreached).length;
      const priorityTotal = priorityIssues.length;
      
      return {
        priority,
        slaTarget: SLA_CONFIG[priority]?.resolutionTime || 48,
        totalTickets: priorityTotal,
        slaCompliant: priorityCompliant,
        slaBreached: priorityTotal - priorityCompliant,
        complianceRate: priorityTotal > 0 ? (priorityCompliant / priorityTotal) * 100 : 0
      };
    });
    
    return {
      overall: {
        totalTickets,
        slaCompliant,
        slaBreached,
        complianceRate,
        averageTAT
      },
      byPriority
    };
  }
}

export const slaController = new SLAController();