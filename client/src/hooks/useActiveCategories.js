import { useCallback, useEffect, useState } from "react";
import { getActiveCategories } from "../services/categoryService.js";

function useActiveCategories() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    data: null,
    error: null,
    settledRequestVersion: null,
  });

  useEffect(() => {
    const abortController = new AbortController();

    getActiveCategories({ signal: abortController.signal })
      .then((data) => {
        setState({
          data,
          error: null,
          settledRequestVersion: requestVersion,
        });
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") {
          return;
        }

        setState({
          data: null,
          error,
          settledRequestVersion: requestVersion,
        });
      });

    return () => abortController.abort();
  }, [requestVersion]);

  const refetch = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    categories: state.data ?? [],
    error: state.error,
    isLoading: state.settledRequestVersion !== requestVersion,
    refetch,
  };
}

export default useActiveCategories;
