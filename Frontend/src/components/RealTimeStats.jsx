// components/RealTimeStats.jsx
import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useSocketEvents } from "../hooks/useSocketEvents";
import { FaPhone, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import styles from "./RealTimeStats.module.css";

const RealTimeStats = ({ userId }) => {
  const [stats, setStats] = useState({
    today: {
      total: 0,
      connected: 0,
      notAnswered: 0,
      busy: 0,
      wrongNumber: 0,
      totalDuration: 0,
    },
    total: 0,
    timestamp: new Date(),
  });

  const { socket } = useSocket();

  // Handle stats update
  const handleStatsUpdate = (newStats) => {
    if (newStats) {
      setStats(newStats);
    }
  };

  // Use socket events
  useSocketEvents({
    onStatsUpdate: handleStatsUpdate,
  });

  // Request initial stats
  useEffect(() => {
    if (socket) {
      socket.emit("request-stats", { userId });
    }
  }, [socket, userId]);

  const statItems = [
    {
      label: "Today's Calls",
      value: stats.today?.total || 0,
      icon: <FaPhone />,
      color: "#810B38",
    },
    {
      label: "Connected",
      value: stats.today?.connected || 0,
      icon: <FaCheckCircle />,
      color: "#10b981",
    },
    {
      label: "Pending/Not Answered",
      value: stats.today?.notAnswered || 0,
      icon: <FaClock />,
      color: "#f59e0b",
    },
    {
      label: "Missed/Busy",
      value: (stats.today?.busy || 0) + (stats.today?.wrongNumber || 0),
      icon: <FaTimesCircle />,
      color: "#ef4444",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Real-time Statistics</h3>
        <span className={styles.timestamp}>
          Updated: {new Date(stats.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className={styles.statsGrid}>
        {statItems.map((item, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{item.value}</span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeStats;
