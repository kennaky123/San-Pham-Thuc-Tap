import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const TICKET_STATUSES = new Set([
  "pending",
  "assigned",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
  "cancelled",
]);
const TICKET_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const FILTER_FIELDS = new Set([
  "search",
  "status",
  "priority",
  "category",
  "technician",
  "sortOrder",
]);
const PAGE_SIZE = 10;

function normalizeSearch(value) {
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

function normalizePage(value) {
  if (!/^\d+$/.test(value ?? "")) {
    return 1;
  }

  const page = Number.parseInt(value, 10);
  return Number.isSafeInteger(page) && page >= 1 && page <= 1_000_000
    ? page
    : 1;
}

function parseTicketQuery(searchParams) {
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const category = searchParams.get("category") ?? "";
  const technician = searchParams.get("technician") ?? "";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  return {
    search: normalizeSearch(searchParams.get("search") ?? ""),
    status: TICKET_STATUSES.has(status) ? status : "",
    priority: TICKET_PRIORITIES.has(priority) ? priority : "",
    category: OBJECT_ID_PATTERN.test(category) ? category : "",
    technician: OBJECT_ID_PATTERN.test(technician) ? technician : "",
    sortOrder,
    page: normalizePage(searchParams.get("page")),
    limit: PAGE_SIZE,
  };
}

function useTicketListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const query = useMemo(
    () => parseTicketQuery(new URLSearchParams(searchParamsKey)),
    [searchParamsKey],
  );

  const setFilter = useCallback(
    (field, rawValue) => {
      if (!FILTER_FIELDS.has(field)) {
        return;
      }

      const value = field === "search" ? normalizeSearch(rawValue) : rawValue;

      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        if (!value || (field === "sortOrder" && value === "desc")) {
          nextParams.delete(field);
        } else {
          nextParams.set(field, value);
        }

        nextParams.delete("page");
        nextParams.delete("limit");
        return nextParams;
      });
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (page) => {
      if (!Number.isInteger(page) || page < 1) {
        return;
      }

      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        if (page === 1) {
          nextParams.delete("page");
        } else {
          nextParams.set("page", String(page));
        }

        nextParams.delete("limit");
        return nextParams;
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const activeFilterCount = [
    query.search,
    query.status,
    query.priority,
    query.category,
    query.technician,
  ].filter(Boolean).length;

  return {
    query,
    setFilter,
    setPage,
    resetFilters,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0 || query.sortOrder !== "desc",
  };
}

export default useTicketListQuery;
