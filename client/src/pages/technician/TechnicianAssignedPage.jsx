import TicketCollectionPage from "../../components/workspace/TicketCollectionPage.jsx";
import { MOCK_TICKETS } from "../../data/workspaceMockData.js";

function TechnicianAssignedPage() {
  return <TicketCollectionPage eyebrow="Nhân viên kỹ thuật" title="Ticket được phân công" description="Xem và tiếp nhận những yêu cầu admin đã phân công cho bạn." tickets={MOCK_TICKETS} allowedStatuses={["assigned"]} actionLabel="Tiếp nhận" emptyMessage="Không có ticket mới được phân công." />;
}
export default TechnicianAssignedPage;
