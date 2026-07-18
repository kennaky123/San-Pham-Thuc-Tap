import { useEffect, useRef, useState } from "react";
import { AlertCircle, LoaderCircle, RefreshCw, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clientEnv } from "../../../config/env.js";
import useActiveCategories from "../../../hooks/useActiveCategories.js";
import { getCategoryErrorMessage } from "../../../services/categoryService.js";
import {
  createTicket,
  getCreateTicketError,
} from "../../../services/ticketService.js";
import {
  PRIORITY_OPTIONS,
  validateImageFile,
  validateTicketField,
  validateTicketForm,
} from "../../../utils/ticketFormValidation.js";
import ImageAttachmentField from "./ImageAttachmentField.jsx";

const INITIAL_VALUES = Object.freeze({
  title: "",
  category: "",
  priority: "medium",
  description: "",
});

const inputClassName =
  "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 sm:text-sm";

function getFileSignature(file) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function createAttachmentId() {
  return globalThis.crypto?.randomUUID?.() ??
    `attachment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function RequiredMark() {
  return (
    <>
      <span className="ml-1 text-red-600" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (bắt buộc)</span>
    </>
  );
}

function TicketRequestForm() {
  const navigate = useNavigate();
  const { categories, error: categoryError, isLoading, refetch } =
    useActiveCategories();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState({});
  const [attachmentError, setAttachmentError] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const formRef = useRef(null);
  const apiErrorRef = useRef(null);
  const requestControllerRef = useRef(null);
  const previewUrlsRef = useRef(new Set());

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      requestControllerRef.current?.abort();
      previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      previewUrls.clear();
    };
  }, []);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
    setApiError(null);
  }

  function handleFieldBlur(event) {
    const { name, value } = event.target;
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateTicketField(name, value),
    }));
  }

  function handleFilesSelected(files) {
    if (files.length === 0) {
      return;
    }

    const currentSignatures = new Set(
      attachments.map(({ file }) => getFileSignature(file)),
    );
    const availableSlots = Math.max(
      0,
      clientEnv.maxFilesPerTicket - attachments.length,
    );
    const acceptedAttachments = [];
    const rejectedMessages = [];

    files.forEach((file) => {
      const validationMessage = validateImageFile(
        file,
        clientEnv.maxFileSizeMb,
      );
      const signature = getFileSignature(file);

      if (validationMessage) {
        rejectedMessages.push(validationMessage);
        return;
      }

      if (currentSignatures.has(signature)) {
        rejectedMessages.push(`${file.name}: ảnh này đã được chọn.`);
        return;
      }

      if (acceptedAttachments.length >= availableSlots) {
        if (!rejectedMessages.some((message) => message.includes("tối đa"))) {
          rejectedMessages.push(
            `Mỗi yêu cầu chỉ được đính kèm tối đa ${clientEnv.maxFilesPerTicket} ảnh.`,
          );
        }
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      currentSignatures.add(signature);
      acceptedAttachments.push({
        id: createAttachmentId(),
        file,
        previewUrl,
      });
    });

    if (acceptedAttachments.length > 0) {
      setAttachments((currentAttachments) => [
        ...currentAttachments,
        ...acceptedAttachments,
      ]);
    }

    setAttachmentError(rejectedMessages.join(" "));
    setApiError(null);
  }

  function handleRemoveAttachment(attachmentId) {
    setAttachments((currentAttachments) => {
      const attachment = currentAttachments.find(
        (item) => item.id === attachmentId,
      );

      if (attachment) {
        URL.revokeObjectURL(attachment.previewUrl);
        previewUrlsRef.current.delete(attachment.previewUrl);
      }

      return currentAttachments.filter((item) => item.id !== attachmentId);
    });
    setAttachmentError("");
  }

  function focusFirstInvalidField() {
    window.requestAnimationFrame(() => {
      formRef.current
        ?.querySelector('[aria-invalid="true"]')
        ?.focus({ preventScroll: false });
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateTicketForm(values);

    if (
      values.category &&
      !categories.some((category) => category.id === values.category)
    ) {
      nextErrors.category = "Danh mục đã chọn không còn hoạt động.";
    }

    setFieldErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidField();
      return;
    }

    const abortController = new AbortController();
    requestControllerRef.current = abortController;
    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      const result = await createTicket(
        { ...values, attachments },
        {
          signal: abortController.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(
                Math.min(
                  100,
                  Math.round((progressEvent.loaded / progressEvent.total) * 100),
                ),
              );
            }
          },
        },
      );

      previewUrlsRef.current.forEach((previewUrl) =>
        URL.revokeObjectURL(previewUrl),
      );
      previewUrlsRef.current.clear();
      toast.success(result.message || "Tạo yêu cầu thành công.");
      navigate(`/user/tickets/${result.ticket._id}`, { replace: true });
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        return;
      }

      setApiError(getCreateTicketError(error));
      window.requestAnimationFrame(() => apiErrorRef.current?.focus());
    } finally {
      if (requestControllerRef.current === abortController) {
        requestControllerRef.current = null;
        setIsSubmitting(false);
        setUploadProgress(null);
      }
    }
  }

  const categoryErrorMessage = categoryError
    ? getCategoryErrorMessage(categoryError)
    : "";
  const categoryUnavailable =
    isLoading || Boolean(categoryError) || categories.length === 0;

  return (
    <form
      ref={formRef}
      noValidate
      aria-busy={isSubmitting}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <fieldset disabled={isSubmitting} className="space-y-6 p-5 sm:p-7">
        <legend className="sr-only">Thông tin yêu cầu hỗ trợ</legend>

        <div>
          <label htmlFor="ticket-title" className="text-sm font-semibold text-slate-800">
            Tiêu đề
            <RequiredMark />
          </label>
          <input
            id="ticket-title"
            name="title"
            type="text"
            value={values.title}
            maxLength={200}
            autoComplete="off"
            placeholder="Ví dụ: Không thể kết nối máy in phòng Kế toán"
            className={`${inputClassName} ${fieldErrors.title ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={`ticket-title-hint ticket-title-count${fieldErrors.title ? " ticket-title-error" : ""}`}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
          />
          <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
            <p id="ticket-title-hint" className="text-slate-500">
              Tóm tắt ngắn gọn sự cố bạn đang gặp.
            </p>
            <span id="ticket-title-count" className="shrink-0 text-slate-500">
              {values.title.length}/200
            </span>
          </div>
          {fieldErrors.title ? (
            <p id="ticket-title-error" className="mt-1.5 text-sm text-red-700">
              {fieldErrors.title}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="ticket-category" className="text-sm font-semibold text-slate-800">
              Danh mục sự cố
              <RequiredMark />
            </label>
            <select
              id="ticket-category"
              name="category"
              value={values.category}
              disabled={isSubmitting || categoryUnavailable}
              className={`${inputClassName} ${fieldErrors.category ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? "ticket-category-error" : undefined}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
            >
              <option value="">
                {isLoading ? "Đang tải danh mục..." : "Chọn danh mục"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldErrors.category ? (
              <p id="ticket-category-error" className="mt-1.5 text-sm text-red-700">
                {fieldErrors.category}
              </p>
            ) : null}
            {categoryErrorMessage ? (
              <div className="mt-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">
                <p>{categoryErrorMessage}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-md font-semibold text-red-800 underline decoration-red-300 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Tải lại danh mục
                </button>
              </div>
            ) : null}
            {!isLoading && !categoryError && categories.length === 0 ? (
              <p className="mt-2 text-sm text-amber-700" role="status">
                Chưa có danh mục đang hoạt động. Vui lòng liên hệ Admin.
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="ticket-priority" className="text-sm font-semibold text-slate-800">
              Mức độ ưu tiên
              <RequiredMark />
            </label>
            <select
              id="ticket-priority"
              name="priority"
              value={values.priority}
              className={`${inputClassName} ${fieldErrors.priority ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
              aria-invalid={Boolean(fieldErrors.priority)}
              aria-describedby="ticket-priority-hint"
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <p id="ticket-priority-hint" className="mt-1.5 text-xs leading-5 text-slate-500">
              {
                PRIORITY_OPTIONS.find(
                  (priority) => priority.value === values.priority,
                )?.description
              }
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="ticket-description" className="text-sm font-semibold text-slate-800">
            Mô tả chi tiết
            <RequiredMark />
          </label>
          <textarea
            id="ticket-description"
            name="description"
            value={values.description}
            rows={7}
            maxLength={5000}
            placeholder="Mô tả thời điểm xảy ra, thông báo lỗi, thiết bị/phần mềm liên quan và các bước bạn đã thử..."
            className={`${inputClassName} min-h-40 resize-y ${fieldErrors.description ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={`ticket-description-hint ticket-description-count${fieldErrors.description ? " ticket-description-error" : ""}`}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
          />
          <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
            <p id="ticket-description-hint" className="text-slate-500">
              Càng đầy đủ thông tin, bộ phận kỹ thuật càng dễ hỗ trợ nhanh.
            </p>
            <span id="ticket-description-count" className="shrink-0 text-slate-500">
              {values.description.length}/5000
            </span>
          </div>
          {fieldErrors.description ? (
            <p id="ticket-description-error" className="mt-1.5 text-sm text-red-700">
              {fieldErrors.description}
            </p>
          ) : null}
        </div>

        <ImageAttachmentField
          attachments={attachments}
          disabled={isSubmitting}
          error={attachmentError}
          maxFiles={clientEnv.maxFilesPerTicket}
          maxFileSizeMb={clientEnv.maxFileSizeMb}
          onFilesSelected={handleFilesSelected}
          onRemove={handleRemoveAttachment}
        />

        {apiError ? (
          <div
            ref={apiErrorRef}
            tabIndex={-1}
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 outline-none focus:ring-2 focus:ring-red-500"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Không thể tạo yêu cầu</p>
                <p className="mt-1 leading-6">{apiError.message}</p>
                {apiError.details.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {apiError.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </fieldset>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => navigate("/user/tickets")}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting || categoryUnavailable}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4.5" aria-hidden="true" />
          )}
          {isSubmitting
            ? uploadProgress === null
              ? "Đang tạo yêu cầu..."
              : `Đang tải lên ${uploadProgress}%`
            : "Gửi yêu cầu"}
        </button>
      </div>
    </form>
  );
}

export default TicketRequestForm;
