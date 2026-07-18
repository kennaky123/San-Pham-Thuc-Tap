import TicketCollectionPage from "../../components/workspace/TicketCollectionPage.jsx";
import { MOCK_TICKETS } from "../../data/workspaceMockData.js";

function TechnicianHistoryPage() {
  return <TicketCollectionPage eyebrow="Nhân viên kỹ thuật" title="Lịch sử xử lý" description="Tra cứu các yêu cầu đã hoàn thành, nội dung giải quyết và kết quả SLA." tickets={MOCK_TICKETS} allowedStatuses={["resolved", "closed", "cancelled"]} actionLabel="Xem lại" emptyMessage="Chưa có lịch sử xử lý." />;
}
export default TechnicianHistoryPage;
