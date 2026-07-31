// hooks/useSocketEvents.js
import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-hot-toast";

// Socket event name -> eventHandlers key. Defined once, outside the hook,
// so it's never recreated.
const EVENT_KEY_MAP = {
  "call-log-created": "onCallLogCreated",
  "call-log-updated": "onCallLogUpdated",
  "call-log-deleted": "onCallLogDeleted",
  "call-status-changed": "onCallStatusChanged",
  "sales-call-created": "onSalesCallCreated",
  "sales-call-updated": "onSalesCallUpdated",
  "sales-call-deleted": "onSalesCallDeleted",
  "sales-call-status-changed": "onSalesCallStatusChanged",
  "sales-call-assigned": "onSalesCallAssigned",
  "stats-update": "onStatsUpdate",
  "notification-read": "onNotificationRead",
  "new-notification": "onNewNotification",
  "user-online": "onUserOnline",
  "user-offline": "onUserOffline",
  "online-users": "onOnlineUsers",
  // ─── Messaging ───
  "new-message": "onNewMessage",
  "message-read": "onMessageRead",
  typing: "onTyping",
  "stop-typing": "onStopTyping",
};

const EVENT_NAMES = Object.keys(EVENT_KEY_MAP);

export const useSocketEvents = (eventHandlers = {}) => {
  const { socket, isConnected } = useSocket();

  // Keep the latest handlers in a ref. Updating a ref does NOT trigger a
  // re-render or need to be a dependency, so this runs every render without
  // affecting the subscription effect below.
  const handlersRef = useRef(eventHandlers);
  useEffect(() => {
    handlersRef.current = eventHandlers;
  });

  // Emit event function
  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
        return true;
      } else {
        console.warn("⚠️ Socket not connected, event not sent:", event);
        return false;
      }
    },
    [socket, isConnected],
  );

  // Subscribe/unsubscribe ONLY when the socket or connection state changes —
  // never when the caller passes a new eventHandlers object/function
  // references. Each listener reads the latest handler off handlersRef at
  // call time, so callers can pass fresh inline functions every render
  // without causing constant re-subscription.
  useEffect(() => {
    if (!socket || !isConnected) return;

    const listeners = {};

    EVENT_NAMES.forEach((event) => {
      const key = EVENT_KEY_MAP[event];
      const listener = (...args) => {
        const handler = handlersRef.current[key];
        if (typeof handler === "function") handler(...args);
      };
      listeners[event] = listener;
      socket.on(event, listener);
      console.log(`👂 Listening to ${event}`);
    });

    // Cleanup
    return () => {
      EVENT_NAMES.forEach((event) => {
        socket.off(event, listeners[event]);
        console.log(`🔇 Unregistered ${event}`);
      });
    };
  }, [socket, isConnected]);

  return { emit, isConnected };
};
