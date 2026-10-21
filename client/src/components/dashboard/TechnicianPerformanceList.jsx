import { UsersRound } from "lucide-react";
import {
  formatDashboardNumber,
  getNameInitials,
} from "../../utils/dashboardFormatters.js";

function TechnicianPerformanceList({ technicians }) {
  const maximumValue = Math.max(
    1,
    ...technicians.flatMap((item) => [item.inProgress, item.completed]),
  );

  return (
    <section
      className="min-w-0 overflow-hidden rounded-xl border border-brand-bone bg-white shadow-xs"
      aria-labelledby="technician-performance-title"
    >
      <div className="border-b border-brand-bone px-5 py-4">
        <h2
          id="technician-performance-title"
          className="font-display text-sm font-bold text-brand-ink"
        >
          Hiệu Suất Đội Ngũ Kỹ Thuật (dim_agent)
        </h2>
        <p className="mt-0.5 text-xs text-brand-slate">
          So sánh khối lượng đang xử lý và đã hoàn tất SLA
        </p>
      </div>

      {technicians.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-mist text-brand-ash">
            <UsersRound className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-brand-ink">
            Chưa có kỹ thuật viên
          </p>
          <p className="mt-1 text-xs leading-5 text-brand-slate">
            Hiệu suất sẽ được hiển thị khi hệ thống có nhân viên kỹ thuật.
          </p>
        </div>
      ) : (
        <ul className="custom-scrollbar max-h-[32rem] divide-y divide-brand-bone overflow-y-auto">
          {technicians.map((technician) => {
            const inProgressWidth =
              (technician.inProgress / maximumValue) * 100;
            const completedWidth = (technician.completed / maximumValue) * 100;

            return (
              <li key={technician.technicianId} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-violet text-xs font-bold text-white">
                    {getNameInitials(technician.name)}
                  </span>
                  <p className="min-w-0 truncate text-sm font-bold text-brand-ink">
                    {technician.name}
                  </p>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="text-brand-slate">Đang xử lý</span>
                      <span className="font-mono font-bold text-brand-violet">
                        {formatDashboardNumber(technician.inProgress)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-mist">
                      <div
                        className="h-full rounded-full bg-brand-violet"
                        style={{ width: `${inProgressWidth}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="text-brand-slate">Đã hoàn thành</span>
                      <span className="font-mono font-bold text-brand-emerald">
                        {formatDashboardNumber(technician.completed)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-mist">
                      <div
                        className="h-full rounded-full bg-brand-emerald"
                        style={{ width: `${completedWidth}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default TechnicianPerformanceList;
