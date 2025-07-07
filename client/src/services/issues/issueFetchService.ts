import { Issue } from "@/types";
import { mapDbIssueToAppIssue } from "./issueUtils";
import { processIssues } from "./issueProcessingService";
import authenticatedAxios from '@/services/authenticatedAxios';

/**
 * Fetches an issue by its ID
 */
export const getIssueById = async (id: string | number): Promise<Issue | undefined> => {
  try {
    // Validate the ID
    if (!id || typeof id === 'object') {
      console.error('Invalid issue ID provided:', id);
      return undefined;
    }
    
    // Simple fetch call instead of complex authenticated axios
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/issues/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Issue not found');
      return undefined;
    }
    
    const dbIssue = await response.json();
    
    // Get comments for this issue
    let comments = [];
    try {
      const commentsResponse = await fetch(`/api/issues/${id}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (commentsResponse.ok) {
        comments = await commentsResponse.json() || [];
      }
    } catch (commentsError) {
      console.error('Error fetching comments:', commentsError);
      comments = [];
    }
    
    // Convert to app format and attach comments
    const issue = mapDbIssueToAppIssue(dbIssue, comments);
    
    return issue;
  } catch (error) {
    console.error('Error in getIssueById:', error);
    return undefined;
  }
};

/**
 * Fetches all issues with optional filters
 */
export const getAllIssues = async (filters?: any): Promise<Issue[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/api/issues?${queryString}` : '/api/issues';
    
    // Simple fetch call instead of complex authenticated axios
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const dbIssues = await response.json() || [];
    
    // Convert and process issues
    const issues = dbIssues.map(mapDbIssueToAppIssue);
    return await processIssues(issues);
  } catch (error) {
    console.error('Error in getAllIssues:', error);
    return [];
  }
};

/**
 * Fetches issues assigned to a specific user
 */
export const getAssignedIssues = async (userId: string | number): Promise<Issue[]> => {
  try {
    // Simple fetch call instead of complex authenticated axios
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/issues?assignedTo=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const dbIssues = await response.json() || [];
    
    // Ensure dbIssues is an array
    if (!Array.isArray(dbIssues)) {
      console.error('Expected array but got:', typeof dbIssues, dbIssues);
      return [];
    }
    
    // Convert and process issues
    const issues = dbIssues.map((dbIssue: any) => mapDbIssueToAppIssue(dbIssue, []));
    return await processIssues(issues);
  } catch (error) {
    console.error('Error in getAssignedIssues:', error);
    return [];
  }
};

/**
 * Fetches issues created by a specific user
 */
export const getIssuesByUserId = async (userId: string | number): Promise<Issue[]> => {
  try {
    // Check if the current user is an employee
    const authData = localStorage.getItem('auth');
    const isEmployee = authData ? JSON.parse(authData).userType === 'employee' : false;
    
    // Use the appropriate endpoint based on user type
    const endpoint = isEmployee ? '/issues/my/issues' : `/issues?employeeId=${userId}`;
    const response = await authenticatedAxios.get(endpoint);
    const dbIssues = response.data;
    
    // Ensure dbIssues is an array
    if (!Array.isArray(dbIssues)) {
      console.error('Expected array but got:', typeof dbIssues, dbIssues);
      return [];
    }
    
    // Convert and process issues
    const issues = dbIssues.map(mapDbIssueToAppIssue);
    return await processIssues(issues);
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};