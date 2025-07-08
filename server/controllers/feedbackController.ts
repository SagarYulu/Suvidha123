import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { insertTicketFeedbackSchema } from '@shared/schema';

export class FeedbackController {
  // Get feedback for a specific issue
  async getFeedbackByIssue(req: Request, res: Response): Promise<void> {
    try {
      const { issueId, employeeId } = req.query;
      
      if (!issueId) {
        res.status(400).json({ error: "Issue ID is required" });
        return;
      }
      
      const feedbacks = await storage.getTicketFeedback(parseInt(issueId as string));
      const feedback = feedbacks && feedbacks.length > 0 ? feedbacks[0] : null;
      
      if (employeeId && feedback) {
        // Check if this specific employee has provided feedback
        const employeeFeedback = feedback.employeeId === parseInt(employeeId as string);
        res.json({ exists: employeeFeedback, feedback: employeeFeedback ? feedback : null });
      } else {
        res.json({ exists: !!feedback, feedback });
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all feedback
  async getAllFeedback(req: Request, res: Response): Promise<void> {
    try {
      // If there are query parameters, use getFeedbackByIssue instead
      if (req.query.issueId || req.query.employeeId) {
        return this.getFeedbackByIssue(req, res);
      }
      
      const feedback = await storage.getTicketFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching all feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Check multiple feedback statuses
  async checkBulkFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { issueIds } = req.body;
      
      if (!Array.isArray(issueIds)) {
        res.status(400).json({ error: "Issue IDs array is required" });
        return;
      }
      
      const feedbacks = await Promise.all(
        issueIds.map(async (issueId) => {
          const feedbacks = await storage.getTicketFeedback(parseInt(issueId));
          return feedbacks && feedbacks.length > 0 ? { issueId, hasFeedback: true } : null;
        })
      );
      
      res.json({ 
        feedbacks: feedbacks.filter(f => f !== null) 
      });
    } catch (error) {
      console.error("Error checking bulk feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Submit new feedback
  async submitFeedback(req: Request, res: Response): Promise<void> {
    try {
      const feedbackData = {
        issueId: req.body.issueId,
        employeeId: req.body.employeeId,
        sentiment: req.body.sentiment,
        feedbackOption: req.body.feedbackOption,
        city: req.body.city,
        cluster: req.body.cluster,
        agentId: req.body.agentId,
        agentName: req.body.agentName
      };
      
      // Check if feedback already exists
      const existingFeedbacks = await storage.getTicketFeedback(feedbackData.issueId);
      if (existingFeedbacks && existingFeedbacks.length > 0) {
        res.status(409).json({ error: "Feedback already exists for this ticket" });
        return;
      }
      
      // Validate the data
      const validatedData = insertTicketFeedbackSchema.parse(feedbackData);
      
      const feedback = await storage.createTicketFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(400).json({ error: "Invalid feedback data" });
    }
  }

  // Get feedback analytics
  async getFeedbackAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, agentId, sentiment } = req.query;
      
      // Get all feedback
      let allFeedback = await storage.getTicketFeedback();
      
      // Apply filters
      if (startDate || endDate) {
        allFeedback = allFeedback.filter(feedback => {
          const feedbackDate = new Date(feedback.createdAt);
          if (startDate && feedbackDate < new Date(startDate as string)) return false;
          if (endDate && feedbackDate > new Date(endDate as string)) return false;
          return true;
        });
      }
      
      if (agentId) {
        allFeedback = allFeedback.filter(feedback => 
          feedback.agentId === parseInt(agentId as string)
        );
      }
      
      if (sentiment) {
        allFeedback = allFeedback.filter(feedback => 
          feedback.sentiment === sentiment
        );
      }
      
      // Calculate analytics
      const totalFeedback = allFeedback.length;
      const sentimentDistribution = {
        positive: allFeedback.filter(f => f.sentiment === 'happy').length,
        neutral: allFeedback.filter(f => f.sentiment === 'neutral').length,
        negative: allFeedback.filter(f => f.sentiment === 'sad').length
      };
      
      // Calculate average rating (map sentiment to numeric values)
      const sentimentValues = { happy: 5, neutral: 3, sad: 1 };
      const totalRating = allFeedback.reduce((sum, f) => 
        sum + (sentimentValues[f.sentiment] || 3), 0
      );
      const averageRating = totalFeedback > 0 ? totalRating / totalFeedback : 0;
      
      // Group by agent
      const feedbackByAgent = {};
      allFeedback.forEach(feedback => {
        const agentKey = feedback.agentId || 'unassigned';
        if (!feedbackByAgent[agentKey]) {
          feedbackByAgent[agentKey] = {
            agentId: feedback.agentId,
            agentName: feedback.agentName || 'Unassigned',
            totalFeedback: 0,
            sentiments: { happy: 0, neutral: 0, sad: 0 }
          };
        }
        feedbackByAgent[agentKey].totalFeedback++;
        feedbackByAgent[agentKey].sentiments[feedback.sentiment]++;
      });
      
      res.json({
        totalFeedback,
        sentimentDistribution,
        averageRating,
        feedbackByAgent: Object.values(feedbackByAgent),
        rawData: allFeedback // Include raw data for the frontend to process
      });
    } catch (error) {
      console.error("Error fetching feedback analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const feedbackController = new FeedbackController();