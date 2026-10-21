import { subscribeToRealtimeEvents } from "../services/realtimeService.js";

export function getRealtimeEvents(request, response) {
  subscribeToRealtimeEvents(request, response);
}
