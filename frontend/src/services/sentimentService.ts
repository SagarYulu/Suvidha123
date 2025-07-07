

export type SentimentRating = {
  id?: string;
  employee_id: string;
  rating: number;
  feedback?: string;
  city?: string;
  cluster?: string;
  role?: string;
  tags?: string[];
  sentiment_score?: number;
  sentiment_label?: string;
  created_at?: string;
};

export type SentimentTag = {
  id: string;
  name: string;
  category?: string;
};

export type SentimentAlert = {
  id: string;
  city?: string;
  cluster?: string;
  role?: string;
  average_score: number;
  previous_average_score?: number;
  change_percentage?: number;
  trigger_reason: string;
  is_resolved: boolean;
  created_at: string;
};

export type SentimentAnalysisResult = {
  sentiment_score: number | null;
  sentiment_label: string | null;
  rating?: number;
  suggested_tags: string[];
  flag_urgent?: boolean;
  flag_abusive?: boolean;
};

// Function to analyze sentiment using Supabase Edge Function
export const analyzeSentiment = async (feedback: string): Promise<SentimentAnalysisResult> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Mock sentiment analysis for feedback:", feedback);
  return {
    sentiment_score: null,
    sentiment_label: null,
    suggested_tags: []
  };
};

// Function to submit sentiment with better error handling and metadata processing
export const submitSentiment = async (sentimentData: SentimentRating): Promise<{ success: boolean, error?: string }> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Mock submission of sentiment data:", sentimentData);
  return { success: true };
};

// Mock function to check and create alert if sentiment trends warrant it
async function checkAndCreateAlert(newSentiment: SentimentRating) {
  // Mock implementation since sentiment functionality is removed
  console.log("Mock check for sentiment alerts:", newSentiment);
}

// Function to fetch sentiment tags with improved logging and error handling
export const fetchSentimentTags = async (): Promise<SentimentTag[]> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Returning mock sentiment tags");
  return [
    { id: 'mock-1', name: 'Work-Life Balance', category: 'Wellness' },
    { id: 'mock-2', name: 'Career Growth', category: 'Development' },
    { id: 'mock-3', name: 'Salary', category: 'Benefits' }
  ];
};

// Function to fetch user sentiment history
export const fetchUserSentimentHistory = async (employeeId: string): Promise<SentimentRating[]> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Fetching mock sentiment history for employee:", employeeId);
  return [];
};

// Admin functions for dashboard
export const fetchAllSentiment = async (filters: {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
}): Promise<SentimentRating[]> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Fetching mock sentiment data with filters:", filters);
  return [];
};

// Function to fetch sentiment alerts
export const fetchSentimentAlerts = async (resolved: boolean = false): Promise<SentimentAlert[]> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Fetching mock sentiment alerts, resolved status:", resolved);
  return [];
};

// Function to resolve an alert
export const resolveSentimentAlert = async (alertId: string): Promise<boolean> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Mock resolving sentiment alert:", alertId);
  return true;
};

// Function to generate test sentiment data for demo purposes
export const generateTestSentimentData = async (): Promise<{
  employeesProcessed: number;
  totalEntriesCreated: number;
  success: boolean;
}> => {
  // Mock implementation since sentiment functionality is removed
  console.log("Mock generating test sentiment data");
  return { 
    employeesProcessed: 0, 
    totalEntriesCreated: 0, 
    success: true 
  };
};
