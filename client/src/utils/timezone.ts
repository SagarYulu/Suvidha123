/**
 * Frontend timezone utility functions for Indian Standard Time (IST)
 * IST is UTC+5:30
 */

/**
 * Convert UTC timestamp to IST and format for display
 */
export function formatToIST(utcTimestamp: string): string {
  const utcDate = new Date(utcTimestamp);
  
  // Create formatter for IST
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return istFormatter.format(utcDate);
}

/**
 * Convert UTC timestamp to IST with readable format
 */
export function formatToISTReadable(utcTimestamp: string): string {
  const utcDate = new Date(utcTimestamp);
  
  // Create formatter for IST with readable format
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return istFormatter.format(utcDate);
}

/**
 * Get current IST time as formatted string
 */
export function getCurrentISTString(): string {
  const now = new Date();
  return formatToIST(now.toISOString());
}

/**
 * Convert UTC Date to IST Date for comparison purposes
 */
export function convertUTCtoIST(utcDate: Date): Date {
  // Get the time in IST
  const istTime = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  return istTime;
}