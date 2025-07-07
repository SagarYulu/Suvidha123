
import { Card, CardContent } from "@/components/ui/card";
import { Check, Info } from "lucide-react";

const FormatInstructions = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start mb-2">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm">CSV Format Instructions</h3>
            <p className="text-sm text-muted-foreground">
              Please ensure your CSV file follows these guidelines:
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">Required Headers:</span> User ID, emp_id, name, email, role
            </div>
          </div>

          <div className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">Optional Headers:</span> phone, city, cluster, manager, date_of_joining, date_of_birth, blood_group, account_number, ifsc_code, password
            </div>
          </div>

          <div className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">User ID Format:</span> Must be a 7-digit number (e.g., 1234567)
            </div>
          </div>

          <div className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">Date Format:</span> DD-MM-YYYY or DD/MM/YYYY
            </div>
          </div>

          <div className="flex items-start">
            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium">Password:</span> If not provided, defaults to "changeme123"
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatInstructions;
