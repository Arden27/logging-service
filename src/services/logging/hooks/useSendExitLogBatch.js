// Hook for sending a "fire-and-forget" log to the server when the user closes the
// page/browser or navigates to another page. This hook should be added at the root page of the app.

import { useEffect, useRef } from "react";
import generateTimestamp from "../utils/generateTimestamp";
import { useSelector } from "react-redux";

export default function useSendExitLogBatch(onExitMessage) {
  // Ensure we are on the client side (used for server-side rendered applications)
  if (typeof window === "undefined") return;

  const sessionId = useSelector((state) => state.log.sessionId);
  const logs = useSelector((state) => state.log.logs);
  const sessionIdRef = useRef(null);

  // Use a ref with useEffect to set sessionId. This ensures that we capture the most recent
  // sessionId even if the Redux update happens after the hook's initialization.
  useEffect(() => {
    if (sessionId !== null && sessionId !== undefined) {
      sessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  // Send a log when the user is about to leave the page
  useEffect(() => {
    function sendUserLeftLogBatch() {
      const logAt = generateTimestamp();
      const dataLogs = [...logs];

      // Conditionally add the onExitMessage if it's provided
      if (onExitMessage) {
        dataLogs.push({
          logMessage: onExitMessage,
          logAt: logAt,
        });
      }

      const data = {
        sessionId: sessionIdRef.current,
        logs: dataLogs,
      };

      // The navigator.sendBeacon by default sends text/plain;charset=UTF-8.
      // By wrapping the data in a Blob and specifying the MIME type as application/json,
      // we explicitly set the content type to be JSON. This way, the server knows how to interpret the incoming data correctly.
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });

      // Use navigator.sendBeacon for a fire-and-forget log
      navigator.sendBeacon("/api/db/batchLog", blob);
    }

    // Add an event listener for the "beforeunload" event to detect when the user is about to leave the page.
    window.addEventListener("beforeunload", sendUserLeftLogBatch);

    // Cleanup the event listener when the component is unmounted.
    return () =>
      window.removeEventListener("beforeunload", sendUserLeftLogBatch);
  }, [logs]);
}
