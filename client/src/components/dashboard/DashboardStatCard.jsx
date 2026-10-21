const TONE_CLASSES = {
  blue: {
    icon: "bg-blue-50 text-brand-blue",
    badge: "text-brand-blue",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    badge: "text-amber-600",
  },
  violet: {
    icon: "bg-purple-50 text-brand-violet",
    badge: "text-brand-violet",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    badge: "text-emerald-600",
  },
};

function DashboardStatCard({ icon: Icon, label, value, description, tone }) {
  const toneClasses = TONE_CLASSES[tone] ?? TONE_CLASSES.blue;

  return (
    <article className="bg-white p-5 rounded-2xl border border-brand-bone shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-brand-slate">{label}</span>
        <span
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${toneClasses.icon}`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
      <div className="text-2xl font-display font-extrabold text-brand-onyx">
        {value}
      </div>
      <div className={`text-[11px] font-medium mt-1 ${toneClasses.badge}`}>
        {description}
      </div>
    </article>
  );
}

export default DashboardStatCard;
