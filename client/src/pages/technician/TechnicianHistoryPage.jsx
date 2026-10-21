import TechnicianTicketCollectionPage from "../../components/workspace/TechnicianTicketCollectionPage.jsx";

function TechnicianHistoryPage() {
  return <TechnicianTicketCollectionPage title="Lịch sử xử lý" description="Tra cứu các yêu cầu đã hoàn thành, nội dung giải quyết và kết quả SLA." statuses={["resolved", "closed", "cancelled"]} sourcePath="/technician/history" actionLabel="Xem lại" emptyMessage="Chưa có lịch sử xử lý." />;
}
export default TechnicianHistoryPage;
