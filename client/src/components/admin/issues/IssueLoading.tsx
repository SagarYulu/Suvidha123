
import AdminLayout from "@/components/AdminLayout";

interface IssueLoadingProps {
  title?: string;
}

const IssueLoading = ({ title = "Issue Details" }: IssueLoadingProps) => {
  return (
    <AdminLayout title={title}>
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    </AdminLayout>
  );
};

export default IssueLoading;
