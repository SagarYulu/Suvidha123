
import { format } from "date-fns";
import { formatToISTReadable } from "./timezone";

/**
 * Format date to a standard format in IST timezone
 * @param dateString Input date string
 * @param formatString Optional custom format string (defaults to "MMM dd, yyyy, h:mm a")
 * @returns Formatted date string in IST
 */
export const formatDate = (
  dateString: string | undefined | null,
  formatString: string = "MMM dd, yyyy, h:mm a"
): string => {
  if (!dateString) return "N/A";
  
  try {
    // Use IST timezone formatting for consistency across the app
    return formatToISTReadable(dateString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Format date to a short date format (no time)
 * @param dateString Input date string
 * @returns Formatted date string (MMM dd, yyyy)
 */
export const formatShortDate = (dateString: string | undefined | null): string => {
  return formatDate(dateString, "MMM dd, yyyy");
};

/**
 * Format date to show only time in IST
 * @param dateString Input date string
 * @returns Formatted time string (h:mm a) in IST
 */
export const formatTime = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A";
  
  try {
    const utcDate = new Date(dateString);
    const istFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return istFormatter.format(utcDate);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Time";
  }
};

/**
 * Format date to a relative format (e.g. "2 days ago")
 * TODO: Implement this when needed using date-fns formatDistanceToNow
 */

/**
 * Get status badge color based on issue status
 * @param status Issue status
 * @returns Tailwind CSS class for the badge
 */
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get priority badge styling based on priority level and issue status
 * @param priority Issue priority
 * @param status Issue status
 * @returns Tailwind CSS class for the badge
 */
export const getPriorityBadgeClass = (priority: string, status: string): string => {
  // Don't emphasize priority for closed/resolved tickets
  if (status === "closed" || status === "resolved") {
    return "bg-gray-100 text-gray-800 opacity-50";
  }
  
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-800 animate-pulse";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
