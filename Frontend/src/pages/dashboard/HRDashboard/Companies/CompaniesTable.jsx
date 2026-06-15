import React from 'react';
import { FaEye, FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';

const CompaniesTable = ({ companies, onView, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HR Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Roles</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {companies.map((company) => (
                        <tr key={company._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{company.companyName}</div>
                                <div className="text-sm text-gray-500">{company.location}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{company.industry}</td>
                            <td className="px-6 py-4">
                                <div className="text-sm">
                                    <div className="font-medium">{company.hrName}</div>
                                    <div className="text-gray-500">{company.email}</div>
                                    <div className="text-gray-500">{company.phone}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {company.openRoles}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    company.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    company.status === 'Hiring' ? 'bg-blue-100 text-blue-800' :
                                    company.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {company.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <FaUserCircle className="text-gray-400" />
                                    <div className="text-sm">
                                        <div className="font-medium">{company.createdByName}</div>
                                        <div className="text-gray-500 text-xs">{company.createdByEmail}</div>
                                        <div className="text-gray-400 text-xs">
                                            {new Date(company.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onView(company)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="View Details"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={() => onEdit(company)}
                                        className="text-green-600 hover:text-green-800"
                                        title="Edit Company"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => onDelete(company)}
                                        className="text-red-600 hover:text-red-800"
                                        title="Delete Company"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompaniesTable;