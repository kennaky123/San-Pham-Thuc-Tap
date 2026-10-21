import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Save,
  UserRoundCheck,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import useActiveTechnicians from "../../../hooks/useActiveTechnicians.js";
import { getTicketActionError } from "../../../services/ticketService.js";
import { getUserServiceErrorMessage } from "../../../services/userService.js";
import { getTicketStatusLabel } from "../../../utils/ticketPermissions.js";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-brand-bone bg-brand-mist px-3 py-2 text-xs font-semibold text-brand-ink outline-none transition focus:border-brand-violet focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

function InlineActionError({ error }) {
  if (!error) {
    return null;
  }

  return (
    <div
      className="mt-2.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
      role="alert"
    >
      <p>{error.message}</p>
      {error.details?.length > 0 ? (
        <ul className="mt-1 list-disc pl-5">
          {error.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AssignmentForm({ ticket, onAssign }) {
  const techniciansState = useActiveTechnicians(true);
  const [technicianId, setTechnicianId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const availableTechnicians = techniciansState.technicians.filter(
    (technician) => technician._id !== ticket.assignedTo?._id,
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!technicianId) {
      setError({ message: "Vui lòng chọn kỹ thuật viên.", details: [] });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onAssign({ technicianId, reason: reason.trim() || null });
    } catch (requestError) {
      setError(getTicketActionError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-brand-bone pt-4 first:border-0 first:pt-0"
    >
      <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand-ink">
        <UserRoundCheck
          className="size-4 text-brand-violet"
          aria-hidden="true"
        />
        Kỹ Thuật Viên Phụ Trách (Assignee)
      </h4>
      <select
        id="assign-technician"
        aria-label="Nhân viên kỹ thuật"
        value={technicianId}
        disabled={
          submitting ||
          techniciansState.isLoading ||
          Boolean(techniciansState.error)
        }
        onChange={(event) => {
          setTechnicianId(event.target.value);
          setError(null);
        }}
        className={fieldClassName}
      >
        <option value="">
          {techniciansState.isLoading
            ? "Đang tải kỹ thuật viên..."
            : "-- Chọn kỹ thuật viên phụ trách --"}
        </option>
        {availableTechnicians.map((technician) => (
          <option key={technician._id} value={technician._id}>
            {technician.fullName}
            {technician.department ? ` (${technician.department})` : ""}
          </option>
        ))}
      </select>

      <textarea
        id="assignment-reason"
        aria-label="Lý do phân công"
        value={reason}
        maxLength={500}
        rows={2}
        disabled={submitting}
        onChange={(event) => setReason(event.target.value)}
        className={`${fieldClassName} resize-y font-normal`}
        placeholder="Ghi chú bàn giao cho kỹ thuật viên (tùy chọn)..."
      />

      {techniciansState.error ? (
        <div
          className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800"
          role="alert"
        >
          <p>{getUserServiceErrorMessage(techniciansState.error)}</p>
          <button
            type="button"
            onClick={techniciansState.refetch}
            className="mt-1 inline-flex items-center gap-1 font-semibold underline"
          >
            <RefreshCw className="size-3" aria-hidden="true" />
            Tải lại
          </button>
        </div>
      ) : null}
      {!techniciansState.isLoading &&
      !techniciansState.error &&
      availableTechnicians.length === 0 ? (
        <p className="mt-2 text-xs text-amber-700">
          Không có kỹ thuật viên hoạt động khác để phân công.
        </p>
      ) : null}
      <InlineActionError error={error} />

      <button
        type="submit"
        disabled={submitting || !technicianId}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-carbon disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        ) : null}
        {submitting ? "Đang phân công..." : "Xác Nhận Phân Công"}
      </button>
    </form>
  );
}

function StatusUpdateForm({ ticket, transitions, onUpdateStatus }) {
  const [targetStatus, setTargetStatus] = useState(transitions[0] ?? "");
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState(ticket.resolution ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const resolving = targetStatus === "resolved";

  async function handleSubmit(event) {
    event.preventDefault();

    if (!targetStatus || !note.trim()) {
      setError({
        message: "Vui lòng chọn trạng thái và nhập ghi chú.",
        details: [],
      });
      return;
    }

    if (resolving && resolution.trim().length < 10) {
      setError({
        message: "Cách giải quyết phải có ít nhất 10 ký tự.",
        details: [],
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onUpdateStatus({
        status: targetStatus,
        note: note.trim(),
        ...(resolving && { resolution: resolution.trim() }),
      });
    } catch (requestError) {
      setError(getTicketActionError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-brand-bone pt-4 first:border-0 first:pt-0"
    >
      <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand-ink">
        <Workflow className="size-4 text-brand-violet" aria-hidden="true" />
        Trạng Thái Xử Lý
      </h4>
      <select
        id="target-status"
        aria-label="Trạng thái mới"
        value={targetStatus}
        disabled={submitting}
        onChange={(event) => {
          setTargetStatus(event.target.value);
          setError(null);
        }}
        className={fieldClassName}
      >
        {transitions.map((status) => (
          <option key={status} value={status}>
            {getTicketStatusLabel(status)}
          </option>
        ))}
      </select>

      <textarea
        id="status-note"
        aria-label="Ghi chú thay đổi trạng thái"
        value={note}
        maxLength={500}
        rows={2}
        disabled={submitting}
        onChange={(event) => {
          setNote(event.target.value);
          setError(null);
        }}
        className={`${fieldClassName} resize-y font-normal`}
        placeholder="Mô tả bước xử lý vừa thực hiện..."
      />

      {resolving ? (
        <textarea
          id="status-resolution"
          aria-label="Cách giải quyết"
          value={resolution}
          minLength={10}
          maxLength={5000}
          rows={3}
          disabled={submitting}
          onChange={(event) => {
            setResolution(event.target.value);
            setError(null);
          }}
          className={`${fieldClassName} resize-y font-normal`}
          placeholder="Nhập chi tiết giải pháp khắc phục sự cố (tối thiểu 10 ký tự)..."
        />
      ) : null}

      <InlineActionError error={error} />
      <button
        type="submit"
        disabled={submitting || !targetStatus || !note.trim()}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-violet px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-violet/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        ) : null}
        {submitting ? "Đang cập nhật..." : "Cập Nhật Trạng Thái"}
      </button>
    </form>
  );
}

function ResolutionForm({ ticket, onUpdateResolution }) {
  const [resolution, setResolution] = useState(ticket.resolution ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (resolution.trim().length < 10) {
      setError({
        message: "Cách giải quyết phải có ít nhất 10 ký tự.",
        details: [],
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onUpdateResolution(resolution.trim());
    } catch (requestError) {
      setError(getTicketActionError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-brand-bone pt-4 first:border-0 first:pt-0"
    >
      <h4 className="flex items-center gap-1.5 text-xs font-bold text-brand-ink">
        <Save className="size-4 text-brand-emerald" aria-hidden="true" />
        Cập Nhật Giải Pháp (Resolution)
      </h4>
      <textarea
        value={resolution}
        minLength={10}
        maxLength={5000}
        rows={3}
        disabled={submitting}
        onChange={(event) => {
          setResolution(event.target.value);
          setError(null);
        }}
        className={`${fieldClassName} resize-y font-normal`}
        aria-label="Nội dung cách giải quyết"
        placeholder="Ghi lại các bước kiểm tra và khắc phục..."
      />
      <InlineActionError error={error} />
      <button
        type="submit"
        disabled={submitting || resolution.trim().length < 10}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-brand-emerald bg-white px-3 py-2 text-xs font-semibold text-brand-emerald transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        ) : null}
        {submitting ? "Đang lưu..." : "Lưu Cách Giải Quyết"}
      </button>
    </form>
  );
}

function TicketActionPanel({
  ticket,
  permissions,
  onAssign,
  onUpdateStatus,
  onUpdateResolution,
  onRequestCancel,
  onRequestClose,
}) {
  const hasWorkflowActions =
    permissions.canAssign ||
    permissions.canUpdateStatus ||
    permissions.canEditResolution;
  const hasTerminalActions = permissions.canCancel || permissions.canClose;

  return (
    <section className="border-b border-brand-bone p-5">
      <h3 className="text-[11px] font-bold tracking-wider text-brand-slate uppercase">
        Thuộc Tính & Điều Phối Ticket
      </h3>

      <div className="mt-3 space-y-4">
        {permissions.canUpdateStatus ? (
          <StatusUpdateForm
            ticket={ticket}
            transitions={permissions.statusTransitions}
            onUpdateStatus={onUpdateStatus}
          />
        ) : null}
        {permissions.canAssign ? (
          <AssignmentForm ticket={ticket} onAssign={onAssign} />
        ) : null}
        {permissions.canEditResolution ? (
          <ResolutionForm
            ticket={ticket}
            onUpdateResolution={onUpdateResolution}
          />
        ) : null}

        {hasTerminalActions ? (
          <div className="border-t border-brand-bone pt-4">
            <h4 className="mb-2.5 text-xs font-bold text-brand-ink">
              Hoàn Tất / Đóng Yêu Cầu
            </h4>
            <div className="space-y-2">
              {permissions.canClose ? (
                <button
                  type="button"
                  onClick={onRequestClose}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-emerald px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-emerald/90"
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Xác Nhận Đóng Ticket
                </button>
              ) : null}
              {permissions.canCancel ? (
                <button
                  type="button"
                  onClick={onRequestCancel}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <AlertTriangle className="size-3.5" aria-hidden="true" />
                  Hủy Ticket Này
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {!hasWorkflowActions && !hasTerminalActions ? (
          <p className="rounded-lg bg-brand-mist px-3 py-2.5 text-xs text-brand-slate">
            Ticket hiện đã khóa thao tác hoặc hoàn tất quy trình SLA.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default TicketActionPanel;
