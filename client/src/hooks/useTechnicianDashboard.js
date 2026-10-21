import { useCallback, useEffect, useState } from "react";
import { getTechnicianDashboard } from "../services/dashboardService.js";
import { REALTIME_DATA_EVENT } from "./useRealtimeUpdates.js";

function useTechnicianDashboard() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    getTechnicianDashboard({ signal: controller.signal })
      .then((data) => setState({ data, error: null, isLoading: false }))
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setState({ data: null, error, isLoading: false });
        }
      });

    return () => controller.abort();
  }, [requestVersion]);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setRequestVersion((current) => current + 1);
    };
    const intervalId = window.setInterval(refresh, 10_000);
    window.addEventListener("focus", refresh);
    window.addEventListener(REALTIME_DATA_EVENT, refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(REALTIME_DATA_EVENT, refresh);
    };
  }, []);

  return {
    ...state,
    refetch: useCallback(() => {
      setState((current) => ({ ...current, error: null, isLoading: true }));
      setRequestVersion((current) => current + 1);
    }, []),
  };
}

export default useTechnicianDashboard;
