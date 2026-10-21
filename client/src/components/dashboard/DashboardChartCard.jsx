function DashboardChartCard({
  titleId,
  title,
  description,
  badge,
  children,
  className = "",
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-brand-bone bg-white p-5 shadow-xs ${className}`}
      aria-labelledby={titleId}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2
            id={titleId}
            className="font-display font-bold text-sm text-brand-onyx"
          >
            {title}
          </h2>
          <p className="text-xs text-brand-slate mt-0.5">{description}</p>
        </div>
        {badge ? (
          <span className="text-[11px] font-mono bg-brand-mist px-2 py-0.5 rounded border border-brand-bone text-brand-slate shrink-0">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default DashboardChartCard;
