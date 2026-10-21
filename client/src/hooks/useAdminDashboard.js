import { useCallback, useEffect, useState } from "react";
import { getAdminDashboard } from "../services/dashboardService.js";
import { REALTIME_DATA_EVENT } from "./useRealtimeUpdates.js";

const INITIAL_STATE = {
  data: null,
  error: null,
  isLoading: true,
  isRefreshing: false,
};

function useAdminDashboard() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    const abortController = new AbortController();

    getAdminDashboard({ signal: abortController.signal })
      .then((data) => {
        setState({
          data,
          error: null,
          isLoading: false,
          isRefreshing: false,
        });
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") {
          return;
        }

        setState((currentState) => ({
          ...currentState,
          error,
          isLoading: false,
          isRefreshing: false,
        }));
      });

    return () => {
      abortController.abort();
    };
  }, [requestVersion]);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setRequestVersion((currentVersion) => currentVersion + 1);
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

  const refetch = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: currentState.data === null,
      isRefreshing: currentState.data !== null,
    }));
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    ...state,
    refetch,
  };
}

export default useAdminDashboard;
