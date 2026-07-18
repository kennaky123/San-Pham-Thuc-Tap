function WorkspacePageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3 self-start sm:self-auto">{actions}</div> : null}
    </header>
  );
}

export default WorkspacePageHeader;
