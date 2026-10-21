import { useEffect } from "react";
import { clientEnv } from "../config/env.js";
import { getStoredAccessToken } from "../utils/authStorage.js";

export const REALTIME_DATA_EVENT = "it-helpdesk:data-changed";

function dispatchSseBlock(block) {
  const lines = block.split("\n");
  const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
  if (eventName !== "data-changed") return;
  const data = lines.filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
  let detail;
  try { detail = JSON.parse(data); } catch { return; }
  window.dispatchEvent(new CustomEvent(REALTIME_DATA_EVENT, { detail }));
}

function useRealtimeUpdates() {
  useEffect(() => {
    const controller = new AbortController();
    let reconnectTimer;
    let stopped = false;

    async function connect() {
      while (!stopped) {
        try {
          const token = getStoredAccessToken();
          if (!token) return;
          const response = await fetch(`${clientEnv.apiUrl}/events`, {
            headers: { Accept: "text/event-stream", Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          if (!response.ok || !response.body) throw new Error("Không thể kết nối kênh cập nhật.");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (!stopped) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
            const blocks = buffer.split("\n\n");
            buffer = blocks.pop() ?? "";
            blocks.forEach(dispatchSseBlock);
          }
        } catch (error) {
          if (error.name === "AbortError") return;
        }

        if (!stopped) {
          await new Promise((resolve) => { reconnectTimer = window.setTimeout(resolve, 3_000); });
        }
      }
    }

    connect();
    return () => {
      stopped = true;
      controller.abort();
      window.clearTimeout(reconnectTimer);
    };
  }, []);
}

export default useRealtimeUpdates;
