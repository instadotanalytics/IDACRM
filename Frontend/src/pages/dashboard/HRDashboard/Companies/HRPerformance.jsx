import React, { useState, useEffect } from 'react';
import { FaUserTie, FaBuilding, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { companyService } from '../services/companyService';

const HRPerformance = () => {
    const [hrData, setHrData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHRPerformance();
    }, []);

    const fetchHRPerformance = async () => {
        try {
            const response = await companyService.getHRPerformance();
            setHrData(response.data.data.hrPerformance);
        } catch (error) {
            console.error('Error fetching HR performance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading HR Performance...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUserTie className="text-blue-600" />
                HR Executive Performance
            </h3>
            
            <div className="space-y-4">
                {hrData.map((hr, index) => (
                    <div key={hr._id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-semibold text-gray-900">{hr.hrName}</h4>
                                <p className="text-sm text-gray-500">{hr.hrEmail}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-blue-600">{hr.companiesAdded}</span>
                                <p className="text-xs text-gray-500">Companies Added</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                            <div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <FaBuilding className="text-green-500" />
                                    <span>Active: {hr.activeCompanies}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <FaChartLine className="text-blue-500" />
                                    <span>Hiring: {hr.hiringCompanies}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <FaCalendarAlt className="text-purple-500" />
                                    <span>Roles: {hr.totalOpenRoles}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {hrData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No companies added yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRPerformance;