import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();
  return <section className="flex min-h-[65vh] items-center justify-center"><div className="max-w-lg text-center"><span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-700"><SearchX className="size-9" /></span><p className="mt-6 text-sm font-bold tracking-widest text-blue-700">LỖI 404</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Không tìm thấy trang</h1><p className="mt-3 text-sm leading-6 text-slate-600">Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển khỏi hệ thống IT Helpdesk.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => navigate(-1)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"><ArrowLeft className="size-4" />Quay lại</button><Link to="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"><Home className="size-4" />Về trang chủ</Link></div></div></section>;
}
export default NotFoundPage;
