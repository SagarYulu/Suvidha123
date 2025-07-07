import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitTicketFeedback, TicketFeedback } from "@/services/ticketFeedbackService";
import { Smile, Meh, Frown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FeedbackOption {
  value: string;
  label: string;
  labelHindi: string;
}

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  employeeUuid: string;
  onFeedbackSubmitted?: (issueId: string) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  issueId,
  employeeUuid,
  onFeedbackSubmitted,
}) => {
  const [step, setStep] = useState<"sentiment" | "options" | "submitted">("sentiment");
  const [sentiment, setSentiment] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Define feedback options based on sentiment
  const feedbackOptions: Record<string, FeedbackOption[]> = {
    happy: [
      {
        value: "understood_issue",
        label: "Suvidha agent understood my issue",
        labelHindi: "Suvidha agent mera problem ko samjha",
      },
      {
        value: "resolved_query",
        label: "My query resolved",
        labelHindi: "Meri query resolve ho gayi",
      },
      {
        value: "fast_resolution",
        label: "Speed of the resolution",
        labelHindi: "Problem ko jaldi solve kiya",
      },
    ],
    neutral: [
      {
        value: "took_longer",
        label: "Resolution took longer than expected",
        labelHindi: "Samasya hal hone mein zyada samay laga",
      },
      {
        value: "multiple_followups",
        label: "Had to follow up multiple times",
        labelHindi: "Bar-bar follow-up karna pada",
      },
      {
        value: "polite_not_helpful",
        label: "Agent was polite but not very helpful",
        labelHindi: "Agent vinamr the par pura support nahi mila",
      },
    ],
    sad: [
      {
        value: "didnt_understand",
        label: "Suvidha agent didn't understand my issue",
        labelHindi: "Suvidha agent mera issue samjha nahi",
      },
      {
        value: "query_not_solved",
        label: "My query didn't get solved",
        labelHindi: "Mera query resolve nahi hua",
      },
      {
        value: "delayed_resolution",
        label: "Resolution was delayed",
        labelHindi: "Issue clear karne mein bahut time laga",
      },
    ],
  };

  const getHeaderText = () => {
    switch (sentiment) {
      case "happy":
        return "What went well? / क्या अच्छा रहा?";
      case "neutral":
        return "What could have been better? / क्या बेहतर हो सकता था?";
      case "sad":
        return "What went wrong? / क्या गलत हुआ?";
      default:
        return "Share your feedback / अपनी प्रतिक्रिया साझा करें";
    }
  };

  const handleSentimentSelect = (value: "happy" | "neutral" | "sad") => {
    setSentiment(value);
    setStep("options");
    setSubmitError(null); // Clear any previous errors
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    setSubmitError(null); // Clear any previous errors
  };

  const handleSubmit = async () => {
    if (!sentiment || !selectedOption) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Find the selected option to get full text
    const selectedFeedbackOption = feedbackOptions[sentiment].find(opt => opt.value === selectedOption);
    
    if (!selectedFeedbackOption) {
      setSubmitError("Invalid feedback option selected");
      setIsSubmitting(false);
      return;
    }
    
    // Explicitly log what we're sending to the backend for debugging
    console.log("Selected feedback option:", selectedFeedbackOption);
    console.log("Full feedback text being sent:", selectedFeedbackOption.label);
    
    const feedback: TicketFeedback = {
      issue_id: issueId,
      employee_id: Number(employeeUuid),
      sentiment,
      feedback_option: selectedOption, // The internal identifier code
      feedback_text: selectedFeedbackOption.label, // The full English text to be stored
    };

    try {
      const success = await submitTicketFeedback(feedback);
      
      if (success) {
        setStep("submitted");
        
        // Call the onFeedbackSubmitted callback if provided
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(issueId);
        }
      } else {
        setSubmitError("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    if (step === "submitted") {
      setSentiment(null);
      setSelectedOption("");
      setStep("sentiment");
      setSubmitError(null);
    }
    onClose();
  };

  const sentimentButtonClass = "flex flex-col items-center gap-2 p-2 rounded-full transition-all duration-300";
  const sentimentIconClass = "w-16 h-16 rounded-full flex items-center justify-center";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {sentiment === "happy" ? "What went well? / क्या अच्छा रहा?" : 
             sentiment === "neutral" ? "What could have been better? / क्या बेहतर हो सकता था?" : 
             sentiment === "sad" ? "What went wrong? / क्या गलत हुआ?" :
             "Share your feedback / अपनी प्रतिक्रिया साझा करें"}
          </DialogTitle>
          {step === "sentiment" && (
            <DialogDescription className="text-center">
              Please select how you feel about the service
            </DialogDescription>
          )}
        </DialogHeader>

        {step === "sentiment" && (
          <div className="flex justify-center gap-6 py-6">
            <button
              onClick={() => handleSentimentSelect("happy")}
              className={`${sentimentButtonClass} hover:bg-green-50 hover:scale-105`}
            >
              <div className={`${sentimentIconClass} bg-green-100`}>
                <Smile className="h-10 w-10 text-green-500" />
              </div>
              <span>Happy / खुश</span>
            </button>
            
            <button
              onClick={() => handleSentimentSelect("neutral")}
              className={`${sentimentButtonClass} hover:bg-yellow-50 hover:scale-105`}
            >
              <div className={`${sentimentIconClass} bg-yellow-100`}>
                <Meh className="h-10 w-10 text-yellow-500" />
              </div>
              <span>Neutral / तटस्थ</span>
            </button>
            
            <button
              onClick={() => handleSentimentSelect("sad")}
              className={`${sentimentButtonClass} hover:bg-red-50 hover:scale-105`}
            >
              <div className={`${sentimentIconClass} bg-red-100`}>
                <Frown className="h-10 w-10 text-red-500" />
              </div>
              <span>Sad / दुखी</span>
            </button>
          </div>
        )}

        {step === "options" && sentiment && (
          <div className="py-4">
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionSelect}
              className="space-y-4"
            >
              {feedbackOptions[sentiment].map((option) => (
                <div key={option.value} className="flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                    <br />
                    <span className="text-gray-500">{option.labelHindi}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {submitError}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-medium"
              >
                {isSubmitting ? "Submitting..." : "Submit / प्रस्तुत करें"}
              </Button>
            </div>
          </div>
        )}

        {step === "submitted" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full h-16 w-16 flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-lg font-medium">
              Feedback Submitted / प्रतिक्रिया दी गई
            </h3>
            <p className="text-gray-500 mt-2">
              Thank you for your valuable feedback!
            </p>
            <Button 
              onClick={handleClose} 
              className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-medium"
            >
              Close / बंद करें
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
