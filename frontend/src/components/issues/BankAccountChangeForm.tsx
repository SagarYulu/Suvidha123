import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { submitIssue, uploadBankProof } from "@/services/issueSubmitService";
import { Paperclip } from "lucide-react";

type BankAccountChangeFormProps = {
  employeeId: number;
  selectedType: string;
  selectedSubType: string;
  onSuccess: () => void;
  showHindi?: boolean; // Add showHindi prop
};

const BankAccountChangeForm = ({
  employeeId,
  selectedType,
  selectedSubType,
  onSuccess,
  showHindi = false, // Default to false
}: BankAccountChangeFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      accountNumber: "",
      ifscCode: "",
      reason: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      toast({
        title: "Validation error",
        description: "Bank proof document is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload bank proof document
      const uploadResult = await uploadBankProof(selectedFile, employeeId);
      
      if (!uploadResult.success || !uploadResult.url) {
        toast({
          title: "Upload failed",
          description: "Failed to upload bank proof document",
          variant: "destructive",
        });
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }

      setIsUploading(false);

      // Format description with account details
      const description = `Request to change bank account details:
Account Number: ${data.accountNumber}
IFSC Code: ${data.ifscCode}
Reason: ${data.reason}`;

      // Submit the issue
      await submitIssue({
        employeeId,
        typeId: selectedType,
        subTypeId: selectedSubType,
        description,
        status: "open",
        priority: "medium",
        attachmentUrl: uploadResult.url,
      });

      toast({
        title: "Request submitted",
        description: "Your bank account change request has been submitted",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission error",
        description: "An error occurred while submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="accountNumber">
          {showHindi ? "New Account Number / नया खाता संख्या" : "New Account Number"}
        </Label>
        <Input
          id="accountNumber"
          type="text"
          placeholder={showHindi 
            ? "Enter your new account number / अपना नया अकाउंट नंबर लिखें" 
            : "Enter your new account number"}
          {...register("accountNumber", { required: "Account number is required" })}
        />
        {errors.accountNumber && (
          <p className="text-sm text-red-500">{errors.accountNumber.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ifscCode">
          {showHindi ? "New IFSC Code / नया IFSC कोड" : "New IFSC Code"}
        </Label>
        <Input
          id="ifscCode"
          type="text"
          placeholder={showHindi 
            ? "Enter your new IFSC code / अपना नया IFSC कोड लिखें" 
            : "Enter your new IFSC code"}
          {...register("ifscCode", { required: "IFSC code is required" })}
        />
        {errors.ifscCode && (
          <p className="text-sm text-red-500">{errors.ifscCode.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">
          {showHindi ? "Reason for Change / बदलाव का कारण" : "Reason for Change"}
        </Label>
        <Textarea
          id="reason"
          placeholder={showHindi 
            ? "Explain why you need to change your bank account / बताएं कि आपको अपना बैंक अकाउंट क्यों बदलना है" 
            : "Explain why you need to change your bank account"}
          {...register("reason", { required: "Reason is required" })}
          rows={3}
        />
        {errors.reason && (
          <p className="text-sm text-red-500">{errors.reason.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankProof">
          {showHindi 
            ? "Bank Proof Document (Required) / बैंक प्रूफ दस्तावेज (जरूरी)" 
            : "Bank Proof Document (Required)"}
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
                : (showHindi ? "Upload Bank Proof / बैंक प्रूफ अपलोड करें" : "Upload Bank Proof")}
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
        <p className="text-sm text-amber-600 font-medium">
          {showHindi 
            ? "Important: Only upload passbook, cheque, or bank statement clearly showing your name, account number, and IFSC code. / महत्वपूर्ण: केवल पासबुक, चेक, या बैंक स्टेटमेंट अपलोड करें जिसमें आपका नाम, खाता संख्या और IFSC कोड स्पष्ट रूप से दिख रहा हो।" 
            : "Important: Only upload passbook, cheque, or bank statement clearly showing your name, account number, and IFSC code."}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-yulu-blue hover:bg-blue-700"
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting 
          ? (showHindi ? "Submitting... / जमा हो रहा है..." : "Submitting...") 
          : (showHindi ? "Submit Request / अनुरोध जमा करें" : "Submit Request")}
      </Button>
    </form>
  );
};

export default BankAccountChangeForm;
