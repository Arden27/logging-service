import { sliceLogs } from "@/redux/store";

const defaultInterval = 10000;

export function startLoggingService(store, interval = defaultInterval) {
  //prevent run on server
  if (typeof window === "undefined") {
    return;
  }

  // check for new logs in redux with selected interval
  // send logs to server endpoint
  // remove sent logs from redux state
  setInterval(() => {
    // get logs from redux state
    const currentLogs = store.getState().log.logs;
    if (currentLogs.length > 0) {
      // Send logs to the backend
      fetch("/api/db/batchLog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: store.getState().log.sessionId,
          logs: currentLogs,
        }),
      }).then((response) => {
        // is successfully sent - remove logs form log queue
        if (response.ok) {
          store.dispatch(sliceLogs(currentLogs.length));
        }
      });
    }
  }, interval);
}
