import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTicketFilterOptions,
  getTicketList,
} from "../services/ticketService.js";

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

  const refetch = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.settledRequestKey !== requestKey,
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
