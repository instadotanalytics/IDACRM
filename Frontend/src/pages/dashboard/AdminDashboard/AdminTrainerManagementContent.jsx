import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";
import BatchManagement from "../TrainerDashboard/Betch/BatchManagement";
import TrainerAttendanceMarker from "../TrainerDashboard/AttendanceTable/TrainerAttendanceMarker";
import Assignments from "../TrainerDashboard/Performance/Assignments";
import Tests from "../TrainerDashboard/Performance/Tests";
import CourseMaterials from "../TrainerDashboard/CourseMaterials";
import StudentPerformance from "../TrainerDashboard/Performance/StudentPerformance";

const TRAINER_TABS = [
  { id: "batches", label: "Batch Assignment", icon: "📚" },
  { id: "attendance", label: "Attendance", icon: "📅" },
  { id: "assignments", label: "Assignments", icon: "📝" },
  { id: "tests", label: "Tests", icon: "✍️" },
  { id: "materials", label: "Study Materials", icon: "📖" },
  { id: "performance", label: "Analytics", icon: "📊" },
];

const AdminTrainerManagementContent = () => {
  const [activeTrainerTab, setActiveTrainerTab] = useState("batches");

  const renderTrainerContent = () => {
    switch (activeTrainerTab) {
      case "batches":
        return <BatchManagement />;
      case "attendance":
        return <TrainerAttendanceMarker />;
      case "assignments":
        return <Assignments />;
      case "tests":
        return <Tests />;
      case "materials":
        return <CourseMaterials />;
      case "performance":
        return <StudentPerformance />;
      default:
        return <BatchManagement />;
    }
  };

  return (
    <div className={styles.trainerManagementContainer}>
      <div className={styles.trainerTabs}>
        {TRAINER_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.trainerTab} ${activeTrainerTab === tab.id ? styles.activeTrainerTab : ""}`}
            onClick={() => setActiveTrainerTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.trainerContent}>{renderTrainerContent()}</div>
    </div>
  );
};

export default AdminTrainerManagementContent;
