import { toast } from "@/hooks/use-toast";
import authenticatedAxios from './authenticatedAxios';

export type TicketFeedback = {
  id?: string;
  issue_id: string;
  employee_id: number;
  sentiment: 'happy' | 'neutral' | 'sad';
  feedback_option: string;
  feedback_text?: string; // This is used internally but not stored directly
  created_at?: string;
  city?: string;       // Added city
  cluster?: string;    // Added cluster
  agent_id?: string;   // Added agent (who closed the ticket)
  agent_name?: string; // Added agent name
};

// Define a more specific type for the employee data we expect
interface EmployeeData {
  city?: string | null;
  cluster?: string | null;
}

// Check if feedback already exists for a ticket
export const checkFeedbackExists = async (issueId: string, employeeId: string): Promise<boolean> => {
  try {
    console.log(`Checking feedback for issue: ${issueId}, employee: ${employeeId}`);
    const response = await authenticatedAxios.get(`/api/ticket-feedback?issueId=${issueId}&employeeId=${employeeId}`);
    
    return response.data.exists || false;
  } catch (error) {
    console.error("Error checking if feedback exists:", error);
    return false;
  }
};

// Get feedback status for a ticket
export const getFeedbackStatus = async (issueId: string): Promise<boolean> => {
  try {
    const response = await authenticatedAxios.get(`/api/ticket-feedback?issueId=${issueId}`);
    
    return response.data.exists || false;
  } catch (error) {
    console.error("Error checking feedback status:", error);
    return false;
  }
};

// Get feedback statuses for multiple tickets
export const getMultipleFeedbackStatuses = async (issueIds: string[]): Promise<Record<string, boolean>> => {
  try {
    if (!issueIds.length) return {};
    
    const response = await authenticatedAxios.post('/api/ticket-feedback/bulk', { issueIds });
    
    const data = response.data;
    
    // Create a map of issue_id -> has feedback
    const feedbackMap: Record<string, boolean> = {};
    
    // Initialize all tickets as not having feedback
    issueIds.forEach(id => {
      feedbackMap[id] = false;
    });
    
    // Update the ones that do have feedback
    if (data.feedbacks) {
      data.feedbacks.forEach((feedback: any) => {
        feedbackMap[feedback.issueId] = true;
      });
    }
    
    return feedbackMap;
  } catch (error) {
    console.error("Error checking multiple feedback statuses:", error);
    return {};
  }
};

// Submit feedback for a ticket
export const submitTicketFeedback = async (feedback: TicketFeedback): Promise<boolean> => {
  try {
    console.log("Submitting feedback:", feedback);
    
    // Check if feedback already exists
    const feedbackExists = await checkFeedbackExists(feedback.issue_id, String(feedback.employee_id));
    
    if (feedbackExists) {
      console.log("Feedback already exists for this ticket");
      toast({
        title: "Feedback Already Submitted",
        description: "You have already provided feedback for this ticket.",
      });
      return true; // Return true since the feedback is already handled
    }
    
    // Get the issue details to capture city, cluster, and agent information
    let issueData: any = null;
    try {
      const issueResponse = await authenticatedAxios.get(`/api/issues/${feedback.issue_id}`);
      issueData = issueResponse.data;
    } catch (error) {
      console.error("Error fetching issue data:", error);
    }
    
    // Extract city, cluster, agent ID and agent name information
    let city = feedback.city || undefined;
    let cluster = feedback.cluster || undefined;
    let agentId = feedback.agent_id || undefined;
    let agentName = feedback.agent_name || undefined;
    
    // Use data from the issue if available
    if (issueData) {
      // Get employee data to extract city and cluster
      try {
        const employeeResponse = await authenticatedAxios.get(`/api/employees/${issueData.employeeId}`);
        const employeeData = employeeResponse.data;
        city = city || employeeData.city;
        cluster = cluster || employeeData.cluster;
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
      
      // Get agent information
      agentId = issueData.assignedTo || agentId;
      
      // If we have an agent ID but no name, try to get the name from dashboard_users
      if (agentId && !agentName) {
        try {
          const agentResponse = await authenticatedAxios.get(`/api/dashboard-users/${agentId}`);
          const agentData = agentResponse.data;
          agentName = agentData.name;
        } catch (error) {
          console.error("Error fetching agent data:", error);
        }
      }
    }
    
    // Prepare feedback data with additional information
    const feedbackData = {
      issueId: feedback.issue_id,
      employeeId: feedback.employee_id,
      sentiment: feedback.sentiment,
      feedbackOption: feedback.feedback_text || feedback.feedback_option,
      city,
      cluster,
      agentId,
      agentName
    };
    
    console.log("Submitting enriched feedback data:", feedbackData);
    
    const response = await authenticatedAxios.post('/api/ticket-feedback', feedbackData);
    
    const data = response.data;
    console.log("Feedback submitted successfully:", data);
    toast({
      title: "Success",
      description: "Feedback submitted successfully. Thank you!",
    });
    return true;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    toast({
      title: "Error",
      description: "Failed to submit feedback. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};