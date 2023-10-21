// hook to add log to the log batch or optionally send immediately 

"use client"
import generateTimestamp from "../utils/generateTimestamp";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addLog } from "@/redux/store";

export default function useSaveLogToDB(optionalOnRenderLogMessage) {
  const dispatch = useDispatch();
  const initialLoadRef = useRef(true); // to prevent double logging on double invocation
  const sessionId = useSelector((state) => state.log.sessionId);

  // function for log sending
  // if immdiate === true message will be send to endpoint right away, 
  // otherway will be added to the log batch to send later by logging service
  function saveLogToDB(logMessage, immediate = false) {
    if (typeof window === undefined) return;

    const logAt = generateTimestamp();

    if (immediate) {
      fetch("/api/db/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logMessage: logMessage,
          sessionId: sessionId,
          logAt: logAt,
        }),
      });
    } else {
      dispatch(addLog({ message: logMessage, logAt: logAt }));
    }
  }
  // optional log on component render
  // can only be added to the log batch to prevent race condition
  useEffect(() => {
    if (optionalOnRenderLogMessage && initialLoadRef.current) {
      initialLoadRef.current = false;
      saveLogToDB(optionalOnRenderLogMessage, false);
    }
  }, []);

  return { saveLogToDB };
}
