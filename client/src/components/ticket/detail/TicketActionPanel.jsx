import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Save,
  UserRoundCheck,
  Workflow,
} from "lucide-react";
import useActiveTechnicians from "../../../hooks/useActiveTechnicians.js";
import {
  getTicketActionError,
} from "../../../services/ticketService.js";
import { getUserServiceErrorMessage } from "../../../services/userService.js";
import { getTicketStatusLabel } from "../../../utils/ticketPermissions.js";

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100";

function InlineActionError({ error }) {
  if (!error) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
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
      setError({ message: "Vui lòng chọn technician.", details: [] });
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
    <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-5 first:border-0 first:pt-0">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <UserRoundCheck className="size-4.5 text-blue-600" aria-hidden="true" />
        Phân công technician
      </h3>
      <label htmlFor="assign-technician" className="mt-4 block text-xs font-semibold text-slate-700">
        Nhân viên kỹ thuật
      </label>
      <select
        id="assign-technician"
        value={technicianId}
        disabled={submitting || techniciansState.isLoading || Boolean(techniciansState.error)}
        onChange={(event) => {
          setTechnicianId(event.target.value);
          setError(null);
        }}
        className={fieldClassName}
      >
        <option value="">
          {techniciansState.isLoading ? "Đang tải..." : "Chọn technician"}
        </option>
        {availableTechnicians.map((technician) => (
          <option key={technician._id} value={technician._id}>
            {technician.fullName}
            {technician.department ? ` · ${technician.department}` : ""}
          </option>
        ))}
      </select>

      <label htmlFor="assignment-reason" className="mt-4 block text-xs font-semibold text-slate-700">
        Lý do phân công <span className="font-normal text-slate-500">(không bắt buộc)</span>
      </label>
      <textarea
        id="assignment-reason"
        value={reason}
        maxLength={500}
        rows={3}
        disabled={submitting}
        onChange={(event) => setReason(event.target.value)}
        className={`${fieldClassName} min-h-24 resize-y`}
        placeholder="Bổ sung thông tin cho technician..."
      />

      {techniciansState.error ? (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          <p>{getUserServiceErrorMessage(techniciansState.error)}</p>
          <button
            type="button"
            onClick={techniciansState.refetch}
            className="mt-2 inline-flex min-h-9 items-center gap-2 font-semibold underline underline-offset-4"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Tải lại
          </button>
        </div>
      ) : null}
      {!techniciansState.isLoading && !techniciansState.error && availableTechnicians.length === 0 ? (
        <p className="mt-3 text-sm text-amber-700">Không có technician hoạt động khác để phân công.</p>
      ) : null}
      <InlineActionError error={error} />

      <button
        type="submit"
        disabled={submitting || !technicianId}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Đang phân công..." : "Xác nhận phân công"}
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
      setError({ message: "Vui lòng chọn trạng thái và nhập ghi chú.", details: [] });
      return;
    }

    if (resolving && resolution.trim().length < 10) {
      setError({ message: "Cách giải quyết phải có ít nhất 10 ký tự.", details: [] });
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
    <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-5 first:border-0 first:pt-0">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Workflow className="size-4.5 text-violet-600" aria-hidden="true" />
        Cập nhật trạng thái
      </h3>
      <label htmlFor="target-status" className="mt-4 block text-xs font-semibold text-slate-700">
        Trạng thái mới
      </label>
      <select
        id="target-status"
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

      <label htmlFor="status-note" className="mt-4 block text-xs font-semibold text-slate-700">
        Ghi chú thay đổi
      </label>
      <textarea
        id="status-note"
        value={note}
        maxLength={500}
        rows={3}
        disabled={submitting}
        onChange={(event) => {
          setNote(event.target.value);
          setError(null);
        }}
        className={`${fieldClassName} min-h-24 resize-y`}
        placeholder="Mô tả công việc đã thực hiện hoặc lý do thay đổi..."
      />

      {resolving ? (
        <>
          <label htmlFor="status-resolution" className="mt-4 block text-xs font-semibold text-slate-700">
            Cách giải quyết
          </label>
          <textarea
            id="status-resolution"
            value={resolution}
            minLength={10}
            maxLength={5000}
            rows={5}
            disabled={submitting}
            onChange={(event) => {
              setResolution(event.target.value);
              setError(null);
            }}
            className={`${fieldClassName} min-h-32 resize-y`}
            placeholder="Nhập chi tiết cách đã khắc phục sự cố..."
          />
        </>
      ) : null}

      <InlineActionError error={error} />
      <button
        type="submit"
        disabled={submitting || !targetStatus || !note.trim()}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Đang cập nhật..." : "Cập nhật trạng thái"}
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
      setError({ message: "Cách giải quyết phải có ít nhất 10 ký tự.", details: [] });
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
    <form onSubmit={handleSubmit} className="border-t border-slate-200 pt-5 first:border-0 first:pt-0">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Save className="size-4.5 text-emerald-600" aria-hidden="true" />
        Cách giải quyết
      </h3>
      <textarea
        value={resolution}
        minLength={10}
        maxLength={5000}
        rows={5}
        disabled={submitting}
        onChange={(event) => {
          setResolution(event.target.value);
          setError(null);
        }}
        className={`${fieldClassName} min-h-32 resize-y`}
        aria-label="Nội dung cách giải quyết"
        placeholder="Ghi lại các bước kiểm tra và khắc phục..."
      />
      <InlineActionError error={error} />
      <button
        type="submit"
        disabled={submitting || resolution.trim().length < 10}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-white px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
      >
        {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Đang lưu..." : "Lưu cách giải quyết"}
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Thao tác</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Chỉ các thao tác phù hợp với vai trò và trạng thái hiện tại được hiển thị.
      </p>

      <div className="mt-5 space-y-5">
        {permissions.canAssign ? (
          <AssignmentForm ticket={ticket} onAssign={onAssign} />
        ) : null}
        {permissions.canUpdateStatus ? (
          <StatusUpdateForm
            ticket={ticket}
            transitions={permissions.statusTransitions}
            onUpdateStatus={onUpdateStatus}
          />
        ) : null}
        {permissions.canEditResolution ? (
          <ResolutionForm ticket={ticket} onUpdateResolution={onUpdateResolution} />
        ) : null}

        {hasTerminalActions ? (
          <div className="border-t border-slate-200 pt-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertTriangle className="size-4.5 text-red-600" aria-hidden="true" />
              Xác nhận ticket
            </h3>
            <div className="mt-3 space-y-3">
              {permissions.canClose ? (
                <button
                  type="button"
                  onClick={onRequestClose}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Đóng ticket
                </button>
              ) : null}
              {permissions.canCancel ? (
                <button
                  type="button"
                  onClick={onRequestCancel}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  Hủy ticket
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {!hasWorkflowActions && !hasTerminalActions ? (
          <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
            Không có thao tác nào khả dụng ở trạng thái hiện tại.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default TicketActionPanel;
