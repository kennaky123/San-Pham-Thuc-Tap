import { useCallback, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmActionModal from "../../components/common/ConfirmActionModal.jsx";
import TicketActionPanel from "../../components/ticket/detail/TicketActionPanel.jsx";
import TicketAttachmentGallery from "../../components/ticket/detail/TicketAttachmentGallery.jsx";
import TicketConversation from "../../components/ticket/detail/TicketConversation.jsx";
import TicketDetailErrorState from "../../components/ticket/detail/TicketDetailErrorState.jsx";
import TicketDetailHeader from "../../components/ticket/detail/TicketDetailHeader.jsx";
import TicketDetailSkeleton from "../../components/ticket/detail/TicketDetailSkeleton.jsx";
import TicketHistoryTimeline from "../../components/ticket/detail/TicketHistoryTimeline.jsx";
import {
  TicketDescriptionCard,
  TicketMetadataCard,
} from "../../components/ticket/detail/TicketOverview.jsx";
import useAuth from "../../hooks/useAuth.js";
import useTicketDetail from "../../hooks/useTicketDetail.js";
import {
  assignTicket,
  cancelTicket,
  closeTicket,
  getTicketActionError,
  getTicketDetailErrorMessage,
  postInternalNote,
  postTicketComment,
  updateTicketResolution,
  updateTicketStatus,
} from "../../services/ticketService.js";
import { getTicketPermissions } from "../../utils/ticketPermissions.js";

const BACK_PATHS = {
  user: "/user/tickets",
  technician: "/technician/tickets/assigned",
  admin: "/admin/tickets",
};

function TicketDetailPage() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const ticketState = useTicketDetail(ticketId);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationSubmitting, setConfirmationSubmitting] = useState(false);
  const [confirmationError, setConfirmationError] = useState(null);
  const backPath = BACK_PATHS[user?.role] ?? "/";
  const permissions = useMemo(
    () =>
      ticketState.ticket
        ? getTicketPermissions(ticketState.ticket, user)
        : null,
    [ticketState.ticket, user],
  );

  const closeConfirmation = useCallback(() => {
    if (!confirmationSubmitting) {
      setConfirmationAction(null);
      setConfirmationError(null);
    }
  }, [confirmationSubmitting]);

  async function runTicketMutation(request) {
    const result = await request;
    toast.success(result.message);
    ticketState.refetch();
    return result;
  }

  async function handleComment(content, isInternal) {
    const result = await (isInternal
      ? postInternalNote(ticketId, content)
      : postTicketComment(ticketId, content));
    toast.success(result.message);
    ticketState.refetch();
  }

  const handleConfirmation = useCallback(
    async (note) => {
      setConfirmationSubmitting(true);
      setConfirmationError(null);

      try {
        const result =
          confirmationAction === "close"
            ? await closeTicket(ticketId, note)
            : await cancelTicket(ticketId, note);
        toast.success(result.message);
        setConfirmationAction(null);
        ticketState.refetch();
      } catch (error) {
        setConfirmationError(getTicketActionError(error));

        if ([400, 404, 409].includes(error.response?.status)) {
          ticketState.refetch();
        }
      } finally {
        setConfirmationSubmitting(false);
      }
    },
    [confirmationAction, ticketId, ticketState],
  );

  if (ticketState.isTicketLoading && !ticketState.ticket) {
    return <TicketDetailSkeleton />;
  }

  if (ticketState.ticketError || !ticketState.ticket) {
    return (
      <TicketDetailErrorState
        message={getTicketDetailErrorMessage(ticketState.ticketError)}
        backPath={backPath}
        onRetry={ticketState.refetch}
      />
    );
  }

  const ticket = ticketState.ticket;

  return (
    <section aria-label={`Chi tiết ticket ${ticket.ticketCode}`}>
      <TicketDetailHeader
        ticket={ticket}
        backPath={backPath}
        refreshing={ticketState.isTicketLoading}
        onRefresh={ticketState.refetch}
      />

      <div className="mt-7 grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <TicketDescriptionCard ticket={ticket} />
          <TicketAttachmentGallery
            ticketId={ticket._id}
            attachments={ticket.attachments}
          />
          <TicketHistoryTimeline
            history={ticketState.history}
            loading={ticketState.isHistoryLoading}
            error={
              ticketState.historyError
                ? getTicketDetailErrorMessage(ticketState.historyError)
                : ""
            }
            onRetry={ticketState.refetch}
          />
          <TicketConversation
            comments={ticketState.comments}
            loading={ticketState.areCommentsLoading}
            error={
              ticketState.commentsError
                ? getTicketDetailErrorMessage(ticketState.commentsError)
                : ""
            }
            canComment={permissions.canComment}
            canCreateInternalNote={permissions.canCreateInternalNote}
            onRetry={ticketState.refetch}
            onSubmit={handleComment}
          />
        </div>

        <aside className="order-first space-y-6 xl:order-none xl:sticky xl:top-24">
          {ticketState.isTicketLoading ? (
            <div className="flex min-h-28 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm" role="status">
              <LoaderCircle className="mr-2 size-5 animate-spin" aria-hidden="true" />
              Đang cập nhật thao tác...
            </div>
          ) : (
            <TicketActionPanel
              key={`${ticket._id}:${ticket.status}:${ticket.assignedTo?._id ?? "none"}`}
              ticket={ticket}
              permissions={permissions}
              onAssign={(payload) =>
                runTicketMutation(assignTicket(ticketId, payload))
              }
              onUpdateStatus={(payload) =>
                runTicketMutation(updateTicketStatus(ticketId, payload))
              }
              onUpdateResolution={(resolution) =>
                runTicketMutation(updateTicketResolution(ticketId, resolution))
              }
              onRequestCancel={() => {
                setConfirmationError(null);
                setConfirmationAction("cancel");
              }}
              onRequestClose={() => {
                setConfirmationError(null);
                setConfirmationAction("close");
              }}
            />
          )}
          <TicketMetadataCard ticket={ticket} />
        </aside>
      </div>

      {confirmationAction ? (
        <ConfirmActionModal
          key={confirmationAction}
          title={
            confirmationAction === "close"
              ? "Xác nhận đóng ticket"
              : "Xác nhận hủy ticket"
          }
          description={
            confirmationAction === "close"
              ? "Ticket sẽ chuyển sang trạng thái đã đóng. Hãy chỉ xác nhận khi sự cố đã được giải quyết đầy đủ."
              : "Ticket sẽ bị hủy và không thể tiếp tục xử lý theo quy trình hiện tại."
          }
          confirmLabel={
            confirmationAction === "close" ? "Đóng ticket" : "Hủy ticket"
          }
          noteLabel={
            confirmationAction === "close"
              ? "Ghi chú xác nhận (không bắt buộc)"
              : "Lý do hủy (không bắt buộc)"
          }
          notePlaceholder={
            confirmationAction === "close"
              ? "Ví dụ: Tôi xác nhận sự cố đã được khắc phục..."
              : "Nhập lý do hủy ticket..."
          }
          submitting={confirmationSubmitting}
          error={confirmationError}
          onCancel={closeConfirmation}
          onConfirm={handleConfirmation}
        />
      ) : null}
    </section>
  );
}

export default TicketDetailPage;
