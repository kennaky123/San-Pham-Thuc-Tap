import {
  Edit3,
  FolderCheck,
  FolderX,
  Plus,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import WorkspacePageHeader from "../../components/common/WorkspacePageHeader.jsx";
import WorkspaceStatCard from "../../components/common/WorkspaceStatCard.jsx";
import { REALTIME_DATA_EVENT } from "../../hooks/useRealtimeUpdates.js";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getAdminErrorMessage,
  updateAdminCategory,
} from "../../services/adminService.js";
import { normalizeSearch } from "../../utils/adminUserFormatters.js";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", active: true });
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async (options = {}) => {
    setCategories(await getAdminCategories(options));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getAdminCategories({ signal: controller.signal })
      .then(setCategories)
      .catch((error) => {
        if (error.code !== "ERR_CANCELED")
          toast.error(getAdminErrorMessage(error));
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) loadCategories().catch(() => {});
    };
    const intervalId = window.setInterval(refresh, 10_000);
    window.addEventListener(REALTIME_DATA_EVENT, refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(REALTIME_DATA_EVENT, refresh);
    };
  }, [loadCategories]);

  const filtered = useMemo(
    () =>
      categories.filter((item) =>
        normalizeSearch(`${item.name} ${item.description}`).includes(
          normalizeSearch(search),
        ),
      ),
    [categories, search],
  );

  function openForm(category) {
    setEditing(category || { id: null });
    setForm(
      category
        ? {
            name: category.name,
            description: category.description,
            active: category.active,
          }
        : { name: "", description: "", active: true },
    );
  }

  async function save(event) {
    event.preventDefault();
    if (form.name.trim().length < 2)
      return toast.error("Tên danh mục phải có ít nhất 2 ký tự.");
    setSaving(true);
    try {
      const saved = editing.id
        ? await updateAdminCategory(editing.id, form)
        : await createAdminCategory(form);
      setCategories((items) =>
        editing.id
          ? items.map((item) => (item.id === saved.id ? saved : item))
          : [...items, saved],
      );
      setEditing(null);
      toast.success(
        editing.id ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới.",
      );
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(item) {
    try {
      const saved = await updateAdminCategory(item.id, {
        ...item,
        active: !item.active,
      });
      setCategories((items) =>
        items.map((category) => (category.id === saved.id ? saved : category)),
      );
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    }
  }

  async function removeCategory(item) {
    if (item.tickets > 0)
      return toast.warning(
        "Không thể xóa danh mục đã có ticket. Hãy tạm ẩn danh mục.",
      );
    try {
      await deleteAdminCategory(item.id);
      setCategories((items) =>
        items.filter((category) => category.id !== item.id),
      );
      toast.success("Đã xóa danh mục khỏi hệ thống.");
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    }
  }

  return (
    <section>
      <WorkspacePageHeader
        eyebrow="Quản trị phân loại dịch vụ CNTT"
        title="Danh mục sự cố (Service Catalog)"
        description="Thiết lập nhóm sự cố để tự động định tuyến ticket và áp dụng chính sách SLA tương ứng."
        actions={
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-ink px-4 text-xs font-semibold text-white transition hover:bg-brand-carbon"
          >
            <Plus className="size-4" />
            Thêm danh mục
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <WorkspaceStatCard
          icon={Tags}
          label="Tổng danh mục"
          value={categories.length}
          description="Nhóm sự cố trong hệ thống"
        />
        <WorkspaceStatCard
          icon={FolderCheck}
          label="Đang sử dụng"
          value={categories.filter((item) => item.active).length}
          description="Hiển thị khi tạo ticket"
          tone="emerald"
        />
        <WorkspaceStatCard
          icon={FolderX}
          label="Tạm ẩn"
          value={categories.filter((item) => !item.active).length}
          description="Không nhận ticket mới"
          tone="amber"
        />
      </div>

      {editing ? (
        <form
          onSubmit={save}
          className="mt-6 rounded-xl border border-brand-violet/30 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-brand-ink">
              {editing.id ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <button
              type="button"
              disabled={saving}
              onClick={() => setEditing(null)}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-brand-mist"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-[18rem_1fr_auto]">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tên danh mục"
              className="rounded-lg border border-brand-bone bg-brand-mist px-3 py-2 text-xs font-medium text-brand-ink outline-none focus:border-brand-violet focus:bg-white"
            />
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Mô tả phạm vi sự cố"
              className="rounded-lg border border-brand-bone bg-brand-mist px-3 py-2 text-xs font-medium text-brand-ink outline-none focus:border-brand-violet focus:bg-white"
            />
            <button
              disabled={saving}
              className="rounded-lg bg-brand-violet px-4 py-2 text-xs font-semibold text-white hover:bg-brand-violet/90 disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : editing.id ? "Lưu thay đổi" : "Thêm mới"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 rounded-xl border border-brand-bone bg-white p-3.5 shadow-xs">
        <label className="relative block max-w-xl">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-ash" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="w-full rounded-lg border border-brand-bone bg-brand-mist py-2 pr-3 pl-10 text-xs font-medium text-brand-ink outline-none focus:border-brand-violet focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[50rem] text-left">
            <thead className="border-b border-brand-bone bg-brand-mist/70 text-[11px] font-bold tracking-wider text-brand-slate uppercase">
              <tr>
                <th className="px-5 py-3">Danh mục</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3 text-center">Số ticket</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bone text-xs">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-brand-violet/[0.03]"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-violet/10 text-xs font-bold text-brand-violet">
                        {item.icon}
                      </span>
                      <span className="font-semibold text-brand-ink">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-md px-4 py-3.5 text-brand-slate">
                    {item.description}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-brand-ink">
                    {item.tickets}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleCategory(item)}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        item.active
                          ? "border border-emerald-200 bg-emerald-50 text-brand-emerald"
                          : "border border-brand-bone bg-brand-mist text-brand-slate"
                      }`}
                    >
                      {item.active ? "Đang sử dụng" : "Tạm ẩn"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openForm(item)}
                        className="flex size-8 items-center justify-center rounded-lg text-brand-slate hover:bg-brand-mist hover:text-brand-ink"
                        aria-label={`Sửa ${item.name}`}
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCategory(item)}
                        className="flex size-8 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                        aria-label={`Xóa ${item.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="divide-y divide-brand-bone md:hidden">
          {filtered.map((item) => (
            <li key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-violet/10 text-xs font-bold text-brand-violet">
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-brand-ink">
                    {item.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-brand-slate">
                    {item.description}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-brand-ink">
                      {item.tickets} ticket
                    </span>
                    <button
                      type="button"
                      onClick={() => openForm(item)}
                      className="text-xs font-semibold text-brand-violet"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default AdminCategoriesPage;
