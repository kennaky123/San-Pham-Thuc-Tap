import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Cpu, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNavigationForRole } from "../../constants/navigation.js";
import { KB_ARTICLES, NETWORK_NODES } from "../../data/itsmData.js";
import useAuth from "../../hooks/useAuth.js";

function CommandMenuModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(timer);
  }, [open]);

  function handleClose() {
    setQuery("");
    onClose();
  }

  const navItems = useMemo(
    () => getNavigationForRole(user?.role),
    [user?.role],
  );

  const filteredNav = useMemo(() => {
    const q = query.toLowerCase().trim();
    return navItems.filter(
      (item) => !q || item.label.toLowerCase().includes(q),
    );
  }, [navItems, query]);

  const filteredNodes = useMemo(() => {
    const q = query.toLowerCase().trim();
    return Object.values(NETWORK_NODES).filter(
      (n) =>
        !q ||
        n.name.toLowerCase().includes(q) ||
        n.ip.toLowerCase().includes(q) ||
        n.model.toLowerCase().includes(q),
    );
  }, [query]);

  const filteredKb = useMemo(() => {
    const q = query.toLowerCase().trim();
    return KB_ARTICLES.filter(
      (kb) =>
        !q ||
        kb.title.toLowerCase().includes(q) ||
        kb.category.toLowerCase().includes(q),
    );
  }, [query]);

  if (!open) return null;

  function handleSelectPath(path) {
    handleClose();
    navigate(path);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={handleClose}
        aria-label="Đóng thanh tìm kiếm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm nhanh toàn cục"
        className="relative bg-white rounded-2xl border border-brand-bone w-full max-w-xl shadow-2xl overflow-hidden z-10"
      >
        <div className="p-3.5 border-b border-brand-bone flex items-center gap-3">
          <Search className="w-4 h-4 text-brand-ash ml-1.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ để tìm nhanh trang, thiết bị mạng, IP switch, cẩm nang..."
            className="w-full text-xs text-brand-ink focus:outline-none placeholder:text-brand-ash"
          />
          <button
            type="button"
            onClick={handleClose}
            className="px-1.5 py-0.5 text-[10px] font-mono bg-brand-mist border border-brand-bone rounded text-brand-ash hover:text-brand-ink"
          >
            ESC
          </button>
        </div>

        <div className="max-h-88 overflow-y-auto p-2 divide-y divide-brand-bone/50 text-xs">
          {filteredNav.length > 0 ? (
            <div className="py-1.5">
              <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-ash">
                Điều hướng nhanh
              </div>
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSelectPath(item.path)}
                  className="w-full p-2 hover:bg-brand-mist rounded-lg cursor-pointer flex items-center justify-between text-left transition-colors"
                >
                  <span className="font-medium text-brand-ink flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-brand-violet shrink-0" />
                    {item.label}
                  </span>
                  <span className="text-[10px] text-brand-ash font-mono">
                    Mở trang
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {filteredNodes.length > 0 ? (
            <div className="py-1.5">
              <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-ash">
                Thiết bị hạ tầng mạng (Topology)
              </div>
              {filteredNodes.slice(0, 4).map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleSelectPath("/topology")}
                  className="w-full p-2 hover:bg-brand-mist rounded-lg cursor-pointer flex items-center justify-between text-left transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-brand-ink flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                      <span className="truncate">{node.name}</span>
                    </div>
                    <div className="text-[10px] text-brand-ash font-mono pl-5">
                      {node.model} • {node.ip}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      node.status === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {node.status === "warning" ? "Cảnh báo" : "Online"}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {filteredKb.length > 0 ? (
            <div className="py-1.5">
              <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-ash">
                Cẩm nang tự phục vụ (Knowledge Base)
              </div>
              {filteredKb.map((kb) => (
                <button
                  key={kb.id}
                  type="button"
                  onClick={() =>
                    handleSelectPath(
                      user?.role === "user" ? "/user/overview" : "/topology",
                    )
                  }
                  className="w-full p-2 hover:bg-brand-mist rounded-lg cursor-pointer flex items-center justify-between text-left transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-brand-ink flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{kb.title}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-mist border border-brand-bone text-brand-slate shrink-0">
                    {kb.category}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CommandMenuModal;
