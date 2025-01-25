import { useEffect, useRef, useCallback, useContext } from "react";
import { BACKENDPORT } from "../utils/fetchWrapper";
import AuthContext from "../context/AuthContext";

const useWebSocket = (
  uri,
  {
    reconnectInterval = 2000,
    maxReconnectAttempts = 10,
    onOpen,
    onMessage,
    onError,
    onClose,
    debug = false,
  } = {},
) => {
  const websocketRef = useRef(null);
  const messageHandlers = useRef([]);
  const messageQueue = useRef([]);
  const connectedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const intentiallyClosedRef = useRef(false);
  const authContextData = useContext(AuthContext);

  const debugLog = (...args) => {
    if (debug) console.log("[WebSocket Hook]", ...args);
  };

  const addMessageHandler = (handler) => {
    messageHandlers.current.push(handler);
  };

  const removeMessageHandler = (handler) => {
    messageHandlers.current = messageHandlers.current.filter(
      (h) => h !== handler,
    );
  };

  const connect = useCallback(() => {
    if (connectedRef.current) return;
    const url = `wss://${window.location.hostname}:${BACKENDPORT}/${uri}`;
    debugLog(`Connecting to WebSocket at ${url}`);

    const ws = new WebSocket(url);
    websocketRef.current = ws;

    ws.onopen = (event) => {
      debugLog("WebSocket connection established");
      reconnectAttemptsRef.current = 0;
      connectedRef.current = true;

      if (messageQueue.current.length > 0) {
        debugLog("Flushing message queue", messageQueue.current);
        messageQueue.current.forEach((msg) => ws.send(msg));
        messageQueue.current = [];
      }

      onOpen?.(event);
    };

    ws.onmessage = (event) => {
      debugLog("Message received:", event.data);

      onMessage?.(event);
      messageHandlers.current.forEach((handler) => handler(event));
    };

    ws.onerror = (event) => {
      debugLog("WebSocket error:", event);

      onError?.(event);
    };

    ws.onclose = (event) => {
      debugLog("WebSocket connection closed", event);

      if (
        !intentiallyClosedRef.current &&
        !event.wasClean &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        debugLog("Attempting to reconnect...");
        reconnectAttemptsRef.current += 1;
        setTimeout(connect, reconnectInterval);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        debugLog("Max reconnect attempts reached");
      } else {
        debugLog(
          "WebSocket closed cleanly or intentionally, no reconnection will be attempted.",
        );
      }

      if (intentiallyClosedRef.current) intentiallyClosedRef.current = false;

      onClose?.(event);
    };
  }, [
    uri,
    reconnectInterval,
    maxReconnectAttempts,
    onOpen,
    onMessage,
    onError,
    onClose,
    debug,
  ]);

  useEffect(() => {
    if (authContextData.isUserLoggedIn) connect();

    return () => {
      debugLog("Cleaning up WebSocket");
      websocketRef.current?.close();
    };
  }, [authContextData.isUserLoggedIn]);

  const send = useCallback((message) => {
    if (
      connectedRef.current &&
      websocketRef.current?.readyState === WebSocket.OPEN
    ) {
      debugLog("Sending message:", message);
      websocketRef.current.send(message);
    } else {
      debugLog("Socket not connected, queuing message:", message);
      messageQueue.current.push(message);
    }
  }, []);

  const close = useCallback(() => {
    debugLog("Closing WebSocket connection");
    intentiallyClosedRef.current = true;
    websocketRef.current?.close();
  }, []);

  return { send, close, addMessageHandler, removeMessageHandler };
};

export default useWebSocket;
