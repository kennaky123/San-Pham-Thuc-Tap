import { CheckCircle2, Clock3, Image, ShieldCheck } from "lucide-react";
import TicketRequestForm from "../../components/ticket/create/TicketRequestForm.jsx";

const SUPPORT_TIPS = [
  {
    icon: CheckCircle2,
    title: "Mô tả đúng sự cố",
    description: "Nêu rõ thiết bị, phần mềm và thông báo lỗi nếu có.",
  },
  {
    icon: Image,
    title: "Đính kèm ảnh phù hợp",
    description: "Ảnh chụp lỗi giúp kỹ thuật viên xác định nguyên nhân nhanh hơn.",
  },
  {
    icon: ShieldCheck,
    title: "Không gửi dữ liệu nhạy cảm",
    description: "Che mật khẩu, mã OTP và thông tin riêng tư trước khi tải ảnh.",
  },
];

function CreateTicketPage() {
  return (
    <section aria-labelledby="create-ticket-title">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">
          Trung tâm hỗ trợ
        </p>
        <h1
          id="create-ticket-title"
          className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
        >
          Tạo yêu cầu hỗ trợ
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Cung cấp thông tin sự cố để bộ phận kỹ thuật tiếp nhận và hỗ trợ bạn
          nhanh chóng.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <TicketRequestForm />

        <aside className="space-y-4 xl:sticky xl:top-24" aria-label="Hướng dẫn tạo yêu cầu">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Clock3 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Lưu ý trước khi gửi</h2>
                <p className="mt-0.5 text-xs text-slate-500">Giúp yêu cầu được xử lý nhanh hơn</p>
              </div>
            </div>

            <ul className="mt-5 space-y-5">
              {SUPPORT_TIPS.map((tip) => {
                const Icon = tip.icon;

                return (
                  <li key={tip.title} className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-4.5 shrink-0 text-blue-600" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{tip.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{tip.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
            <p className="font-semibold">Sự cố khẩn cấp?</p>
            <p className="mt-1.5 text-xs leading-5 text-blue-800">
              Chọn mức “Khẩn cấp” khi hệ thống quan trọng ngừng hoạt động hoặc
              ảnh hưởng đến nhiều người dùng.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CreateTicketPage;
