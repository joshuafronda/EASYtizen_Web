// src/components/Request/RequestTable.jsx
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Search } from "lucide-react"; // Import Check icon
import Modal from 'react-modal';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as necessary

// Set the app element for accessibility
Modal.setAppElement('#root');

const RequestTable = ({ barangayId }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRequest, setFilteredRequest] = useState([]);

    // Fetch both document and residency requests
    useEffect(() => {
        if (!barangayId) return;

        // Query for document requests with status Pending or Processing
        const documentQuery = query(
            collection(db, 'documentRequests'),
            where('barangayId', '==', barangayId),
            where('status', 'in', ['Pending', 'Processing'])
        );

        // Query for residency requests with status Pending or Processing
        const residencyQuery = query(
            collection(db, 'residencyRequests'),
            where('barangayId', '==', barangayId),
            where('status', 'in', ['Pending', 'Processing'])
        )
        const unsubscribeDocuments = onSnapshot(documentQuery, (docSnapshot) => {
            const documentData = docSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                source: 'documents'
            }));

            const unsubscribeResidency = onSnapshot(residencyQuery, (resSnapshot) => {
                const residencyData = resSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    source: 'residency'
                }));

                // Combine and sort all requests by date
                const allRequests = [...documentData, ...residencyData].sort((a, b) => 
                    new Date(b.requestDate) - new Date(a.requestDate)
                );

                setFilteredRequest(allRequests);
            });

            return () => {
                unsubscribeDocuments();
                unsubscribeResidency();
            };
        });
    }, [barangayId]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = filteredRequest.filter((request) =>
            (request.name.toLowerCase().includes(term) ||
            request.certificateType.toLowerCase().includes(term) ||
            request.purpose.toLowerCase().includes(term)) &&
            (request.status === 'Pending' || request.status === 'Processing')
        );
        setFilteredRequest(filtered);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <motion.div 
            className='bg-white bg-opacity-50 rounded-xl p-4 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex justify-between items-center p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-[#1679AB]" size={18} />
                    <input
                        type="text"
                        placeholder="Search Here..."
                        className="bg-white text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                </div>
            </div>

            <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                <div className="relative">
                    {/* Fixed Header */}
                    <table className='w-full table-fixed divide-y divide-gray-200'>
                        <thead className='bg-white sticky top-0 z-10 shadow-sm'>
                            <tr>
                                <th className='w-1/6 px-5 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Request ID</th>
                                <th className='w-1/6 px-5 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Name</th>
                                <th className='w-1/6 px-5 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Certificate Type</th>
                                <th className='w-1/6 px-5 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Request Date</th>
                                <th className='w-1/6 px-5 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Purpose</th>
                                <th className='w-1/6 px-5 py-4 text-center text-xs font-medium text-black uppercase tracking-wider bg-gray-50'>Status</th>
                            </tr>
                        </thead>
                    </table>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto max-h-[600px]">
                        <table className='w-full table-fixed divide-y divide-gray-200'>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {filteredRequest.map((request, index) => (
                                    <motion.tr 
                                        key={request.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className='w-1/7 px-6 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            {`REQ-${new Date(request.requestDate).getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                                        </td>
                                        <td className='w-1/7 px-6 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            {request.name}
                                        </td>
                                        <td className='w-1/7 px-6 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            {request.certificateType}
                                        </td>
                                        <td className='w-1/7 px-6 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            {new Date(request.requestDate).toLocaleDateString()}
                                        </td>
                                        <td className='w-1/7 px-6 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            {request.purpose}
                                        </td>
                                        <td className='w-1/7 px-6 py-4 text-center whitespace-nowrap text-sm text-black'>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RequestTable;