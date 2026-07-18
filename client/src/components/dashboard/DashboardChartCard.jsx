function DashboardChartCard({
  titleId,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
      aria-labelledby={titleId}
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2
          id={titleId}
          className="text-base font-semibold text-slate-900"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
      <div className="min-w-0 p-4 sm:p-6">{children}</div>
    </section>
  );
}

export default DashboardChartCard;
