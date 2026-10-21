import TechnicianTicketCollectionPage from "../../components/workspace/TechnicianTicketCollectionPage.jsx";

function TechnicianAssignedPage() {
  return <TechnicianTicketCollectionPage title="Ticket được phân công" description="Xem và tiếp nhận những yêu cầu admin đã phân công cho bạn." statuses={["assigned"]} sourcePath="/technician/tickets/assigned" actionLabel="Tiếp nhận" emptyMessage="Không có ticket mới được phân công." />;
}
export default TechnicianAssignedPage;
