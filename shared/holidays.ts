// Indian Holiday Management System
// This module handles both fixed government holidays and configurable restricted holidays

export interface Holiday {
  id: number;
  name: string;
  date: string; // YYYY-MM-DD format
  type: 'government' | 'restricted';
  recurring: boolean; // true for annual holidays
  description?: string;
}

// Fixed Government Holidays for India (these are consistent every year)
export const GOVERNMENT_HOLIDAYS_2025: Holiday[] = [
  { id: 1, name: "New Year's Day", date: "2025-01-01", type: 'government', recurring: true },
  { id: 2, name: "Republic Day", date: "2025-01-26", type: 'government', recurring: true },
  { id: 3, name: "Independence Day", date: "2025-08-15", type: 'government', recurring: true },
  { id: 4, name: "Gandhi Jayanti", date: "2025-10-02", type: 'government', recurring: true },
  { id: 5, name: "Dussehra", date: "2025-10-02", type: 'government', recurring: false },
  { id: 6, name: "Diwali", date: "2025-10-20", type: 'government', recurring: false },
  { id: 7, name: "Holi", date: "2025-03-14", type: 'government', recurring: false },
  { id: 8, name: "Good Friday", date: "2025-04-18", type: 'government', recurring: false },
  { id: 9, name: "Eid ul-Fitr", date: "2025-04-10", type: 'government', recurring: false },
  { id: 10, name: "Eid ul-Adha", date: "2025-06-16", type: 'government', recurring: false },
];

// Working Hours Configuration
export interface WorkingHours {
  startTime: string; // "09:00" format
  endTime: string;   // "17:00" format
  workingDays: number[]; // 1=Monday, 2=Tuesday, ..., 6=Saturday, 0=Sunday
}

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  startTime: "09:00",
  endTime: "17:00",
  workingDays: [1, 2, 3, 4, 5, 6] // Monday to Saturday
};

// Business Hours Calculation Utilities
export class BusinessHoursCalculator {
  private holidays: Holiday[];
  private workingHours: WorkingHours;

  constructor(holidays: Holiday[] = GOVERNMENT_HOLIDAYS_2025, workingHours: WorkingHours = DEFAULT_WORKING_HOURS) {
    this.holidays = holidays;
    this.workingHours = workingHours;
  }

  // Check if a date is a holiday
  isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays.some(holiday => holiday.date === dateStr);
  }

  // Check if a date is a working day
  isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return this.workingHours.workingDays.includes(dayOfWeek) && !this.isHoliday(date);
  }

  // Check if a specific time is within working hours
  isWorkingTime(date: Date): boolean {
    if (!this.isWorkingDay(date)) return false;

    const timeStr = date.toTimeString().slice(0, 5); // "HH:MM"
    return timeStr >= this.workingHours.startTime && timeStr <= this.workingHours.endTime;
  }

  // Calculate business hours between two dates
  calculateBusinessHours(startDate: Date, endDate: Date): number {
    if (startDate >= endDate) return 0;

    let totalHours = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current < end) {
      if (this.isWorkingDay(current)) {
        // Calculate working hours for this day
        const dayStart = new Date(current);
        const dayEnd = new Date(current);
        
        const [startHour, startMin] = this.workingHours.startTime.split(':').map(Number);
        const [endHour, endMin] = this.workingHours.endTime.split(':').map(Number);
        
        dayStart.setHours(startHour, startMin, 0, 0);
        dayEnd.setHours(endHour, endMin, 0, 0);

        // Find the overlap between the time range and working hours
        const effectiveStart = current < dayStart ? dayStart : current;
        const effectiveEnd = end > dayEnd ? dayEnd : end;

        if (effectiveStart < effectiveEnd) {
          totalHours += (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
        }
      }

      // Move to next day
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    }

    return totalHours;
  }

  // Get next working day
  getNextWorkingDay(date: Date): Date {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (!this.isWorkingDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  }

  // Add business hours to a date
  addBusinessHours(startDate: Date, hoursToAdd: number): Date {
    const result = new Date(startDate);
    let remainingHours = hoursToAdd;
    
    while (remainingHours > 0) {
      if (this.isWorkingDay(result)) {
        const [startHour, startMin] = this.workingHours.startTime.split(':').map(Number);
        const [endHour, endMin] = this.workingHours.endTime.split(':').map(Number);
        
        const dayStart = new Date(result);
        dayStart.setHours(startHour, startMin, 0, 0);
        
        const dayEnd = new Date(result);
        dayEnd.setHours(endHour, endMin, 0, 0);
        
        const dailyWorkingHours = (dayEnd.getTime() - dayStart.getTime()) / (1000 * 60 * 60);
        
        if (remainingHours <= dailyWorkingHours) {
          result.setTime(result.getTime() + (remainingHours * 60 * 60 * 1000));
          remainingHours = 0;
        } else {
          remainingHours -= dailyWorkingHours;
          result.setDate(result.getDate() + 1);
          result.setHours(startHour, startMin, 0, 0);
        }
      } else {
        result.setDate(result.getDate() + 1);
        result.setHours(0, 0, 0, 0);
      }
    }
    
    return result;
  }
}

// Export default instance
export const businessHoursCalculator = new BusinessHoursCalculator();