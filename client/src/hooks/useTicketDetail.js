import { useCallback, useEffect, useState } from "react";
import {
  getTicketComments,
  getTicketDetail,
  getTicketHistory,
} from "../services/ticketService.js";

function useTicketDetail(ticketId) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    ticket: null,
    ticketError: null,
    comments: null,
    commentsError: null,
    history: null,
    historyError: null,
    settledTicketKey: null,
    settledCommentsKey: null,
    settledHistoryKey: null,
  });
  const requestKey = `${ticketId}:${requestVersion}`;

  useEffect(() => {
    const abortController = new AbortController();
    const options = { signal: abortController.signal };

    getTicketDetail(ticketId, options)
      .then((ticket) => {
        setState((currentState) => ({
          ...currentState,
          ticket,
          ticketError: null,
          settledTicketKey: requestKey,
        }));
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setState((currentState) => ({
            ...currentState,
            ticket: null,
            ticketError: error,
            settledTicketKey: requestKey,
          }));
        }
      });

    getTicketComments(ticketId, options)
      .then((comments) => {
        setState((currentState) => ({
          ...currentState,
          comments,
          commentsError: null,
          settledCommentsKey: requestKey,
        }));
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setState((currentState) => ({
            ...currentState,
            comments: null,
            commentsError: error,
            settledCommentsKey: requestKey,
          }));
        }
      });

    getTicketHistory(ticketId, options)
      .then((history) => {
        setState((currentState) => ({
          ...currentState,
          history,
          historyError: null,
          settledHistoryKey: requestKey,
        }));
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          setState((currentState) => ({
            ...currentState,
            history: null,
            historyError: error,
            settledHistoryKey: requestKey,
          }));
        }
      });

    return () => abortController.abort();
  }, [requestKey, ticketId]);

  const refetch = useCallback(() => {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }, []);

  return {
    ticket: state.ticket,
    ticketError: state.ticketError,
    comments: state.comments,
    commentsError: state.commentsError,
    history: state.history,
    historyError: state.historyError,
    isTicketLoading: state.settledTicketKey !== requestKey,
    areCommentsLoading: state.settledCommentsKey !== requestKey,
    isHistoryLoading: state.settledHistoryKey !== requestKey,
    refetch,
  };
}

export default useTicketDetail;
