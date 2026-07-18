function WorkspaceStatCard({ icon: Icon, label, value, description, tone = "blue" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700", red: "bg-red-50 text-red-700" };
  return (
    <article className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tones[tone] ?? tones.blue}`}><Icon className="size-5" aria-hidden="true" /></span></div>
    </article>
  );
}

export default WorkspaceStatCard;
