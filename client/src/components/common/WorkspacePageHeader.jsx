function WorkspacePageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 bg-white rounded-2xl border border-brand-bone p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-brand-violet border border-purple-200 uppercase tracking-wider">
            {eyebrow}
          </span>
          <span className="text-xs text-brand-ash">• Đồng bộ trực tiếp</span>
        </div>
        <h1 className="font-display font-bold text-xl text-brand-onyx tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-brand-slate mt-0.5 max-w-3xl">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export default WorkspacePageHeader;
