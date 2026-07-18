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
      className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      aria-labelledby="technician-performance-title"
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2
          id="technician-performance-title"
          className="text-base font-semibold text-slate-900"
        >
          Hiệu suất technician
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ticket đang xử lý và đã hoàn thành
        </p>
      </div>

      {technicians.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <UsersRound className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-700">
            Chưa có technician
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Hiệu suất sẽ được hiển thị khi hệ thống có nhân viên kỹ thuật.
          </p>
        </div>
      ) : (
        <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
          {technicians.map((technician) => {
            const inProgressWidth =
              (technician.inProgress / maximumValue) * 100;
            const completedWidth = (technician.completed / maximumValue) * 100;

            return (
              <li key={technician.technicianId} className="px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {getNameInitials(technician.name)}
                  </span>
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                    {technician.name}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-500">Đang xử lý</span>
                      <span className="font-semibold text-violet-700">
                        {formatDashboardNumber(technician.inProgress)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${inProgressWidth}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-500">Đã hoàn thành</span>
                      <span className="font-semibold text-emerald-700">
                        {formatDashboardNumber(technician.completed)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
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
