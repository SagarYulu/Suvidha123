import { db } from '../db';
import { dashboardUsers } from '@shared/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';
import type { DashboardUser, InsertDashboardUser } from '@shared/schema';

export class DashboardUserModel {
  /**
   * Find dashboard user by ID
   */
  async findById(id: number): Promise<DashboardUser | undefined> {
    const result = await db
      .select()
      .from(dashboardUsers)
      .where(eq(dashboardUsers.id, id))
      .limit(1);
    
    return result[0];
  }

  /**
   * Find dashboard user by email
   */
  async findByEmail(email: string): Promise<DashboardUser | undefined> {
    const result = await db
      .select()
      .from(dashboardUsers)
      .where(eq(dashboardUsers.email, email))
      .limit(1);
    
    return result[0];
  }

  /**
   * Get all dashboard users with optional filters
   */
  async findAll(filters?: {
    city?: string;
    role?: string;
    search?: string;
  }): Promise<DashboardUser[]> {
    let query = db.select().from(dashboardUsers);
    
    if (filters) {
      const conditions = [];
      
      if (filters.city) {
        conditions.push(eq(dashboardUsers.city, filters.city));
      }
      
      if (filters.role) {
        conditions.push(eq(dashboardUsers.role, filters.role));
      }
      
      if (filters.search) {
        conditions.push(
          or(
            like(dashboardUsers.name, `%${filters.search}%`),
            like(dashboardUsers.email, `%${filters.search}%`)
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query;
  }

  /**
   * Create new dashboard user
   */
  async create(data: InsertDashboardUser): Promise<DashboardUser> {
    const result = await db
      .insert(dashboardUsers)
      .values(data)
      .returning();
    
    return result[0];
  }

  /**
   * Update dashboard user
   */
  async update(id: number, data: Partial<DashboardUser>): Promise<DashboardUser | undefined> {
    const result = await db
      .update(dashboardUsers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(dashboardUsers.id, id))
      .returning();
    
    return result[0];
  }

  /**
   * Delete dashboard user
   */
  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(dashboardUsers)
      .where(eq(dashboardUsers.id, id))
      .returning();
    
    return result.length > 0;
  }

  /**
   * Count dashboard users
   */
  async count(filters?: { city?: string; role?: string }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` }).from(dashboardUsers);
    
    if (filters) {
      const conditions = [];
      
      if (filters.city) {
        conditions.push(eq(dashboardUsers.city, filters.city));
      }
      
      if (filters.role) {
        conditions.push(eq(dashboardUsers.role, filters.role));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query;
    return result[0]?.count ?? 0;
  }

  /**
   * Bulk create dashboard users
   */
  async bulkCreate(data: InsertDashboardUser[]): Promise<DashboardUser[]> {
    if (data.length === 0) return [];
    
    return db
      .insert(dashboardUsers)
      .values(data)
      .returning();
  }
}

// Export singleton instance
export const dashboardUserModel = new DashboardUserModel();