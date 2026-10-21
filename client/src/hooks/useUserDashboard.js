import { useCallback, useEffect, useState } from "react";
import { getUserDashboard } from "../services/dashboardService.js";
import { REALTIME_DATA_EVENT } from "./useRealtimeUpdates.js";

const REFRESH_INTERVAL_MS = 10_000;

function useUserDashboard() {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ data: null, error: null, settledVersion: null });

  useEffect(() => {
    const controller = new AbortController();
    getUserDashboard({ signal: controller.signal })
      .then((data) => setState({ data, error: null, settledVersion: version }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setState((current) => ({ ...current, error, settledVersion: version }));
        }
      });
    return () => controller.abort();
  }, [version]);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setVersion((current) => current + 1);
    };
    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refresh);
    window.addEventListener(REALTIME_DATA_EVENT, refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(REALTIME_DATA_EVENT, refresh);
    };
  }, []);

  const refetch = useCallback(() => setVersion((current) => current + 1), []);
  return {
    data: state.data,
    error: state.error,
    isLoading: !state.data && state.settledVersion !== version,
    isRefreshing: Boolean(state.data) && state.settledVersion !== version,
    refetch,
  };
}

export default useUserDashboard;
