
import { useEffect } from "react";
import { Issue } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useIssueMapping } from "@/hooks/issues/useIssueMapping";
import { isIssueMappable } from "@/services/issues/issueMapperService";

interface IssueMappingSectionProps {
  issue: Issue | null;
  currentUserId: string;
  onIssueUpdated: (updatedIssue: Issue) => void;
}

const IssueMappingSection = ({ issue, currentUserId, onIssueUpdated }: IssueMappingSectionProps) => {
  // Only render for tickets with type "others"
  if (!issue || !isIssueMappable(issue)) {
    return null;
  }

  const {
    selectedMappedType,
    setSelectedMappedType,
    selectedMappedSubType,
    setSelectedMappedSubType,
    isMappingIssue,
    availableMappingTypes,
    availableSubTypes,
    handleMapIssue,
  } = useIssueMapping(issue, currentUserId, onIssueUpdated);

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-800 text-base">Map to Ticket Type</CardTitle>
        <CardDescription className="text-amber-700">
          This ticket is currently categorized as "Others". You can map it to a more specific category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="mapped-issue-type" className="text-sm font-medium text-amber-800">
            Select Ticket Type
          </label>
          <Select
            value={selectedMappedType}
            onValueChange={setSelectedMappedType}
          >
            <SelectTrigger id="mapped-issue-type" className="bg-white border-amber-300">
              <SelectValue placeholder="Select ticket type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableMappingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.labelHindi ? `${type.label} / ${type.labelHindi}` : type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {selectedMappedType && (
          <div className="space-y-2">
            <label htmlFor="mapped-issue-subtype" className="text-sm font-medium text-amber-800">
              Select Ticket Subtype
            </label>
            <Select
              value={selectedMappedSubType}
              onValueChange={setSelectedMappedSubType}
              disabled={availableSubTypes.length === 0}
            >
              <SelectTrigger id="mapped-issue-subtype" className="bg-white border-amber-300">
                <SelectValue placeholder={
                  availableSubTypes.length === 0 
                    ? "No subtypes available" 
                    : "Select ticket subtype"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableSubTypes.map((subType) => (
                    <SelectItem key={subType.id} value={subType.id}>
                      {subType.labelHindi ? `${subType.label} / ${subType.labelHindi}` : subType.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleMapIssue} 
          disabled={!selectedMappedType || !selectedMappedSubType || isMappingIssue}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isMappingIssue ? "Updating..." : "Confirm & Update"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IssueMappingSection;
