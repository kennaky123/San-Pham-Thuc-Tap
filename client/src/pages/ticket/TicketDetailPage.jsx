import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmActionModal from "../../components/common/ConfirmActionModal.jsx";
import { TicketPriorityBadge } from "../../components/ticket/TicketBadges.jsx";
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
import { getSlaDisplayForTicket } from "../../data/itsmData.js";
import useAuth from "../../hooks/useAuth.js";
import useTicketDetail from "../../hooks/useTicketDetail.js";
import useTicketList from "../../hooks/useTicketList.js";
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
  admin: "/admin/tickets",
};

function getBackPath(role, status) {
  if (role !== "technician") {
    return BACK_PATHS[role] ?? "/";
  }

  if (["in_progress", "waiting_user"].includes(status)) {
    return "/technician/tickets/in-progress";
  }

  if (["resolved", "closed", "cancelled"].includes(status)) {
    return "/technician/history";
  }

  if (status === "assigned") {
    return "/technician/tickets/assigned";
  }

  return "/technician/tickets/all";
}

function getTicketDetailPath(role, id) {
  if (role === "admin") return `/admin/tickets/${id}`;
  if (role === "technician") return `/technician/tickets/${id}`;
  return `/user/tickets/${id}`;
}

function TicketDetailPage() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const ticketState = useTicketDetail(ticketId);
  const sidebarQueueQuery = useMemo(
    () => ({
      search: "",
      status: "",
      priority: "",
      category: "",
      technician: "",
      sortOrder: "desc",
      page: 1,
      limit: 15,
    }),
    [],
  );
  const queueList = useTicketList(sidebarQueueQuery);
  const queueTickets = queueList.data?.tickets ?? [];

  const [confirmationAction, setConfirmationAction] = useState(null);
  const [confirmationSubmitting, setConfirmationSubmitting] = useState(false);
  const [confirmationError, setConfirmationError] = useState(null);
  const backPath = getBackPath(user?.role, ticketState.ticket?.status);
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
    queueList.refetch();
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
        queueList.refetch();
      } catch (error) {
        setConfirmationError(getTicketActionError(error));

        if ([400, 404, 409].includes(error.response?.status)) {
          ticketState.refetch();
        }
      } finally {
        setConfirmationSubmitting(false);
      }
    },
    [confirmationAction, queueList, ticketId, ticketState],
  );

  if (ticketState.isTicketLoading && !ticketState.ticket) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <TicketDetailSkeleton />
      </div>
    );
  }

  if (ticketState.ticketError || !ticketState.ticket) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <TicketDetailErrorState
          message={getTicketDetailErrorMessage(ticketState.ticketError)}
          backPath={backPath}
          onRetry={ticketState.refetch}
        />
      </div>
    );
  }

  const ticket = ticketState.ticket;

  return (
    <section
      aria-label={`Chi tiết ticket ${ticket.ticketCode}`}
      className="flex min-h-[calc(100vh-3.5rem)] flex-col border-t border-brand-bone bg-white lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden"
    >
      {/* Left Column: Compact Ticket Queue List (320px, matches DeskPro IT View 2) */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-brand-bone bg-white lg:flex">
        <div className="flex items-center justify-between border-b border-brand-bone bg-brand-mist/50 p-3.5">
          <Link
            to={backPath}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-slate transition-colors hover:text-brand-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Quay lại Hàng Đợi
          </Link>
          <span className="rounded bg-brand-bone/70 px-2 py-0.5 text-[11px] font-bold text-brand-ash">
            {queueTickets.length} ticket gần đây
          </span>
        </div>

        <div className="custom-scrollbar flex-1 divide-y divide-brand-bone overflow-y-auto">
          {queueTickets.map((item) => {
            const isActive = item._id === ticket._id;
            const sla = getSlaDisplayForTicket(item);
            return (
              <Link
                key={item._id}
                to={getTicketDetailPath(user?.role, item._id)}
                className={`block p-3.5 transition-colors ${
                  isActive
                    ? "border-l-4 border-l-brand-violet bg-brand-violet/[0.06]"
                    : "hover:bg-brand-mist/70"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-brand-ink">
                    {item.ticketCode}
                  </span>
                  <TicketPriorityBadge priority={item.priority} />
                </div>
                <div className="line-clamp-2 text-xs leading-snug font-semibold text-brand-ink">
                  {item.title}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-brand-ash">
                  <span className="truncate">
                    {item.createdBy?.fullName ?? "Nội bộ"}
                  </span>
                  <span className={`shrink-0 font-mono ${sla.color}`}>
                    {sla.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Center Column: Ticket Conversation & Activity Stream */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-brand-mist/30">
        <TicketDetailHeader
          ticket={ticket}
          backPath={backPath}
          refreshing={ticketState.isTicketLoading || ticketState.isRefreshing}
          onRefresh={ticketState.refetch}
        />

        <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-6">
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
      </div>

      {/* Right Column: Context, Requester Profile, Asset Telemetry & Workflow Actions */}
      <aside className="custom-scrollbar w-full shrink-0 border-t border-brand-bone bg-white lg:w-88 lg:overflow-y-auto lg:border-t-0 lg:border-l">
        {ticketState.isTicketLoading ? (
          <div
            className="flex min-h-24 items-center justify-center border-b border-brand-bone p-4 text-xs text-brand-slate"
            role="status"
          >
            <LoaderCircle
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
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
