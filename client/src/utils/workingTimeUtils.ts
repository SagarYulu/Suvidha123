import { differenceInMinutes, parseISO, isSunday, format, differenceInHours, addHours, setHours, setMinutes, isAfter, isBefore, isEqual } from 'date-fns';

interface PublicHoliday {
  date: string; // Format: 'YYYY-MM-DD'
  name: string;
}

// List of public holidays to exclude from working time calculations
// This should be moved to a database or config in production
const PUBLIC_HOLIDAYS: PublicHoliday[] = [
  { date: '2025-01-01', name: 'New Year\'s Day' },
  { date: '2025-01-26', name: 'Republic Day' },
  { date: '2025-03-15', name: 'Ugadi' },
  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-09-07', name: 'Ganesh Chaturthi' },
  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-10-22', name: 'Dussehra' },
  { date: '2025-11-12', name: 'Deepawali' },
  { date: '2025-12-25', name: 'Christmas' },
  { date: '2025-01-14', name: 'Makara Sankranti' },
  // Add more holidays as needed
];

/**
 * Checks if a given date is a public holiday
 */
export const isPublicHoliday = (date: Date): boolean => {
  const dateString = format(date, 'yyyy-MM-dd');
  return PUBLIC_HOLIDAYS.some(holiday => holiday.date === dateString);
};

/**
 * Checks if a given date is a working day (not Sunday or public holiday)
 */
export const isWorkingDay = (date: Date): boolean => {
  return !isSunday(date) && !isPublicHoliday(date);
};

/**
 * Determines if a given time is within working hours (9 AM to 5 PM)
 */
export const isWithinWorkingHours = (date: Date): boolean => {
  const hours = date.getHours();
  return hours >= 9 && hours < 17;
};

/**
 * Gets the next working day start time (9 AM)
 */
export const getNextWorkingDayStart = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(9, 0, 0, 0);
  
  // Keep incrementing until we find a working day
  while (!isWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

/**
 * Gets the working day end time (5 PM)
 */
export const getWorkingDayEnd = (date: Date): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0);
  return endOfDay;
};

/**
 * Gets the working day start time (9 AM)
 */
export const getWorkingDayStart = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0);
  return startOfDay;
};

/**
 * Calculate working hours between two timestamps
 * Excludes Sundays and public holidays, and only counts hours between 9 AM and 5 PM
 */
export const calculateWorkingHours = (startTimeStr: string, endTimeStr: string): number => {
  try {
    const startTime = parseISO(startTimeStr);
    const endTime = parseISO(endTimeStr);
    
    // If dates are invalid, return 0
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('Invalid date format for working hours calculation');
      return 0;
    }
    
    // If end time is before start time, return 0
    if (endTime < startTime) {
      return 0;
    }
    
    let totalWorkingMinutes = 0;
    let currentDate = new Date(startTime);
    
    // Calculate minutes within the same day for the start date
    if (isWorkingDay(currentDate)) {
      const endOfDay = getWorkingDayEnd(currentDate);
      const startOfDay = getWorkingDayStart(currentDate);
      
      // If start time is before work hours, adjust to 9 AM
      const effectiveStartTime = currentDate < startOfDay ? startOfDay : currentDate;
      
      // If end time is on the same day and before end of day
      if (endTime <= endOfDay && endTime.getDate() === currentDate.getDate()) {
        // If end time is after working hours, cap at end of working day (5 PM)
        const effectiveEndTime = endTime > endOfDay ? endOfDay : endTime;
        // If end time is before working hours, no minutes counted
        if (effectiveEndTime > startOfDay) {
          totalWorkingMinutes += differenceInMinutes(effectiveEndTime, effectiveStartTime);
        }
        return totalWorkingMinutes / 60; // Convert to hours
      } else {
        // Add minutes until end of this working day
        totalWorkingMinutes += differenceInMinutes(endOfDay, effectiveStartTime);
      }
    }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
    
    // Process full working days in between
    while (currentDate < endTime && 
           !(currentDate.getDate() === endTime.getDate() && 
             currentDate.getMonth() === endTime.getMonth() && 
             currentDate.getFullYear() === endTime.getFullYear())) {
      
      if (isWorkingDay(currentDate)) {
        // Add a full working day (8 hours = 480 minutes)
        totalWorkingMinutes += 480;
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add time for the last day if it's a working day
    if (isWorkingDay(endTime)) {
      const startOfLastDay = getWorkingDayStart(endTime);
      const endOfLastDay = getWorkingDayEnd(endTime);
      
      // If end time is after work hours, cap at 5 PM
      const effectiveEndTime = endTime > endOfLastDay ? endOfLastDay : endTime;
      
      // If end time is before work hours, no additional time
      if (effectiveEndTime > startOfLastDay) {
        totalWorkingMinutes += differenceInMinutes(effectiveEndTime, startOfLastDay);
      }
    }
    
    // Convert minutes to hours and return
    return totalWorkingMinutes / 60;
  } catch (error) {
    console.error('Error calculating working hours:', error);
    return 0;
  }
};

/**
 * Calculate First Response Time in working hours
 * This is the time from ticket creation to first response/update
 * Implements the enhanced business logic for FRT calculation
 */
export const calculateFirstResponseTime = (createdAt: string, firstResponseAt: string | null): number => {
  // If there's no response yet, return 0
  if (!firstResponseAt) return 0;
  
  try {
    const createdDate = parseISO(createdAt);
    const responseDate = parseISO(firstResponseAt);
    
    // If ticket was created outside working hours, adjust start time to next working day at 9 AM
    let effectiveStartTime = createdDate;
    
    // Check if ticket was created outside working hours (before 9 AM or after 5 PM)
    const isAfterWorkHours = isAfter(createdDate, getWorkingDayEnd(createdDate));
    const isBeforeWorkHours = isBefore(createdDate, getWorkingDayStart(createdDate));
    
    // Check if ticket was created on a non-working day (Sunday or holiday)
    const isOnNonWorkingDay = !isWorkingDay(createdDate);
    
    if (isAfterWorkHours || isBeforeWorkHours || isOnNonWorkingDay) {
      console.log(`Ticket created outside working hours (${format(createdDate, 'yyyy-MM-dd HH:mm')})`);
      // Set start time to next working day at 9 AM
      if (isAfterWorkHours) {
        // If after 5 PM, start from 9 AM next working day
        effectiveStartTime = getNextWorkingDayStart(createdDate);
      } else if (isOnNonWorkingDay) {
        // If on weekend or holiday, start from 9 AM next working day
        effectiveStartTime = getNextWorkingDayStart(createdDate);
      } else if (isBeforeWorkHours) {
        // If before 9 AM on a working day, start from 9 AM same day
        effectiveStartTime = getWorkingDayStart(createdDate);
      }
      
      console.log(`Adjusted start time to ${format(effectiveStartTime, 'yyyy-MM-dd HH:mm')}`);
    }
    
    // Calculate working hours between effective start time and response time
    return calculateWorkingHours(effectiveStartTime.toISOString(), firstResponseAt);
  } catch (error) {
    console.error('Error calculating first response time:', error);
    return 0;
  }
};

/**
 * Determine ticket priority based on working hours elapsed and ticket properties
 * Updated rules:
 * - Medium: Any ticket not closed/resolved within 16 working hours
 * - High: Any ticket not closed/resolved within 24 working hours
 * - Critical: Any ticket not closed/resolved within 40 working hours
 */
export const determinePriority = (
  createdAt: string,
  updatedAt: string,
  status: string,
  typeId: string,
  assignedTo?: string | null
): 'low' | 'medium' | 'high' | 'critical' => {
  // For resolved or closed tickets, priority is not applicable
  if (status === 'resolved' || status === 'closed') {
    return 'low'; // Default value, but shouldn't be displayed in UI
  }

  try {
    // Get current time for comparisons
    const now = new Date().toISOString();
    
    // Calculate working hours elapsed since creation
    const workingHoursElapsed = calculateWorkingHours(createdAt, now);
    const hoursSinceLastUpdate = calculateWorkingHours(updatedAt || createdAt, now);
    
    console.log(`[Priority] Issue status: ${status}, Working hours elapsed: ${workingHoursElapsed.toFixed(2)}, Hours since last update: ${hoursSinceLastUpdate.toFixed(2)}, Created: ${createdAt}, Updated: ${updatedAt || 'same as created'}, Current date: ${now}`);

    // UPDATED RULES based on new requirements:
    // Critical: Any ticket not closed/resolved within 40 working hours
    if (workingHoursElapsed >= 40) {
      console.log(`[Priority] CRITICAL PRIORITY ENFORCED: ${workingHoursElapsed.toFixed(2)} working hours elapsed since creation (exceeds 40hr SLA)`);
      return 'critical';
    }
    
    // High: Any ticket not closed/resolved within 24 working hours
    if (workingHoursElapsed >= 24) {
      console.log(`[Priority] HIGH PRIORITY ENFORCED: ${workingHoursElapsed.toFixed(2)} working hours elapsed since creation (exceeds 24hr SLA)`);
      return 'high';
    }
    
    // Medium: Any ticket not closed/resolved within 16 working hours
    if (workingHoursElapsed >= 16) {
      console.log(`[Priority] MEDIUM PRIORITY ENFORCED: ${workingHoursElapsed.toFixed(2)} working hours elapsed since creation (exceeds 16hr SLA)`);
      return 'medium';
    }
    
    // Check for specific high priority categories
    // Health, Insurance, Advance, ESI categories are always high priority
    const highPriorityTypes = ['health', 'insurance', 'advance', 'esi', 'medical'];
    if (typeId && highPriorityTypes.some(type => typeId.toLowerCase().includes(type))) {
      return 'high';
    }
    
    // Facility issues that are still open after 24 hours should be critical
    if (typeId.toLowerCase().includes('facility') && workingHoursElapsed > 24) {
      return 'critical';
    }
    
    // Ticket is "In Progress" but no update within 12 working hours
    if (status === 'in_progress' && hoursSinceLastUpdate > 12) {
      return 'medium';
    }
    
    // Ticket is assigned but agent has not acted within 8 hours
    if (assignedTo && hoursSinceLastUpdate > 8) {
      return 'medium';
    }
    
    // Low: Default for new or recently updated tickets
    return 'low';
  } catch (error) {
    console.error('Error in determinePriority:', error);
    // If any error occurs, return a safe default value
    return 'low';
  }
};

/**
 * Check if a notification should be sent based on priority change
 */
export const shouldSendNotification = (
  oldPriority: string, 
  newPriority: string
): boolean => {
  // Priority escalated
  return oldPriority !== newPriority && 
    (newPriority === 'medium' || 
     newPriority === 'high' || 
     newPriority === 'critical');
};

/**
 * Get recipients for notifications based on ticket priority
 */
export const getNotificationRecipients = (
  priority: string,
  assignedTo?: string | null
): string[] => {
  const recipients: string[] = [];
  
  // Always notify HR Admin for medium priority and above
  if (priority === 'medium' || priority === 'high' || priority === 'critical') {
    recipients.push('hr_admin');
  }
  
  // Add assigned agent for high and critical
  if ((priority === 'high' || priority === 'critical') && assignedTo) {
    recipients.push(assignedTo);
  }
  
  // Add Super Admin for high and critical
  if (priority === 'high' || priority === 'critical') {
    recipients.push('super_admin');
  }
  
  return recipients;
};

/**
 * Check if a ticket is reopenable based on when it was closed
 * Tickets can only be reopened within 72 hours of being closed/resolved
 */
export const isTicketReopenable = (closedAt?: string): boolean => {
  if (!closedAt) return false;
  
  const now = new Date();
  const closedDate = parseISO(closedAt);
  const hoursSinceClosed = differenceInHours(now, closedDate);
  
  return hoursSinceClosed <= 72; // Can be reopened within 72 hours
};

/**
 * Calculate when a ticket's reopening window expires
 */
export const calculateReopenableUntil = (closedAt: string): string => {
  const closedDate = parseISO(closedAt);
  const reopenableUntil = addHours(closedDate, 72);
  return reopenableUntil.toISOString();
};
