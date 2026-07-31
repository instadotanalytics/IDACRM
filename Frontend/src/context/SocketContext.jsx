// context/SocketContext.jsx - FIXED (sessionStorage for tab isolation)
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import io from "socket.io-client";
import { getToken } from "../services/auth";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  const connectSocket = (token) => {
    // Tear down existing connection
    if (socketRef.current) {
      socketRef.current.off();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }

    if (!token) {
      console.log("⚠️ No token — socket will not connect");
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected:", socketInstance.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
      if (reason === "io server disconnect") {
        socketInstance.connect();
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setConnectionError(error.message);
      setIsConnected(false);
      // Never redirect here — auth guards handle navigation
    });

    socketInstance.on("reconnect", () => {
      console.log("✅ Socket reconnected");
      setIsConnected(true);
      setConnectionError(null);
    });
  };

  useEffect(() => {
    // Read from sessionStorage (tab-isolated) via the auth helper
    const token = getToken();
    connectSocket(token);

    return () => {
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call this immediately after login/logout IN THE SAME TAB
  // so the socket uses the new (or null) token without a page reload.
  const reconnectSocket = (token) => {
    connectSocket(token || getToken());
  };

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, connectionError, reconnectSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
};
