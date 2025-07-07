import { Request, Response } from 'express';
import { issueModel } from '../models/Issue';
import { insertIssueSchema } from '@shared/schema';
import { storage } from '../storage';

export class IssueController {
  /**
   * Get all issues with filters
   */
  async getIssues(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const filters = req.query;
      
      // Apply city-based filtering if needed
      if (user.permissions?.includes('access:city_restricted') && user.city) {
        filters.city = user.city;
      }
      
      const issues = await issueModel.findAll(filters as any);
      return res.json(issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      return res.status(500).json({ error: 'Failed to fetch issues' });
    }
  }

  /**
   * Get issue by ID
   */
  async getIssue(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const issue = await issueModel.findById(id);
      
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      return res.json(issue);
    } catch (error) {
      console.error('Error fetching issue:', error);
      return res.status(500).json({ error: 'Failed to fetch issue' });
    }
  }

  /**
   * Create new issue
   */
  async createIssue(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const validation = insertIssueSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }
      
      // Set employee ID based on user type
      const issueData = {
        ...validation.data,
        employeeId: user.userType === 'employee' ? user.id : validation.data.employeeId
      };
      
      const issue = await issueModel.create(issueData);
      
      // Create audit trail
      await storage.createIssueAuditTrail({
        issueId: issue.id,
        action: 'created',
        actionBy: user.id,
        actionByType: user.userType,
        changes: { status: 'open' }
      });
      
      return res.status(201).json(issue);
    } catch (error) {
      console.error('Error creating issue:', error);
      return res.status(500).json({ error: 'Failed to create issue' });
    }
  }

  /**
   * Update issue
   */
  async updateIssue(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const currentIssue = await issueModel.findById(id);
      if (!currentIssue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      // Update issue
      const updatedIssue = await issueModel.update(id, updates);
      
      // Create audit trail
      const changes: any = {};
      if (updates.status && updates.status !== currentIssue.status) {
        changes.status = { from: currentIssue.status, to: updates.status };
        
        // Update SLA fields
        if (updates.status === 'resolved' || updates.status === 'closed') {
          await issueModel.updateSLAFields(id, { resolvedAt: new Date() });
        }
      }
      
      if (updates.assignedTo && updates.assignedTo !== currentIssue.assignedTo) {
        changes.assignedTo = { from: currentIssue.assignedTo, to: updates.assignedTo };
      }
      
      if (Object.keys(changes).length > 0) {
        await storage.createIssueAuditTrail({
          issueId: id,
          action: 'updated',
          actionBy: user.id,
          actionByType: user.userType,
          changes
        });
      }
      
      return res.json(updatedIssue);
    } catch (error) {
      console.error('Error updating issue:', error);
      return res.status(500).json({ error: 'Failed to update issue' });
    }
  }

  /**
   * Delete issue
   */
  async deleteIssue(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await issueModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      return res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
      console.error('Error deleting issue:', error);
      return res.status(500).json({ error: 'Failed to delete issue' });
    }
  }

  /**
   * Get employee's own issues
   */
  async getMyIssues(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.userType !== 'employee') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const issues = await issueModel.findByEmployeeId(user.id);
      return res.json(issues);
    } catch (error) {
      console.error('Error fetching my issues:', error);
      return res.status(500).json({ error: 'Failed to fetch issues' });
    }
  }

  /**
   * Get assigned issues
   */
  async getAssignedIssues(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.userType !== 'dashboard_user') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const issues = await issueModel.findAssignedTo(user.id);
      return res.json(issues);
    } catch (error) {
      console.error('Error fetching assigned issues:', error);
      return res.status(500).json({ error: 'Failed to fetch issues' });
    }
  }

  /**
   * Get issue statistics
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const { city, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }
      
      const stats = await issueModel.getStatistics(filters);
      return res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  /**
   * Assign issue to user
   */
  async assignIssue(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = parseInt(req.params.id);
      const { assignedTo } = req.body;
      
      const issue = await issueModel.update(id, { assignedTo });
      
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      // Create audit trail
      await storage.createIssueAuditTrail({
        issueId: id,
        action: 'assigned',
        actionBy: user.id,
        actionByType: user.userType,
        changes: { assignedTo }
      });
      
      return res.json(issue);
    } catch (error) {
      console.error('Error assigning issue:', error);
      return res.status(500).json({ error: 'Failed to assign issue' });
    }
  }

  /**
   * Update issue status
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const updates: any = { status };
      
      // Set closed/resolved timestamps
      if (status === 'closed' || status === 'resolved') {
        updates.closedAt = new Date();
        updates.resolvedAt = new Date();
      }
      
      const issue = await issueModel.update(id, updates);
      
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      // Create audit trail
      await storage.createIssueAuditTrail({
        issueId: id,
        action: 'status_changed',
        actionBy: user.id,
        actionByType: user.userType,
        changes: { status }
      });
      
      return res.json(issue);
    } catch (error) {
      console.error('Error updating status:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }
  }
}

// Export singleton instance
export const issueController = new IssueController();