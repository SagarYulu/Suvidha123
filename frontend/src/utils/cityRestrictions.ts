/**
 * City Restrictions Utility
 * Manages city-based access control for dashboard users
 */

import { useAuth } from "@/contexts/AuthContext";
import { useRBAC } from "@/contexts/RBACContext";

export interface CityRestrictionsConfig {
  userCity: string | null;
  hasCityRestrictions: boolean;
  hasAllCityAccess: boolean;
  allowedCities: string[];
}

/**
 * Hook to get user's city restrictions
 */
export const useCityRestrictions = (): CityRestrictionsConfig => {
  const { authState } = useAuth();
  const { hasPermission } = useRBAC();

  const userCity = (authState.user as any)?.city || null;
  const hasCityRestrictions = hasPermission('access:city_restricted') && !hasPermission('access:all_cities');
  const hasAllCityAccess = hasPermission('access:all_cities');

  const allowedCities = hasAllCityAccess 
    ? ['Bangalore', 'Delhi', 'Mumbai'] // All cities
    : hasCityRestrictions && userCity 
      ? [userCity] 
      : [];

  return {
    userCity,
    hasCityRestrictions,
    hasAllCityAccess,
    allowedCities
  };
};

/**
 * Filter employees based on city restrictions
 */
export const filterEmployeesByCity = (employees: any[], cityConfig: CityRestrictionsConfig) => {
  if (!cityConfig.hasCityRestrictions || cityConfig.hasAllCityAccess) {
    return employees;
  }

  return employees.filter(employee => 
    cityConfig.allowedCities.includes(employee.city)
  );
};

/**
 * Filter issues based on city restrictions
 */
export const filterIssuesByCity = (issues: any[], employees: any[], cityConfig: CityRestrictionsConfig) => {
  if (!cityConfig.hasCityRestrictions || cityConfig.hasAllCityAccess) {
    return issues;
  }

  // Create a map of employee ID to city for efficient lookup
  const employeeCityMap = new Map<number, string>();
  employees.forEach(emp => {
    employeeCityMap.set(emp.id, emp.city);
  });

  return issues.filter(issue => {
    const employeeCity = employeeCityMap.get(issue.employeeId);
    return employeeCity && cityConfig.allowedCities.includes(employeeCity);
  });
};

/**
 * Filter dashboard users based on city restrictions
 */
export const filterDashboardUsersByCity = (users: any[], cityConfig: CityRestrictionsConfig) => {
  if (!cityConfig.hasCityRestrictions || cityConfig.hasAllCityAccess) {
    return users;
  }

  return users.filter(user => 
    cityConfig.allowedCities.includes(user.city)
  );
};

/**
 * Get city-specific analytics filters
 */
export const getCityAnalyticsFilters = (cityConfig: CityRestrictionsConfig) => {
  if (!cityConfig.hasCityRestrictions || cityConfig.hasAllCityAccess) {
    return {}; // No filters applied
  }

  return {
    cities: cityConfig.allowedCities
  };
};

/**
 * Check if user can access data from specific city
 */
export const canAccessCity = (targetCity: string, cityConfig: CityRestrictionsConfig): boolean => {
  if (!cityConfig.hasCityRestrictions || cityConfig.hasAllCityAccess) {
    return true;
  }

  return cityConfig.allowedCities.includes(targetCity);
};

/**
 * Get city restriction message for UI
 */
export const getCityRestrictionMessage = (cityConfig: CityRestrictionsConfig): string => {
  if (!cityConfig.hasCityRestrictions) {
    return '';
  }

  const cityList = cityConfig.allowedCities.join(', ');
  return `Access restricted to: ${cityList}`;
};