import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'FS_Grievance_Management_JWT_Secret_Key_2025_Yulu_Secure_Auth_Token';

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
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log('JWT_SECRET being used for verification:', JWT_SECRET);
    console.log('Token being verified:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Token decoded successfully:', decoded);
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      userType: decoded.userType,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    console.error('JWT verification failed - secret used:', JWT_SECRET);
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