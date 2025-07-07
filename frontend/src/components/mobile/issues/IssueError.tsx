
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface IssueErrorProps {
  title?: string;
  errorMessage?: string;
}

const IssueError = ({ 
  title = "Issue Details", 
  errorMessage = "Issue not found" 
}: IssueErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <MobileLayout title={title}>
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">{errorMessage}</h3>
        <Button variant="link" onClick={() => navigate("/mobile/issues")}>
          Back to Issues
        </Button>
      </div>
    </MobileLayout>
  );
};

export default IssueError;
