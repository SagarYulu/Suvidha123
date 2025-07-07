import authenticatedAxios from './authenticatedAxios';

export type IssueSubmitData = {
  employeeId: number;
  typeId: string;
  subTypeId: string;
  description: string;
  status?: string;
  priority?: string;
  attachmentUrl?: string | null;
  attachments?: string[] | null; // Add support for multiple attachments
};

export const submitIssue = async (data: IssueSubmitData) => {
  // Map from our Issue type property names to the database column names
  const issueData = {
    employeeId: data.employeeId,
    typeId: data.typeId,
    subTypeId: data.subTypeId,
    description: data.description,
    status: data.status || "open",
    priority: data.priority || "medium",
    attachmentUrl: data.attachmentUrl || null,
    attachments: data.attachments || null, // Store array of attachment URLs
  };

  if (!issueData.employeeId || !issueData.typeId || !issueData.subTypeId || !issueData.description) {
    console.error('Missing required fields for issue creation');
    return { success: false, error: 'Missing required fields' };
  }

  console.log("Submitting issue with data:", issueData);

  try {
    const response = await authenticatedAxios.post('/issues', issueData);
    
    if (response.data && response.data.id) {
      console.log('Issue created successfully:', response.data);
      return { success: true, issueId: response.data.id };
    } else {
      console.error('Unexpected response format:', response.data);
      return { success: false, error: 'Unexpected response format' };
    }
  } catch (error: any) {
    console.error('Error creating issue:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to create issue'
    };
  }
};

// Add missing export for bank proof upload
export const uploadBankProof = async (file: File, employeeId: number): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // This would typically upload to a file storage service
    // For now, we'll create a placeholder URL
    const fileUrl = `https://storage.yulu.com/bank-proofs/${employeeId}-${Date.now()}-${file.name}`;
    
    console.log('Bank proof upload simulated for employee:', employeeId);
    return { success: true, url: fileUrl };
  } catch (error) {
    console.error('Error uploading bank proof:', error);
    return { success: false, error: 'Failed to upload bank proof' };
  }
};