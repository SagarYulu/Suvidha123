import { eq, desc } from 'drizzle-orm';
import { db } from '../config/db';
import { holidays, InsertHoliday, Holiday } from '../../shared/schema';

export class HolidayModel {
  /**
   * Get all holidays
   */
  async findAll(): Promise<Holiday[]> {
    return await db.select().from(holidays).orderBy(desc(holidays.date));
  }

  /**
   * Get holiday by ID
   */
  async findById(id: number): Promise<Holiday | undefined> {
    const result = await db.select().from(holidays).where(eq(holidays.id, id));
    return result[0];
  }

  /**
   * Create new holiday
   */
  async create(data: InsertHoliday): Promise<Holiday> {
    const result = await db.insert(holidays).values(data).returning();
    return result[0];
  }

  /**
   * Update holiday
   */
  async update(id: number, data: Partial<InsertHoliday>): Promise<Holiday | undefined> {
    const result = await db
      .update(holidays)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(holidays.id, id))
      .returning();
    return result[0];
  }

  /**
   * Delete holiday
   */
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(holidays).where(eq(holidays.id, id));
    return result.rowCount > 0;
  }

  /**
   * Get holidays by year
   */
  async findByYear(year: number): Promise<Holiday[]> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    return await db
      .select()
      .from(holidays)
      .where((holiday) => 
        holiday.date >= startDate && holiday.date <= endDate
      )
      .orderBy(holidays.date);
  }

  /**
   * Bulk create holidays
   */
  async bulkCreate(data: InsertHoliday[]): Promise<Holiday[]> {
    const result = await db.insert(holidays).values(data).returning();
    return result;
  }
}

export const holidayModel = new HolidayModel();