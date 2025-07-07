
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, User } from "lucide-react";
import { User as UserType } from "@/types";

interface EmployeeInformationProps {
  employee: UserType | null;
}

const EmployeeInformation = ({ employee }: EmployeeInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Information</CardTitle>
      </CardHeader>
      <CardContent>
        {employee ? (
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yulu-blue text-white flex items-center justify-center text-2xl">
                {employee.name.charAt(0)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span>{employee.name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{employee.phone}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{employee.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cluster</p>
                <p className="font-medium">{employee.cluster}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p className="font-medium">{employee.manager || "N/A"}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Employee information not available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeInformation;
