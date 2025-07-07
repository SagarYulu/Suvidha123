import { db } from '../db';
import { employees } from '@shared/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';
import type { Employee, InsertEmployee } from '@shared/schema';

export class EmployeeModel {
  /**
   * Find employee by ID
   */
  async findById(id: number): Promise<Employee | undefined> {
    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);
    
    return result[0];
  }

  /**
   * Find employee by email
   */
  async findByEmail(email: string): Promise<Employee | undefined> {
    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.email, email))
      .limit(1);
    
    return result[0];
  }

  /**
   * Find employee by employee ID
   */
  async findByEmployeeId(empId: string): Promise<Employee | undefined> {
    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.empId, empId))
      .limit(1);
    
    return result[0];
  }

  /**
   * Get all employees with optional filters
   */
  async findAll(filters?: {
    city?: string;
    cluster?: string;
    role?: string;
    search?: string;
  }): Promise<Employee[]> {
    let query = db.select().from(employees);
    
    if (filters) {
      const conditions = [];
      
      if (filters.city) {
        conditions.push(eq(employees.city, filters.city));
      }
      
      if (filters.cluster) {
        conditions.push(eq(employees.cluster, filters.cluster));
      }
      
      if (filters.role) {
        conditions.push(eq(employees.role, filters.role));
      }
      
      if (filters.search) {
        conditions.push(
          or(
            like(employees.name, `%${filters.search}%`),
            like(employees.email, `%${filters.search}%`),
            like(employees.empId, `%${filters.search}%`)
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
   * Create new employee
   */
  async create(data: InsertEmployee): Promise<Employee> {
    const result = await db
      .insert(employees)
      .values(data)
      .returning();
    
    return result[0];
  }

  /**
   * Update employee
   */
  async update(id: number, data: Partial<Employee>): Promise<Employee | undefined> {
    const result = await db
      .update(employees)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(employees.id, id))
      .returning();
    
    return result[0];
  }

  /**
   * Delete employee
   */
  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning();
    
    return result.length > 0;
  }

  /**
   * Get employees by IDs
   */
  async findByIds(ids: number[]): Promise<Employee[]> {
    if (ids.length === 0) return [];
    
    return db
      .select()
      .from(employees)
      .where(sql`${employees.id} = ANY(${ids})`);
  }

  /**
   * Count employees
   */
  async count(filters?: { city?: string; role?: string }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` }).from(employees);
    
    if (filters) {
      const conditions = [];
      
      if (filters.city) {
        conditions.push(eq(employees.city, filters.city));
      }
      
      if (filters.role) {
        conditions.push(eq(employees.role, filters.role));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query;
    return result[0]?.count ?? 0;
  }

  /**
   * Bulk create employees
   */
  async bulkCreate(data: InsertEmployee[]): Promise<Employee[]> {
    if (data.length === 0) return [];
    
    return db
      .insert(employees)
      .values(data)
      .returning();
  }
}

// Export singleton instance
export const employeeModel = new EmployeeModel();