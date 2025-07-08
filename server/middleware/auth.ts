import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../services/storage';
import { JWT_SECRET } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: 'employee' | 'dashboard_user';
    role?: string;
  };
}

// Main authentication middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token present:', !!token);
    console.log('Auth middleware - Request URL:', req.url);
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Auth middleware - Decoded token:', {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      role: decoded.role
    });
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.error('Auth middleware - JWT_SECRET:', JWT_SECRET ? 'Present' : 'Missing');
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Alias for consistency with new architecture
export const authMiddleware = authenticateToken;

// Require dashboard user
export const requireDashboardUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.userType !== 'dashboard_user') {
    return res.status(403).json({ error: 'Dashboard user access required' });
  }
  next();
};

// Require employee
export const requireEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.userType !== 'employee') {
    return res.status(403).json({ error: 'Employee access required' });
  }
  next();
};

// Check specific permission
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Skip permission check for employees - they have limited access
      if (req.user.userType === 'employee') {
        return next();
      }

      // For now, allow all dashboard users (RBAC temporarily disabled)
      if (req.user.userType === 'dashboard_user') {
        return next();
      }

      return res.status(403).json({ error: 'Insufficient permissions' });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
};