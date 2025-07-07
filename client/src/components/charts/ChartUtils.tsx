import { format } from 'date-fns';

// Common chart colors
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
export const SENTIMENT_COLORS = {
  'positive': '#4ADE80',  // Lighter green
  'neutral': '#FBBF24',   // Lighter yellow
  'negative': '#F87171',   // Lighter red
  'happy': '#4ADE80',     // Same as positive
  'sad': '#F87171'        // Same as negative
};

// Helper function to get sentiment color based on name with safe fallback
export const getSentimentColor = (name: string | undefined): string => {
  if (!name) return CHART_COLORS[0]; // Default color if name is undefined
  
  const lowerName = name.toLowerCase();
  if (lowerName.includes('positive') || lowerName.includes('happy')) return SENTIMENT_COLORS.positive;
  if (lowerName.includes('negative') || lowerName.includes('sad')) return SENTIMENT_COLORS.negative;
  if (lowerName.includes('neutral')) return SENTIMENT_COLORS.neutral;
  return CHART_COLORS[0]; // Default color
};

// Formatter for the line chart tooltips with defensive checks
export const moodTooltipFormatter = (value: number | null, name: string) => {
  if (value === null || value === undefined) return ["N/A", name || "Unknown"];
  
  const moodLabels: Record<number, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Neutral',
    4: 'Good',
    5: 'Excellent'
  };
  
  const closestMood = Object.keys(moodLabels)
    .map(Number)
    .reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    }, 3);
    
  return [`${value} (${moodLabels[closestMood]})`, name || "Mood Rating"];
};

/**
 * Safe formatter for LabelList to ensure it returns string | number
 * This function correctly handles different input types including arrays
 * @param value Any value that needs to be formatted
 * @returns Formatted value as string or number
 */
export const labelFormatter = (value: any): string | number => {
  // Check if the value is undefined or null and return a default value
  if (value === undefined || value === null) {
    return '0';
  }
  
  // If the value is an array, convert the first item to a string
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : '0';
  }
  
  // For numbers and strings, return directly
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  
  // For other types, convert to string
  return String(value);
};

/**
 * Helper function to safely check if data exists and has length
 * Enhanced to handle more edge cases
 */
export const hasData = (data: any[] | null | undefined): boolean => {
  if (!data) return false;
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  
  // Check if we have at least one item with valid value
  return data.some(item => {
    if (!item) return false;
    
    // For sentiment data that typically has name/value properties
    if (typeof item === 'object') {
      // If it's a typical chart data point with a value property
      if ('value' in item && (item.value !== undefined && item.value !== null)) {
        return true;
      }
      
      // If it has any other numerical property that could be used for charts
      if ('count' in item && typeof item.count === 'number') return true;
      if ('rating' in item && typeof item.rating === 'number') return true;
    }
    
    // For simple arrays of numbers
    if (typeof item === 'number') return true;
    
    return false;
  });
};

// Helper to safely get a color from CHART_COLORS by index
export const getChartColorByIndex = (index: number): string => {
  if (index === undefined || index === null) return CHART_COLORS[0];
  return CHART_COLORS[index % CHART_COLORS.length];
};

/**
 * Creates placeholder chart data to avoid rendering errors
 * @returns Safe placeholder data
 */
export const getPlaceholderChartData = () => {
  return [
    { name: 'No Data', value: 1 }
  ];
};

// Add a curved line setting for sentiment distribution chart
export const CURVED_LINE_TYPE = "monotone"; // Options: 'basis', 'linear', 'natural', 'monotone', 'step'
