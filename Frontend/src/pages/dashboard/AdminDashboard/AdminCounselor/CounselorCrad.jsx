import React, { useState } from 'react';
import { FaUsers, FaPhoneAlt, FaFileAlt, FaChartLine } from 'react-icons/fa';
import styles from './CounselorCard.module.css';
import CounselorLeads from './CounselorLeads';
import CounselorCalls from './CounselorCalls';
import CounselorAdmissions from './CounselorAdmissions';




const CounselorCard = () => {
    const [activeTab, setActiveTab] = useState('leads');

    const buttons = [
        { id: 'leads', label: 'Leads', icon: FaUsers, color: '#3b82f6', bgColor: '#dbeafe' },
        { id: 'calls', label: 'Calls', icon: FaPhoneAlt, color: '#10b981', bgColor: '#d1fae5' },
        { id: 'admissions', label: 'Admissions', icon: FaFileAlt, color: '#8b5cf6', bgColor: '#e0e7ff' },
                                                                                                                            
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'leads':
                return <CounselorLeads/>;
            case 'calls':
                return <CounselorCalls/>;
            case 'admissions':
                return <CounselorAdmissions/>;
           
            default:
                return <CounselorLeads/>;
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}><FaUsers /></div>
                    <div>
                        <h1 className={styles.headerTitle}>Counselor Management</h1>
                        <p className={styles.headerSub}>Manage counselor activities and performance</p>
                    </div>
                </div>
            </div>

            {/* 4 Buttons Row */}
            <div className={styles.buttonsRow}>
                {buttons.map((btn) => (
                    <button
                        key={btn.id}
                        className={`${styles.cardBtn} ${activeTab === btn.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(btn.id)}
                        style={{
                            borderBottomColor: activeTab === btn.id ? btn.color : 'transparent',
                            color: activeTab === btn.id ? btn.color : '#64748b'
                        }}
                    >
                        <div className={styles.btnIcon} style={{ backgroundColor: btn.bgColor, color: btn.color }}>
                            <btn.icon />
                        </div>
                        <div className={styles.btnInfo}>
                            <span className={styles.btnLabel}>{btn.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
                {renderContent()}
            </div>
        </div>
    );
};

export default CounselorCard;