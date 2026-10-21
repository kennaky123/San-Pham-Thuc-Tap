import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTicketFilterOptions,
  getTicketList,
} from "../services/ticketService.js";
import { REALTIME_DATA_EVENT } from "./useRealtimeUpdates.js";

function useTicketList(query) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    data: null,
    error: null,
    settledRequestKey: null,
  });
  const queryKey = useMemo(
    () =>
      [
        query.search,
        query.status,
        query.statuses,
        query.priority,
        query.category,
        query.technician,
        query.sortOrder,
        query.page,
        query.limit,
      ].join("|"),
    [query],
  );
  const requestKey = `${queryKey}|${requestVersion}`;

  useEffect(() => {
    const abortController = new AbortController();

    getTicketList(query, { signal: abortController.signal })
      .then((data) => {
        setState({ data, error: null, settledRequestKey: requestKey });
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") {
          return;
        }

        setState({ data: null, error, settledRequestKey: requestKey });
      });

    return () => abortController.abort();
  }, [query, requestKey]);

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
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    data: state.data,
    error: state.error,
    isLoading: !state.data && state.settledRequestKey !== requestKey,
    isRefreshing: Boolean(state.data) && state.settledRequestKey !== requestKey,
    refetch,
  };
}

export function useTicketFilterOptions() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    data: null,
    error: null,
    settledRequestVersion: null,
  });

  useEffect(() => {
    const abortController = new AbortController();

    getTicketFilterOptions({ signal: abortController.signal })
      .then((data) => {
        setState({ data, error: null, settledRequestVersion: requestVersion });
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") {
          return;
        }

        setState({ data: null, error, settledRequestVersion: requestVersion });
      });

    return () => abortController.abort();
  }, [requestVersion]);

  const refetch = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.settledRequestVersion !== requestVersion,
    refetch,
  };
}

export default useTicketList;
