// components/ConnectionStatus.jsx - UPDATED WITH CORRECT ICONS
import React from "react";
import { FaWifi, FaSignal } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import styles from "./ConnectionStatus.module.css";

const ConnectionStatus = () => {
  const { isConnected, connectionError } = useSocket();

  return (
    <div className={styles.container}>
      <div
        className={`${styles.status} ${isConnected ? styles.online : styles.offline}`}
      >
        {isConnected ? (
          <>
            <FaWifi className={styles.icon} />
            <span className={styles.text}>Live</span>
          </>
        ) : (
          <>
            <FaSignal className={styles.icon} />
            <span className={styles.text}>Offline</span>
          </>
        )}
      </div>
      {connectionError && !isConnected && (
        <div className={styles.errorTooltip}>{connectionError}</div>
      )}
    </div>
  );
};

export default ConnectionStatus;
