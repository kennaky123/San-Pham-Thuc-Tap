const TONE_CLASSES = {
  blue: {
    icon: "bg-blue-50 text-blue-700",
    accent: "bg-blue-500",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700",
    accent: "bg-amber-500",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700",
    accent: "bg-violet-500",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-700",
    accent: "bg-emerald-500",
  },
};

function DashboardStatCard({ icon: Icon, label, value, description, tone }) {
  const toneClasses = TONE_CLASSES[tone] ?? TONE_CLASSES.blue;

  return (
    <article className="relative min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`absolute inset-y-0 left-0 w-1 ${toneClasses.accent}`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${toneClasses.icon}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export default DashboardStatCard;
