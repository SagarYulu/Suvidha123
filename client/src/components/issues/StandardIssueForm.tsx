import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { submitIssue, uploadBankProof } from "@/services/issueSubmitService";
import { Paperclip, Upload } from "lucide-react";

type StandardIssueFormProps = {
  employeeId: number;
  selectedType: string;
  selectedSubType: string;
  onSuccess: () => void;
  skipTypeValidation?: boolean;
  showHindi?: boolean; // Add showHindi prop
};

const StandardIssueForm = ({
  employeeId,
  selectedType,
  selectedSubType,
  onSuccess,
  skipTypeValidation = false,
  showHindi = false, // Default to false
}: StandardIssueFormProps) => {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ESI-specific states for Aadhaar uploads
  const [aadharFrontFile, setAadharFrontFile] = useState<File | null>(null);
  const [aadharBackFile, setAadharBackFile] = useState<File | null>(null);
  const [isUploadingAadharFront, setIsUploadingAadharFront] = useState(false);
  const [isUploadingAadharBack, setIsUploadingAadharBack] = useState(false);
  const aadharFrontInputRef = useRef<HTMLInputElement>(null);
  const aadharBackInputRef = useRef<HTMLInputElement>(null);
  
  const isESITicket = selectedType === "esi";
  const isOthersTicket = selectedType === "others";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAadharFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setAadharFrontFile(file);
    }
  };

  const handleAadharBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setAadharBackFile(file);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to submit a ticket.",
        variant: "destructive",
      });
      return;
    }

    if (!skipTypeValidation && (!selectedType || !selectedSubType)) {
      toast({
        title: "Validation error",
        description: "Please select a ticket type and subtype.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide a description of the ticket.",
        variant: "destructive",
      });
      return;
    }

    // Special validation for ESI tickets
    if (isESITicket && !skipTypeValidation) {
      if (!aadharFrontFile || !aadharBackFile) {
        toast({
          title: "Validation error",
          description: "Both Aadhaar card front and back images are required for ESI tickets",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    let fileUrl = null;
    let aadharFrontUrl = null;
    let aadharBackUrl = null;
    let allAttachments: string[] = [];

    try {
      // Upload regular attachment if selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadBankProof(selectedFile, employeeId);
        setIsUploading(false);
        
        if (!uploadResult.success || !uploadResult.url) {
          toast({
            title: "File upload failed",
            description: "Failed to upload your attachment. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        if (uploadResult.url) {
          allAttachments.push(uploadResult.url);
        }
      }

      // Upload Aadhaar attachments for ESI tickets
      if (isESITicket && !skipTypeValidation) {
        if (aadharFrontFile) {
          setIsUploadingAadharFront(true);
          const aadharFrontResult = await uploadBankProof(aadharFrontFile, employeeId);
          setIsUploadingAadharFront(false);
          
          if (!aadharFrontResult.success || !aadharFrontResult.url) {
            toast({
              title: "File upload failed",
              description: "Failed to upload Aadhaar card front. Please try again.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          
          aadharFrontUrl = aadharFrontResult.url;
          allAttachments.push(aadharFrontResult.url);
        }
        
        if (aadharBackFile) {
          setIsUploadingAadharBack(true);
          const aadharBackResult = await uploadBankProof(aadharBackFile, employeeId);
          setIsUploadingAadharBack(false);
          
          if (!aadharBackResult.success || !aadharBackResult.url) {
            toast({
              title: "File upload failed",
              description: "Failed to upload Aadhaar card back. Please try again.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          
          aadharBackUrl = aadharBackResult.url;
          allAttachments.push(aadharBackResult.url);
        }
      }

      // Create attachment URLs string for description
      let attachmentDetails = "";
      
      if (fileUrl) {
        attachmentDetails += `\nAttachment: ${fileUrl}`;
      }
      
      if (aadharFrontUrl) {
        attachmentDetails += `\nAadhaar Front: ${aadharFrontUrl}`;
      }
      
      if (aadharBackUrl) {
        attachmentDetails += `\nAadhaar Back: ${aadharBackUrl}`;
      }

      // Submit the issue with optional attachment URL and attachments array
      const result = await submitIssue({
        employeeId,
        typeId: selectedType,
        subTypeId: selectedSubType,
        description: `${description.trim()}${attachmentDetails}`,
        status: "open",
        priority: "medium",
        attachmentUrl: fileUrl || aadharFrontUrl, // Save the first available attachment URL
        attachments: allAttachments.length > 0 ? allAttachments : null,
      });

      if (result.success) {
        toast({
          title: "Ticket submitted",
          description: "Your ticket has been successfully submitted.",
        });
        
        onSuccess();
      } else {
        console.error("Error submitting ticket:", result.error);
        toast({
          title: "Submission error",
          description: result.error || "An error occurred while submitting your ticket. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Submission error",
        description: "An error occurred while submitting your ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setIsUploadingAadharFront(false);
      setIsUploadingAadharBack(false);
    }
  };

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const triggerAadharFrontInput = useCallback(() => {
    if (aadharFrontInputRef.current) {
      aadharFrontInputRef.current.click();
    }
  }, []);

  const triggerAadharBackInput = useCallback(() => {
    if (aadharBackInputRef.current) {
      aadharBackInputRef.current.click();
    }
  }, []);

  return (
    <form onSubmit={handleStandardSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">
          {showHindi ? "Description / विवरण" : "Description"}
        </Label>
        <Textarea
          id="description"
          placeholder={showHindi 
            ? "Please describe your issue in detail... / अपनी समस्या का विस्तार से वर्णन करें..." 
            : "Please describe your issue in detail..."}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
        />
      </div>

      {isESITicket && !skipTypeValidation ? (
        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">
              {showHindi 
                ? "For ESI-related requests, both front and back sides of your Aadhaar card are required / ईएसआई संबंधित अनुरोधों के लिए, आपके आधार कार्ड के सामने और पीछे दोनों तरफ की तस्वीरें जरूरी हैं" 
                : "For ESI-related requests, both front and back sides of your Aadhaar card are required"}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="aadharFront">
              {showHindi 
                ? "Aadhaar Card Front (Required) / आधार कार्ड का सामने का हिस्सा (जरूरी)" 
                : "Aadhaar Card Front (Required)"}
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={aadharFrontInputRef}
                onChange={handleAadharFrontChange}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerAadharFrontInput}
                className="flex items-center"
                disabled={isUploadingAadharFront}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploadingAadharFront 
                  ? (showHindi ? "Uploading... / अपलोड हो रहा है..." : "Uploading...") 
                  : aadharFrontFile 
                    ? aadharFrontFile.name 
                    : (showHindi ? "Upload Aadhaar Front / आधार कार्ड का सामने वाला हिस्सा अपलोड करें" : "Upload Aadhaar Front")}
              </Button>
              {aadharFrontFile && !isUploadingAadharFront && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm text-red-500 h-8 px-2"
                  onClick={() => setAadharFrontFile(null)}
                >
                  {showHindi ? "Remove / हटायें" : "Remove"}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadharBack">
              {showHindi 
                ? "Aadhaar Card Back (Required) / आधार कार्ड का पीछे का हिस्सा (जरूरी)" 
                : "Aadhaar Card Back (Required)"}
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={aadharBackInputRef}
                onChange={handleAadharBackChange}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerAadharBackInput}
                className="flex items-center"
                disabled={isUploadingAadharBack}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploadingAadharBack 
                  ? (showHindi ? "Uploading... / अपलोड हो रहा है..." : "Uploading...") 
                  : aadharBackFile 
                    ? aadharBackFile.name 
                    : (showHindi ? "Upload Aadhaar Back / आधार कार्ड का पीछे वाला हिस्सा अपलोड करें" : "Upload Aadhaar Back")}
              </Button>
              {aadharBackFile && !isUploadingAadharBack && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm text-red-500 h-8 px-2"
                  onClick={() => setAadharBackFile(null)}
                >
                  {showHindi ? "Remove / हटायें" : "Remove"}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalDoc">
              {showHindi 
                ? "Additional Document (Optional) / अतिरिक्त दस्तावेज (वैकल्पिक)" 
                : "Additional Document (Optional)"}
            </Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*, application/pdf, .doc, .docx"
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                className="flex items-center"
                disabled={isUploading}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                {isUploading 
                  ? (showHindi ? "Uploading... / अपलोड हो रहा है..." : "Uploading...") 
                  : selectedFile 
                    ? selectedFile.name 
                    : (showHindi ? "Add Additional Document / अतिरिक्त दस्तावेज जोड़ें" : "Add Additional Document")}
              </Button>
              {selectedFile && !isUploading && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm text-red-500 h-8 px-2"
                  onClick={() => setSelectedFile(null)}
                >
                  {showHindi ? "Remove / हटायें" : "Remove"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>
            {showHindi ? "Attachment (Optional) / अटैचमेंट (वैकल्पिक)" : "Attachment (Optional)"}
          </Label>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*, application/pdf, .doc, .docx"
            />
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              className="flex items-center"
              disabled={isUploading}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              {isUploading 
                ? (showHindi ? "Uploading... / अपलोड हो रहा है..." : "Uploading...") 
                : selectedFile 
                  ? selectedFile.name 
                  : (showHindi ? "Add Attachment / अटैचमेंट जोड़ें" : "Add Attachment")}
            </Button>
            {selectedFile && !isUploading && (
              <Button 
                type="button" 
                variant="ghost" 
                className="text-sm text-red-500 h-8 px-2"
                onClick={() => setSelectedFile(null)}
              >
                {showHindi ? "Remove / हटायें" : "Remove"}
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {showHindi 
              ? "Max file size: 5MB. Accepted formats: images, PDF, Word documents / अधिकतम फाइल साइज: 5MB. स्वीकृत फॉर्मेट: इमेज, PDF, वर्ड डॉक्यूमेंट" 
              : "Max file size: 5MB. Accepted formats: images, PDF, Word documents"}
          </p>
        </div>
      )}

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-yulu-blue hover:bg-blue-700"
          disabled={isSubmitting || isUploading || isUploadingAadharFront || isUploadingAadharBack}
        >
          {isSubmitting 
            ? (showHindi ? "Submitting... / जमा हो रहा है..." : "Submitting...") 
            : (showHindi ? "Submit Ticket / टिकट जमा करें" : "Submit Ticket")}
        </Button>
      </div>
    </form>
  );
};

export default StandardIssueForm;
