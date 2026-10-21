import TechnicianTicketCollectionPage from "../../components/workspace/TechnicianTicketCollectionPage.jsx";

function TechnicianInProgressPage() {
  return <TechnicianTicketCollectionPage title="Ticket đang xử lý" description="Theo dõi ticket đang thực hiện và các yêu cầu chờ người dùng phản hồi." statuses={["in_progress", "waiting_user"]} sourcePath="/technician/tickets/in-progress" actionLabel="Cập nhật" emptyMessage="Bạn không có ticket đang xử lý." />;
}
export default TechnicianInProgressPage;
