
import React from "react";
import { Label } from "@/components/ui/label";
import { ISSUE_TYPES } from "@/config/issueTypes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IssueTypeSelectorProps = {
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedSubType: string;
  setSelectedSubType: (value: string) => void;
  resetForm?: () => void;
  showHindi?: boolean; // Add parameter to control Hindi display
};

const IssueTypeSelector = ({
  selectedType,
  setSelectedType,
  selectedSubType,
  setSelectedSubType,
  resetForm,
  showHindi = false, // Default to false (admin behavior)
}: IssueTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="issue-type">
          {showHindi ? "Ticket Type / टिकट का प्रकार" : "Ticket Type"}
        </Label>
        <Select
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value);
            setSelectedSubType("");
            if (resetForm) resetForm();
          }}
        >
          <SelectTrigger id="issue-type">
            <SelectValue placeholder={showHindi 
              ? "Select ticket type / टिकट का प्रकार चुनें" 
              : "Select ticket type"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ISSUE_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {showHindi && type.labelHindi 
                    ? `${type.label} / ${type.labelHindi}` 
                    : type.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <div className="space-y-2">
          <Label htmlFor="issue-subtype">
            {showHindi ? "Ticket Subtype / टिकट का उप-प्रकार" : "Ticket Subtype"}
          </Label>
          <Select
            value={selectedSubType}
            onValueChange={setSelectedSubType}
          >
            <SelectTrigger id="issue-subtype">
              <SelectValue placeholder={showHindi 
                ? "Select ticket subtype / टिकट का उप-प्रकार चुनें" 
                : "Select ticket subtype"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ISSUE_TYPES.find((type) => type.id === selectedType)
                  ?.subTypes.map((subType) => (
                    <SelectItem key={subType.id} value={subType.id}>
                      {showHindi && subType.labelHindi 
                        ? `${subType.label} / ${subType.labelHindi}` 
                        : subType.label}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default IssueTypeSelector;
