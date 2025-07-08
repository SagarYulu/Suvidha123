import { Request, Response } from 'express';
import { storage } from '../services/storage';
import { insertDashboardUserSchema } from '@shared/schema';
import bcrypt from 'bcryptjs';

export class DashboardUserController {
  // Get all dashboard users
  async getAllDashboardUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await storage.getDashboardUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching dashboard users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get dashboard user by ID
  async getDashboardUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      
      const user = await storage.getDashboardUserById(userId);
      if (!user) {
        res.status(404).json({ error: "Dashboard user not found" });
        return;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Create dashboard user
  async createDashboardUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = insertDashboardUserSchema.parse(req.body);
      
      // Hash password before saving
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }
      
      const user = await storage.createDashboardUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating dashboard user:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  }

  // Update dashboard user
  async updateDashboardUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      
      const updates = { ...req.body };
      
      // Hash password if it's being updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
      
      const user = await storage.updateDashboardUser(userId, updates);
      if (!user) {
        res.status(404).json({ error: "Dashboard user not found" });
        return;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Delete dashboard user
  async deleteDashboardUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      
      const success = await storage.deleteDashboardUser(userId);
      if (!success) {
        res.status(404).json({ error: "Dashboard user not found" });
        return;
      }
      
      res.json({ message: "Dashboard user deleted successfully" });
    } catch (error) {
      console.error("Error deleting dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Bulk create dashboard users
  async bulkCreateDashboardUsers(req: Request, res: Response): Promise<void> {
    try {
      const { users } = req.body;
      
      if (!Array.isArray(users) || users.length === 0) {
        res.status(400).json({ error: "Users array is required" });
        return;
      }
      
      // Validate and hash passwords for all users
      const validatedUsers = await Promise.all(
        users.map(async (user) => {
          const validated = insertDashboardUserSchema.parse(user);
          if (validated.password) {
            validated.password = await bcrypt.hash(validated.password, 10);
          }
          return validated;
        })
      );
      
      const result = await storage.bulkCreateDashboardUsers(validatedUsers);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error bulk creating dashboard users:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  }
}

export const dashboardUserController = new DashboardUserController();