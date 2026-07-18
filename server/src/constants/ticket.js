export const TICKET_PRIORITIES = Object.freeze([
  "low",
  "medium",
  "high",
  "urgent",
]);

export const TICKET_STATUSES = Object.freeze([
  "pending",
  "assigned",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
  "cancelled",
]);

export const TERMINAL_TICKET_STATUSES = Object.freeze([
  "resolved",
  "closed",
  "cancelled",
]);

export const USER_CANCELLABLE_STATUSES = Object.freeze([
  "pending",
  "assigned",
]);

export const TECHNICIAN_STATUS_TRANSITIONS = Object.freeze({
  assigned: Object.freeze(["in_progress"]),
  in_progress: Object.freeze(["waiting_user", "resolved"]),
  waiting_user: Object.freeze(["in_progress"]),
});

export function canTechnicianTransition(fromStatus, toStatus) {
  return Boolean(
    TECHNICIAN_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus),
  );
}
