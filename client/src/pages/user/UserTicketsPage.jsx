import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import TicketCollectionPage from "../../components/workspace/TicketCollectionPage.jsx";
import { MOCK_TICKETS } from "../../data/workspaceMockData.js";

function UserTicketsPage() {
  return <TicketCollectionPage eyebrow="Người dùng" title="Yêu cầu của tôi" description="Tìm kiếm, lọc và theo dõi toàn bộ yêu cầu hỗ trợ bạn đã gửi." tickets={MOCK_TICKETS} actionLabel="Theo dõi" headerAction={<Link to="/user/tickets/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="size-4" />Tạo yêu cầu</Link>} />;
}

export default UserTicketsPage;
