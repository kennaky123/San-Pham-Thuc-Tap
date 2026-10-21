function WorkspaceStatCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "blue",
}) {
  const tones = {
    blue: "bg-blue-50 text-brand-blue",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-purple-50 text-brand-violet",
    red: "bg-red-50 text-red-600",
  };

  return (
    <article className="bg-white p-5 rounded-2xl border border-brand-bone shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-brand-slate">{label}</span>
        <span
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            tones[tone] ?? tones.blue
          }`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
      <div className="text-2xl font-display font-extrabold text-brand-onyx">
        {value}
      </div>
      <div className="text-[11px] text-brand-slate mt-1">{description}</div>
    </article>
  );
}

export default WorkspaceStatCard;
