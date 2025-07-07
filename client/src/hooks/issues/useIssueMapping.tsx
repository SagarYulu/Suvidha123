
import { useState } from "react";
import { Issue } from "@/types";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { mapIssueType } from "@/services/issues/issueMapperService";
import { toast } from "@/hooks/use-toast";

export const useIssueMapping = (issue: Issue | null, currentUserId: string, onSuccess: (updatedIssue: Issue) => void) => {
  const [selectedMappedType, setSelectedMappedType] = useState("");
  const [selectedMappedSubType, setSelectedMappedSubType] = useState("");
  const [isMappingIssue, setIsMappingIssue] = useState(false);

  // Filter out "others" from the available mapping options
  const availableMappingTypes = ISSUE_TYPES.filter(type => type.id !== "others");
  
  // Get subtypes for the selected type
  const availableSubTypes = selectedMappedType 
    ? ISSUE_TYPES.find(type => type.id === selectedMappedType)?.subTypes || [] 
    : [];

  // Reset subtype when type changes
  const handleMappedTypeChange = (typeId: string) => {
    setSelectedMappedType(typeId);
    setSelectedMappedSubType("");
  };

  // Handle the mapping submission
  const handleMapIssue = async () => {
    if (!issue || !selectedMappedType || !selectedMappedSubType) {
      toast({
        title: "Validation Error",
        description: "Please select both a ticket type and subtype",
        variant: "destructive"
      });
      return;
    }

    setIsMappingIssue(true);

    try {
      const updatedIssue = await mapIssueType(
        issue.id,
        selectedMappedType,
        selectedMappedSubType,
        currentUserId
      );

      if (updatedIssue) {
        toast({
          title: "Ticket Mapped Successfully",
          description: "The ticket has been mapped to a new category"
        });
        
        // Update the local issue state with the mapped values
        if (onSuccess && updatedIssue) {
          onSuccess({
            ...issue,
            typeId: selectedMappedType,
            subTypeId: selectedMappedSubType
          });
        }
        
        // Reset form
        setSelectedMappedType("");
        setSelectedMappedSubType("");
      } else {
        toast({
          title: "Mapping Failed",
          description: "Failed to map the ticket. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error mapping ticket:", error);
      toast({
        title: "Mapping Error",
        description: "An error occurred while mapping the ticket",
        variant: "destructive"
      });
    } finally {
      setIsMappingIssue(false);
    }
  };

  return {
    selectedMappedType,
    setSelectedMappedType: handleMappedTypeChange,
    selectedMappedSubType,
    setSelectedMappedSubType,
    isMappingIssue,
    availableMappingTypes,
    availableSubTypes,
    handleMapIssue,
  };
};
