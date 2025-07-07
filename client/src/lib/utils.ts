
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a status string by replacing underscores with spaces and capitalizing first letter
 * @param status Status string (e.g., "in_progress")
 * @returns Formatted status string (e.g., "In progress")
 */
export function formatStatus(status: string): string {
  if (!status) return "";
  
  // Replace underscores with spaces
  const withSpaces = status.replace(/_/g, ' ');
  
  // Capitalize first letter
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Capitalizes the first letter of a string
 * @param str Input string
 * @returns String with first letter capitalized
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
