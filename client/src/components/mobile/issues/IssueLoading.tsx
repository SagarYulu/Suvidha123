
import MobileLayout from "@/components/MobileLayout";

interface IssueLoadingProps {
  title?: string;
  message?: string;
}

const IssueLoading = ({ 
  title = "Issue Details", 
  message = "Loading issue details..."
}: IssueLoadingProps) => {
  return (
    <MobileLayout title={title}>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E40AF] mb-4"></div>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </MobileLayout>
  );
};

export default IssueLoading;
