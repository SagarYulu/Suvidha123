import { Request, Response } from 'express';
import { pool } from '../config/db';

export class RBACController {
  // Get all roles
  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const query = `SELECT * FROM rbac_roles ORDER BY name`;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching RBAC roles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all permissions
  async getAllPermissions(req: Request, res: Response): Promise<void> {
    try {
      const query = `SELECT * FROM rbac_permissions ORDER BY name`;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching RBAC permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get permissions for a specific role
  async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        res.status(400).json({ error: "Invalid role ID" });
        return;
      }
      
      const query = `
        SELECT p.* 
        FROM rbac_permissions p
        INNER JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
        ORDER BY p.name
      `;
      
      const result = await pool.query(query, [roleId]);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update permissions for a role
  async updateRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        res.status(400).json({ error: "Invalid role ID" });
        return;
      }
      
      const { permissionIds } = req.body;
      if (!Array.isArray(permissionIds)) {
        res.status(400).json({ error: "Permission IDs must be an array" });
        return;
      }
      
      // Start transaction
      await pool.query('BEGIN');
      
      try {
        // Delete existing permissions
        await pool.query('DELETE FROM rbac_role_permissions WHERE role_id = $1', [roleId]);
        
        // Insert new permissions
        if (permissionIds.length > 0) {
          const values = permissionIds.map((permId, index) => 
            `($1, $${index + 2})`
          ).join(', ');
          
          const query = `INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES ${values}`;
          await pool.query(query, [roleId, ...permissionIds]);
        }
        
        await pool.query('COMMIT');
        res.json({ message: "Permissions updated successfully" });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error("Error updating role permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get user permissions
  async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      
      const query = `
        SELECT DISTINCT p.name 
        FROM rbac_permissions p
        INNER JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        INNER JOIN rbac_roles r ON r.id = rp.role_id
        INNER JOIN dashboard_users du ON du.role = r.name
        WHERE du.id = $1
        ORDER BY p.name
      `;
      
      const result = await pool.query(query, [userId]);
      const permissions = result.rows.map(row => row.name);
      res.json({ permissions });
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Create a new role
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      
      if (!name || !description) {
        res.status(400).json({ error: "Name and description are required" });
        return;
      }
      
      const query = `
        INSERT INTO rbac_roles (name, description) 
        VALUES ($1, $2) 
        RETURNING *
      `;
      
      const result = await pool.query(query, [name, description]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update a role
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        res.status(400).json({ error: "Invalid role ID" });
        return;
      }
      
      const { name, description } = req.body;
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }
      
      if (description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(description);
        paramCount++;
      }
      
      if (updates.length === 0) {
        res.status(400).json({ error: "No updates provided" });
        return;
      }
      
      values.push(roleId);
      const query = `
        UPDATE rbac_roles 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      
      if (result.rowCount === 0) {
        res.status(404).json({ error: "Role not found" });
        return;
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Delete a role
  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        res.status(400).json({ error: "Invalid role ID" });
        return;
      }
      
      const result = await pool.query('DELETE FROM rbac_roles WHERE id = $1', [roleId]);
      
      if (result.rowCount === 0) {
        res.status(404).json({ error: "Role not found" });
        return;
      }
      
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Assign permission to role
  async assignPermissionToRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      
      if (isNaN(roleId) || isNaN(permissionId)) {
        res.status(400).json({ error: "Invalid role or permission ID" });
        return;
      }
      
      const query = `
        INSERT INTO rbac_role_permissions (role_id, permission_id) 
        VALUES ($1, $2) 
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `;
      
      await pool.query(query, [roleId, permissionId]);
      res.status(201).json({ message: "Permission assigned successfully" });
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Remove permission from role
  async removePermissionFromRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      
      if (isNaN(roleId) || isNaN(permissionId)) {
        res.status(400).json({ error: "Invalid role or permission ID" });
        return;
      }
      
      const result = await pool.query(
        'DELETE FROM rbac_role_permissions WHERE role_id = $1 AND permission_id = $2',
        [roleId, permissionId]
      );
      
      if (result.rowCount === 0) {
        res.status(404).json({ error: "Permission assignment not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing permission from role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const rbacController = new RBACController();