import TicketCollectionPage from "../../components/workspace/TicketCollectionPage.jsx";
import { MOCK_TICKETS } from "../../data/workspaceMockData.js";

function TechnicianInProgressPage() {
  return <TicketCollectionPage eyebrow="Nhân viên kỹ thuật" title="Ticket đang xử lý" description="Theo dõi ticket đang thực hiện và các yêu cầu chờ người dùng phản hồi." tickets={MOCK_TICKETS} allowedStatuses={["in_progress", "waiting_user"]} actionLabel="Cập nhật" emptyMessage="Bạn không có ticket đang xử lý." />;
}
export default TechnicianInProgressPage;
