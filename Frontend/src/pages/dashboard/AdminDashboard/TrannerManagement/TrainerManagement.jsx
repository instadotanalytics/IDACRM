import React, { useState } from 'react';
import { 
  FaChalkboardTeacher, FaUsers, FaTasks, FaCalendarCheck,
  FaBookOpen, FaFileAlt, FaChartLine, FaDownload, FaStar, FaAward
} from 'react-icons/fa';
import styles from './TrainerManagement.module.css';
import AdminAttendanceTable from './AdminAttendanceTable';

const TrainerManagement = () => {
    const [activeSubTab, setActiveSubTab] = useState('trainers');

    // Stats data (overview ke liye)
   

    // Sub-tab menu
    const subTabs = [
        { id: 'trainers', label: 'Trainers List', icon: FaChalkboardTeacher },
        { id: 'batches', label: 'Batch Assignment', icon: FaBookOpen },
        { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck },
        { id: 'assignments', label: 'Assignments', icon: FaTasks },
        { id: 'tests', label: 'Tests', icon: FaFileAlt },
        { id: 'materials', label: 'Study Materials', icon: FaDownload },
        { id: 'performance', label: 'Analytics', icon: FaChartLine },
    ];

    // Placeholder component - sirf text dikhega
    const PlaceholderContent = ({ title }) => (
        <div className={styles.placeholderBox}>
           
        </div>
    );

   

    // Render content based on active tab
    const renderContent = () => {
        switch(activeSubTab) {
            case 'trainers':
                return <PlaceholderContent title="Trainers List" />;
            case 'batches':
                return <PlaceholderContent title="Batch Assignment" />;
            case 'attendance':
                return <AdminAttendanceTable title="Attendance" />;
            case 'assignments':
                return <PlaceholderContent title="Assignments" />;
            case 'tests':
                return <PlaceholderContent title="Tests" />;
            case 'materials':
                return <PlaceholderContent title="Study Materials" />;
            case 'performance':
                return <PlaceholderContent title="Analytics" />;
            default:
                return <PlaceholderContent title="Trainers List" />;
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