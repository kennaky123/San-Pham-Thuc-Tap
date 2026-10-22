import TechnicianTicketCollectionPage from "../../components/workspace/TechnicianTicketCollectionPage.jsx";

function TechnicianAllTicketsPage() {
  return (
    <TechnicianTicketCollectionPage
      title="Tất Cả Ticket Hệ Thống"
      description="Xem toàn bộ yêu cầu trong hệ thống, bao gồm các ticket mới chưa phân công để chủ động tiếp nhận xử lý."
      statuses={[]}
      sourcePath="/technician/tickets/all"
      actionLabel="Chi tiết"
      emptyMessage="Không có ticket nào trong hệ thống."
    />
  );
}

export default TechnicianAllTicketsPage;

