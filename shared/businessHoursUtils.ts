// Simple business hours utilities for calculating working time
// Working hours: Monday-Saturday, 9 AM - 5 PM (IST)

export interface BusinessHoursConfig {
  startHour: number; // 9 AM
  endHour: number;   // 5 PM (17:00)
  workingDays: number[]; // [1,2,3,4,5,6] = Monday to Saturday
}

export const DEFAULT_BUSINESS_CONFIG: BusinessHoursConfig = {
  startHour: 9,
  endHour: 17,
  workingDays: [1, 2, 3, 4, 5, 6] // Monday to Saturday
};

// Indian holidays 2025 (fixed dates)
export const INDIAN_HOLIDAYS_2025 = [
  '2025-01-01', // New Year
  '2025-01-26', // Republic Day
  '2025-03-14', // Holi
  '2025-04-10', // Eid ul-Fitr
  '2025-04-18', // Good Friday
  '2025-06-16', // Eid ul-Adha
  '2025-08-15', // Independence Day
  '2025-10-02', // Gandhi Jayanti & Dussehra
  '2025-10-20', // Diwali
];

export function isBusinessDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  
  // Check if it's a working day (Monday-Saturday) and not a holiday
  return DEFAULT_BUSINESS_CONFIG.workingDays.includes(dayOfWeek) && 
         !INDIAN_HOLIDAYS_2025.includes(dateStr);
}

export function isBusinessHour(date: Date): boolean {
  if (!isBusinessDay(date)) return false;
  
  const hour = date.getHours();
  return hour >= DEFAULT_BUSINESS_CONFIG.startHour && hour < DEFAULT_BUSINESS_CONFIG.endHour;
}

// Calculate business hours between two dates (simplified version)
export function calculateBusinessHours(startDate: Date, endDate: Date): number {
  if (startDate >= endDate) return 0;
  
  let businessHours = 0;
  const current = new Date(startDate);
  
  while (current < endDate) {
    if (isBusinessDay(current)) {
      // Calculate working hours for this day
      const dayStart = new Date(current);
      dayStart.setHours(DEFAULT_BUSINESS_CONFIG.startHour, 0, 0, 0);
      
      const dayEnd = new Date(current);
      dayEnd.setHours(DEFAULT_BUSINESS_CONFIG.endHour, 0, 0, 0);
      
      // Find overlap between the time range and working hours
      const effectiveStart = current < dayStart ? dayStart : current;
      const effectiveEnd = endDate > dayEnd ? dayEnd : endDate;
      
      if (effectiveStart < effectiveEnd) {
        const hoursThisDay = (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
        businessHours += hoursThisDay;
      }
    }
    
    // Move to next day
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }
  
  return businessHours;
}

// Format business hours for display
export function formatBusinessHours(hours: number): string {
  if (hours === 0) return '0 hrs';
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  return `${Math.round(hours * 10) / 10} hrs`;
}

// Calculate simple average for a set of time differences (fallback when no business hours data)
export function calculateSimpleAverageHours(startTimes: Date[], endTimes: Date[]): number {
  if (startTimes.length !== endTimes.length || startTimes.length === 0) return 0;
  
  let totalHours = 0;
  for (let i = 0; i < startTimes.length; i++) {
    const diff = endTimes[i].getTime() - startTimes[i].getTime();
    const hours = diff / (1000 * 60 * 60);
    totalHours += hours;
  }
  
  return totalHours / startTimes.length;
}