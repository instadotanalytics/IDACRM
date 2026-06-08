import React, { useState } from 'react';
import { 
  FaChalkboardTeacher, FaUsers, FaTasks, FaCalendarCheck,
  FaBookOpen, FaFileAlt, FaChartLine, FaDownload, FaStar, FaAward
} from 'react-icons/fa';
import styles from './TrainerManagement.module.css';
import AdminAttendanceTable from './AdminAttendanceTable';
import BatchManagement from '../../TrainerDashboard/Betch/BatchManagement';
import TrainerAttendanceMarker from '../../TrainerDashboard/AttendanceTable/TrainerAttendanceMarker';
import Assignments from '../../TrainerDashboard/Performance/Assignments';
import Tests from '../../TrainerDashboard/Performance/Tests';
import CourseMaterials from '../../TrainerDashboard/CourseMaterials';
import StudentPerformance from '../../TrainerDashboard/Performance/StudentPerformance';

const TrainerManagement = () => {
    // ✅ FIXED: Default tab set to 'batches' instead of 'trainers'
    const [activeSubTab, setActiveSubTab] = useState('batches');

    const subTabs = [
        { id: 'batches', label: 'Batch Assignment', icon: FaBookOpen },
        { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
        { id: 'assignments', label: 'Assignments', icon: FaTasks },
        { id: 'tests', label: 'Tests', icon: FaFileAlt },
        { id: 'materials', label: 'Study Materials', icon: FaDownload },
        { id: 'performance', label: 'Analytics', icon: FaChartLine },
    ];

    // Simple placeholder component
    const PlaceholderContent = ({ title }) => (
        <div className={styles.placeholderBox}>
            <h3>{title}</h3>
            <p>Coming soon...</p>
        </div>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch(activeSubTab) {
            case 'batches':
                return <BatchManagement/>;
            case 'attendance':
                return <TrainerAttendanceMarker/>;
            case 'assignments':
                return <Assignments/>;
            case 'tests':
                return <Tests/>;
            case 'materials':
                return <CourseMaterials/>;
            case 'performance':
                return <StudentPerformance/>;
            default:
                return <PlaceholderContent title="Select an option" />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.subTabs}>
                {subTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.subTab} ${activeSubTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveSubTab(tab.id)}
                    >
                        <tab.icon /> {tab.label}
                    </button>
                ))}
            </div>
            <div className={styles.mainContent}>
                {renderContent()}
            </div>
        </div>
    );
};

export default TrainerManagement;