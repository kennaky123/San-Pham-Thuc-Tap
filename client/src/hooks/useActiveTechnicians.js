import { useCallback, useEffect, useState } from "react";
import { getActiveTechnicians } from "../services/userService.js";

function useActiveTechnicians(enabled) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    technicians: [],
    error: null,
    settledRequestKey: null,
  });
  const requestKey = enabled ? String(requestVersion) : "disabled";

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const abortController = new AbortController();

    getActiveTechnicians({ signal: abortController.signal })
      .then((technicians) => {
        setState({ technicians, error: null, settledRequestKey: requestKey });
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setState({ technicians: [], error, settledRequestKey: requestKey });
        }
      });

    return () => abortController.abort();
  }, [enabled, requestKey]);

  const refetch = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    technicians: state.technicians,
    error: state.error,
    isLoading: enabled && state.settledRequestKey !== requestKey,
    refetch,
  };
}

export default useActiveTechnicians;
