import { useState, useEffect } from 'react';
import { User2Icon, File, VoteIcon, Newspaper, Users, X } from "lucide-react";
import Header from "../components/common/Header";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "../components/Dashboard/StatCard";
import PopulationChart from "../components/Dashboard/PopulationChart";
import RequestChart from "../components/Dashboard/BarChart";
import CategoryChart from "../components/Dashboard/CategoryChart";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import TableChart from '../components/Dashboard/TableChart';
const Analytics = ({ user }) => {
  const [stats, setStats] = useState({
    barangayClearance:0,
    certificateIndigency: 0,
    certificateResidency: 0,
    totalRequests: 0,
    totalBlotters: 0,
    resolvedBlotters: 0,
    pendingBlotters: 0,
    activeOfficials: 0,
    totalOfficialPositions: 11
  });

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Initialize request counters
        let barangayClearanceCount = 0;
        let certificateIndigencyCount = 0;
        let certificateResidencyCount = 0;

        // Get document requests
        const documentRequestsQuery = query(
          collection(db, 'documentRequests'),
          where('barangayId', '==', user.barangayId)
        );

        const residencyRequestsQuery = query(
          collection(db, 'residencyRequests'),
          where('barangayId', '==', user.barangayId)
        );

        // Get blotter records with status
        const blotterQuery = query(
          collection(db, 'blotterRecords'),
          where('barangayId', '==', user.barangayId)
        );

        // Get active officials count
        const officialsQuery = query(
          collection(db, 'barangayOfficials'),
          where('barangayId', '==', user.barangayId),
          where('status', '==', 'Active')
        );

        // Fetch all data in parallel
        const [
          documentRequestsSnapshot,
          residencyRequestsSnapshot,
          blotterSnapshot,
          officialsSnapshot
        ] = await Promise.all([
          getDocs(documentRequestsQuery),
          getDocs(residencyRequestsQuery),
          getDocs(blotterQuery),
          getDocs(officialsQuery)
        ]);

        // Count document requests by type
        documentRequestsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.certificateType === "Barangay Clearance") {
            barangayClearanceCount++;
          } else if (data.certificateType === "Certificate of Indigency") {
            certificateIndigencyCount++;
          }
        });

        // Count residency requests
        certificateResidencyCount = residencyRequestsSnapshot.size;

        // Count blotter records by status
        let resolvedBlotters = 0;
        let pendingBlotters = 0;
        
        blotterSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'Resolved') {
            resolvedBlotters++;
          } else {
            pendingBlotters++;
          }
        });

        const totalBlotters = resolvedBlotters + pendingBlotters;

        // Calculate total requests
        const totalRequests = barangayClearanceCount + certificateIndigencyCount + certificateResidencyCount;

        setStats({
          barangayClearance: barangayClearanceCount,
          certificateIndigency: certificateIndigencyCount,
          certificateResidency: certificateResidencyCount,
          totalRequests: totalRequests,
          totalBlotters,
          resolvedBlotters,
          pendingBlotters,
          activeOfficials: officialsSnapshot.size,
          totalOfficialPositions: 11
        });

      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    if (user?.barangayId) {
      fetchStats();
    }
  }, [user?.barangayId]);

  const officialsStatus = stats.activeOfficials === stats.totalOfficialPositions 
    ? "Complete"
    : `${stats.activeOfficials}/${stats.totalOfficialPositions}`;

  return (
    <div className="flex-1 overflow-hidden relative z-10 h-screen">
      <Header title="Dashboard" user={user} /> 

      <main className="max-w-7x1 mx-auto py-5 px-4 lg:px-8 h-full overflow-y-auto">
         {/* New Button */}
         <div className="flex justify-end mb-4">
          <button 
            onClick={() => setIsTableModalOpen(true)}
            className="bg-[#1679AB] text-white px-4 py-2 rounded shadow"
          >
            Resident Information
          </button>
        </div>
        {/* End of New Button */}


        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <CategoryChart user={user} />
          <PopulationChart user={user} />
        </div>

        <motion.div
          className="border-t border-gray-200 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>© 2024 EASYtizen DRS. All rights reserved.</p>
            <p className="mt-4 mb-10">Version 1.0.0</p>
          </div>
        </motion.div>

        {/* Modal for TableChart */}
        <AnimatePresence>
          {isTableModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center p-4"
              onClick={() => setIsTableModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-[75%] h-[95vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 relative">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Residents Information</h2>
                  <button
                    onClick={() => setIsTableModalOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <TableChart user={user} />
                  
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Analytics;