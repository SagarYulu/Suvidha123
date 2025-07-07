import { Request, Response } from 'express';
import { holidayModel } from '../models/Holiday';
import { insertHolidaySchema } from '../../shared/schema';
import { z } from 'zod';

export class HolidayController {
  /**
   * Get all holidays
   */
  async getHolidays(req: Request, res: Response) {
    try {
      const holidays = await holidayModel.findAll();
      res.json(holidays);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      res.status(500).json({ error: 'Failed to fetch holidays' });
    }
  }

  /**
   * Get holiday by ID
   */
  async getHoliday(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const holiday = await holidayModel.findById(id);
      
      if (!holiday) {
        return res.status(404).json({ error: 'Holiday not found' });
      }
      
      res.json(holiday);
    } catch (error) {
      console.error('Error fetching holiday:', error);
      res.status(500).json({ error: 'Failed to fetch holiday' });
    }
  }

  /**
   * Create new holiday
   */
  async createHoliday(req: Request, res: Response) {
    try {
      const validatedData = insertHolidaySchema.parse(req.body);
      const holiday = await holidayModel.create(validatedData);
      res.status(201).json(holiday);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid holiday data', details: error.errors });
      }
      console.error('Error creating holiday:', error);
      res.status(500).json({ error: 'Failed to create holiday' });
    }
  }

  /**
   * Update holiday
   */
  async updateHoliday(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertHolidaySchema.partial().parse(req.body);
      
      const holiday = await holidayModel.update(id, validatedData);
      
      if (!holiday) {
        return res.status(404).json({ error: 'Holiday not found' });
      }
      
      res.json(holiday);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid holiday data', details: error.errors });
      }
      console.error('Error updating holiday:', error);
      res.status(500).json({ error: 'Failed to update holiday' });
    }
  }

  /**
   * Delete holiday
   */
  async deleteHoliday(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = await holidayModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Holiday not found' });
      }
      
      res.json({ message: 'Holiday deleted successfully' });
    } catch (error) {
      console.error('Error deleting holiday:', error);
      res.status(500).json({ error: 'Failed to delete holiday' });
    }
  }

  /**
   * Get holidays by year
   */
  async getHolidaysByYear(req: Request, res: Response) {
    try {
      const year = parseInt(req.params.year);
      
      if (isNaN(year) || year < 1900 || year > 2100) {
        return res.status(400).json({ error: 'Invalid year' });
      }
      
      const holidays = await holidayModel.findByYear(year);
      res.json(holidays);
    } catch (error) {
      console.error('Error fetching holidays by year:', error);
      res.status(500).json({ error: 'Failed to fetch holidays' });
    }
  }

  /**
   * Bulk upload holidays
   */
  async bulkUploadHolidays(req: Request, res: Response) {
    try {
      const holidaysData = req.body.holidays;
      
      if (!Array.isArray(holidaysData) || holidaysData.length === 0) {
        return res.status(400).json({ error: 'No holidays provided' });
      }
      
      // Validate all holidays
      const validatedHolidays = holidaysData.map(holiday => 
        insertHolidaySchema.parse(holiday)
      );
      
      const createdHolidays = await holidayModel.bulkCreate(validatedHolidays);
      
      res.status(201).json({ 
        message: `Successfully created ${createdHolidays.length} holidays`,
        holidays: createdHolidays
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid holiday data', details: error.errors });
      }
      console.error('Error bulk uploading holidays:', error);
      res.status(500).json({ error: 'Failed to bulk upload holidays' });
    }
  }
}

export const holidayController = new HolidayController();