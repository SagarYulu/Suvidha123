/**
 * Timezone utility functions for Indian Standard Time (IST)
 * IST is UTC+5:30
 */

/**
 * Get current date and time in IST
 */
export function getCurrentISTTime(): Date {
  const now = new Date();
  // Convert UTC to IST (UTC + 5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  return new Date(now.getTime() + istOffset);
}

/**
 * Convert UTC date to IST
 */
export function convertUTCtoIST(utcDate: Date): Date {
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  return new Date(utcDate.getTime() + istOffset);
}

/**
 * Format date in IST for display
 */
export function formatISTDate(date: Date): string {
  const istDate = convertUTCtoIST(date);
  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Get IST timestamp string for database storage
 * Returns a formatted string that won't be converted by Drizzle
 */
export function getISTTimestamp(): string {
  const now = new Date();
  // Convert to IST timezone
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  // Format as YYYY-MM-DD HH:mm:ss IST
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  const hours = String(istTime.getHours()).padStart(2, '0');
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  const seconds = String(istTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} IST`;
}