
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ValidationResult } from "@/types";

interface ValidationAlertsProps {
  validationResults: ValidationResult;
}

const ValidationAlerts = ({ validationResults }: ValidationAlertsProps) => {
  const { invalidRows, validEmployees } = validationResults;

  if (invalidRows.length > 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validation Errors Found</AlertTitle>
        <AlertDescription>
          {invalidRows.length} row(s) contain validation errors and will be skipped.
          {validEmployees.length > 0 && 
            ` ${validEmployees.length} valid employee(s) can still be uploaded.`}
        </AlertDescription>
      </Alert>
    );
  } 
  
  if (validEmployees.length > 0) {
    return (
      <Alert variant="default" className="mb-4 border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700">All Data Valid</AlertTitle>
        <AlertDescription className="text-green-700">
          {validEmployees.length} valid employee(s) ready to be uploaded.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No Valid Data</AlertTitle>
      <AlertDescription>
        The CSV file doesn't contain any valid employee data rows.
      </AlertDescription>
    </Alert>
  );
};

export default ValidationAlerts;
