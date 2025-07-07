/**
 * City Filtering Middleware
 * Automatically filters data based on user's city restrictions
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../services/storage';

// Extend the Request interface to include user permissions
declare global {
  namespace Express {
    interface Request {
      cityRestrictions?: {
        hasCityRestrictions: boolean;
        userCity: string | null;
        allowedCities: string[];
      };
    }
  }
}

/**
 * Middleware to check and set city restrictions for the current user
 */
export const applyCityRestrictions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return next();
    }

    // Initialize city restrictions object
    req.cityRestrictions = {
      hasCityRestrictions: false,
      userCity: null,
      allowedCities: []
    };

    // Get user's role and permissions from RBAC system
    if (user.userType === 'dashboard_user') {
      const userId = user.userId;
      
      // Get user's role and city
      const dashboardUser = await storage.getDashboardUserById(userId);
      if (!dashboardUser) {
        return next();
      }

      // Get user's RBAC permissions
      const userRoles = await storage.getUserRoles(userId);
      const permissions = [];
      
      for (const roleId of userRoles) {
        const rolePermissions = await storage.getRolePermissions(roleId);
        permissions.push(...rolePermissions);
      }

      const hasAllCityAccess = permissions.some(p => p.name === 'access:all_cities');
      const hasCityRestricted = permissions.some(p => p.name === 'access:city_restricted');

      // If user has city restrictions and not all-city access
      if (hasCityRestricted && !hasAllCityAccess && dashboardUser.city) {
        req.cityRestrictions = {
          hasCityRestrictions: true,
          userCity: dashboardUser.city,
          allowedCities: [dashboardUser.city]
        };
        
        console.log(`City restrictions applied for user ${userId}: ${dashboardUser.city}`);
      } else if (hasAllCityAccess) {
        req.cityRestrictions = {
          hasCityRestrictions: false,
          userCity: dashboardUser.city,
          allowedCities: ['Bangalore', 'Delhi', 'Mumbai'] // All cities
        };
      }
    }

    next();
  } catch (error) {
    console.error('Error applying city restrictions:', error);
    next();
  }
};

/**
 * Filter employees based on city restrictions
 */
export const filterEmployeesByCity = (employees: any[], cityRestrictions: any) => {
  if (!cityRestrictions?.hasCityRestrictions) {
    return employees;
  }

  return employees.filter(emp => 
    cityRestrictions.allowedCities.includes(emp.city)
  );
};

/**
 * Filter issues based on city restrictions by looking up employee cities
 */
export const filterIssuesByCity = async (issues: any[], cityRestrictions: any) => {
  if (!cityRestrictions?.hasCityRestrictions) {
    return issues;
  }

  // Get all unique employee IDs from issues
  const employeeIds = [...new Set(issues.map(issue => issue.employeeId))];
  
  // Get employees in batches to avoid performance issues
  const employees = await storage.getEmployeesByIds(employeeIds);
  
  // Create a map of employee ID to city for efficient lookup
  const employeeCityMap = new Map();
  employees.forEach(emp => {
    employeeCityMap.set(emp.id, emp.city);
  });

  // Filter issues based on employee cities
  return issues.filter(issue => {
    const employeeCity = employeeCityMap.get(issue.employeeId);
    return employeeCity && cityRestrictions.allowedCities.includes(employeeCity);
  });
};

/**
 * Filter dashboard users based on city restrictions
 */
export const filterDashboardUsersByCity = (users: any[], cityRestrictions: any) => {
  if (!cityRestrictions?.hasCityRestrictions) {
    return users;
  }

  return users.filter(user => 
    cityRestrictions.allowedCities.includes(user.city)
  );
};