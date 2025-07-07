
import { useParams } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { useMobileIssue } from "@/hooks/useMobileIssue";
import IssueHeader from "@/components/mobile/issues/IssueHeader";
import CommentSection from "@/components/mobile/issues/CommentSection";
import IssueLoading from "@/components/mobile/issues/IssueLoading";
import IssueError from "@/components/mobile/issues/IssueError";
import ClosedIssueCommentNotice from "@/components/mobile/issues/ClosedIssueCommentNotice";

const MobileIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    issue,
    isLoading,
    errorMessage,
    newComment,
    setNewComment,
    isSubmitting,
    commenterNames,
    handleSubmitComment,
    getStatusBadgeColor,
    formatDate,
    currentUserId,
    isReopenable,
    processReopenTicket
  } = useMobileIssue(id);

  if (isLoading) {
    return <IssueLoading />;
  }

  if (errorMessage || !issue) {
    return <IssueError errorMessage={errorMessage} />;
  }

  const isClosedOrResolved = issue.status === "closed" || issue.status === "resolved";
  const bgColor = isClosedOrResolved ? "bg-gray-500" : "bg-blue-600"; // Changed to blue

  return (
    <MobileLayout 
      title="Issue Details"
      bgColor={bgColor}
    >
      <div className="pb-16">
        <IssueHeader
          issue={issue}
          formatDate={formatDate}
          getIssueTypeLabel={getIssueTypeLabel}
          getIssueSubTypeLabel={getIssueSubTypeLabel}
          getStatusBadgeColor={getStatusBadgeColor}
          isReopenable={isReopenable || false}
          handleReopenTicket={processReopenTicket}
        />
        
        {isClosedOrResolved && (
          <ClosedIssueCommentNotice 
            isReopenable={isReopenable || false}
            onReopen={processReopenTicket}
            issueId={issue.id.toString()}
            employeeUuid={currentUserId.toString()}
          />
        )}
        
        <CommentSection
          comments={issue.comments}
          newComment={isClosedOrResolved ? "" : newComment}
          setNewComment={isClosedOrResolved ? () => {} : setNewComment}
          handleSubmitComment={isClosedOrResolved ? () => {} : handleSubmitComment}
          isSubmitting={isSubmitting}
          commenterNames={commenterNames}
          formatDate={formatDate}
          currentUserId={currentUserId}
          disabled={isClosedOrResolved}
        />
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
