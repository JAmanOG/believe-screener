import isEqual from 'lodash.isequal';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import socket from "../socket";
interface FilteredData {
  timestamp: string;
  data: any[];
}

interface SocketContextType {
  isConnected: boolean;
  filteredData: FilteredData | null;
  connectionStatus: string;
  reconnect: () => void;
  lastError: string | null;
  retryCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [filteredData, setFilteredData] = useState<FilteredData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const connectSocket = () => {
    if (!socket.connected) {
      setConnectionStatus("Connecting...");
      setLastError(null);
      socket.connect();
    }
  };

  const reconnect = () => {
    setRetryCount((prev) => prev + 1);
    socket.disconnect();
    setTimeout(() => {
      connectSocket();
    }, 1000);
  };

  useEffect(() => {
    // Initial connection
    connectSocket();

    // Connection event handlers
    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("Connected");
      setLastError(null);
      setRetryCount(0);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      setConnectionStatus(`Disconnected: ${reason}`);
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setLastError(error.message);

      if (error.message.includes("xhr poll error")) {
        setConnectionStatus("Server not reachable");
      } else if (error.message.includes("websocket error")) {
        setConnectionStatus("Connection issue");
      } else {
        setConnectionStatus("Connection Error");
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      setIsConnected(true);
      setConnectionStatus("Reconnected");
      setLastError(null);
      setRetryCount(0);
    });

    socket.on("reconnect_error", (error) => {
      setConnectionStatus("Reconnection Failed");
      setLastError(error.message);
    });

    socket.on("reconnect_failed", () => {
      setConnectionStatus("Connection Failed");
    });

    // Listen for filtered data updates
    socket.on("filteredDataUpdate", (update: FilteredData) => {
      setFilteredData((prev) => {
        if (
          !prev ||
          !isEqual(prev.data, update.data) // Only update if tableData or otherData changed
        ) {
          return update;
        }
        return prev;
      });
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.off("reconnect_error");
      socket.off("reconnect_failed");
      socket.off("filteredDataUpdate");
      socket.disconnect();
    };
  }, []);

  const value: SocketContextType = {
    isConnected,
    filteredData,
    connectionStatus,
    reconnect,
    lastError,
    retryCount,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
