const subscribers = new Set();

export function publishDataChanged(resource = "system", extra = {}) {
  const payload = JSON.stringify({
    resource,
    occurredAt: new Date().toISOString(),
    ...extra,
  });
  for (const response of subscribers) {
    response.write(`event: data-changed\ndata: ${payload}\n\n`);
  }
}

export function subscribeToRealtimeEvents(request, response) {
  response.status(200);
  response.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "private, no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.flushHeaders();
  response.write(`event: connected\ndata: {"connected":true}\n\n`);
  subscribers.add(response);

  const heartbeat = setInterval(() => response.write(": heartbeat\n\n"), 25_000);
  request.on("close", () => {
    clearInterval(heartbeat);
    subscribers.delete(response);
  });
}
