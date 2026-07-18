import { useCallback, useEffect, useState } from "react";
import { getAdminDashboard } from "../services/dashboardService.js";

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
