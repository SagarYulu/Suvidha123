
import { ISSUE_TYPES } from "@/config/issueTypes";

export const getIssueTypeLabel = (typeId: string, showHindi: boolean = false): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  if (!issueType) return typeId;
  return showHindi && issueType.labelHindi ? `${issueType.label} / ${issueType.labelHindi}` : issueType.label;
};

export const getIssueSubTypeLabel = (typeId: string, subTypeId: string, showHindi: boolean = false): string => {
  const issueType = ISSUE_TYPES.find(type => type.id === typeId);
  const subType = issueType?.subTypes.find(subType => subType.id === subTypeId);
  if (!subType) return subTypeId;
  return showHindi && subType.labelHindi ? `${subType.label} / ${subType.labelHindi}` : subType.label;
};

/**
 * Gets the effective type ID for an issue, considering mapped values
 */
export const getEffectiveIssueType = (issue: any): string => {
  // If the issue has been mapped, use the mapped type
  if (issue.mappedTypeId) {
    return issue.mappedTypeId;
  }
  // For database objects that might use snake_case
  if (issue.mapped_type_id) {
    return issue.mapped_type_id;
  }
  return issue.typeId || issue.type_id;
};

/**
 * Gets the effective subtype ID for an issue, considering mapped values
 */
export const getEffectiveIssueSubType = (issue: any): string => {
  // If the issue has been mapped, use the mapped subtype
  if (issue.mappedSubTypeId) {
    return issue.mappedSubTypeId;
  }
  // For database objects that might use snake_case
  if (issue.mapped_sub_type_id) {
    return issue.mapped_sub_type_id;
  }
  return issue.subTypeId || issue.sub_type_id;
};
