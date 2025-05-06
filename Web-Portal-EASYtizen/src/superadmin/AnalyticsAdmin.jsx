import { User2Icon, File, VoteIcon, Newspaper, Calendar as CalendarIcon, BarChart, Building2, FileText, FileCheck, Files, CircleUser } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "../components/Dashboard/StatCard";
import PopulationChart from "../superadmin/Dashboard/PopulationChart";
import RequestChart from "../superadmin/Dashboard/BarChart";
import CategoryChart from "../superadmin/Dashboard/CategoryChart";
import Calendar from "../superadmin/Dashboard/Calendar";
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import BarangayListModal from './Dashboard/BarangaListModal';
import CategoryGender from "../superadmin/Dashboard/CategoryGender";
import DemographicsChart from "../superadmin/Dashboard/DemographicChart";
import BarangayOfficialListModal from './Dashboard/BarangayOfficialListModal';

const AnalyticsAdmin = ({ user }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBarangayList, setShowBarangayList] = useState(false);
  const [showBarangayOfficialList, setShowBarangayOfficialList] = useState(false);
  const [stats, setStats] = useState({
    barangayClearance: 0,
    certificateIndigency: 0,
    certificateResidency: 0,
    totalRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [showDemographicsChart, setShowDemographicsChart] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      let barangayClearanceCount = 0;
      let certificateIndigencyCount = 0;
      let certificateResidencyCount = 0;

      // Get document requests counts
      const documentSnapshot = await getDocs(collection(db, 'documentRequests'));
      documentSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.certificateType === "Barangay Clearance") {
          barangayClearanceCount++;
        } else if (data.certificateType === "Certificate of Indigency") {
          certificateIndigencyCount++;
        }
      });

      // Get residency requests count
      const residencySnapshot = await getDocs(collection(db, 'residencyRequests'));
      const residencyCount = residencySnapshot.size;
      certificateResidencyCount = residencyCount;

      // Calculate total
      const totalRequests = barangayClearanceCount + certificateIndigencyCount + certificateResidencyCount;

      setStats({
        barangayClearance: barangayClearanceCount,
        certificateIndigency: certificateIndigencyCount,
        certificateResidency: certificateResidencyCount,
        totalRequests: totalRequests
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for the demographics chart
  const demographicsData = [
    { ageGroup: '0-18', male: 120, female: 130 },
    { ageGroup: '19-35', male: 200, female: 210 },
    { ageGroup: '36-50', male: 150, female: 160 },
    { ageGroup: '51+', male: 80, female: 90 },
  ];

  return (
    <div className="flex-1 overflow-hidden relative z-10 h-screen">
      <main className="max-w-7x1 h-screen mx-auto py-4 px-4 lg:px-8 overflow-y-auto">
        {/* Header with Analytics title and buttons */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowBarangayOfficialList(true)}
              className="flex items-center gap-2 bg-[#1679AB] hover:bg-[#1e8dc5] text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CircleUser size={20} />
              <span>Barangay Officials</span>
            </motion.button>
          
            <motion.button
              onClick={() => setShowBarangayList(true)}
              className="flex items-center gap-2 bg-[#1679AB] hover:bg-[#1e8dc5] text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Building2 size={20} />
              <span>Barangay Residents</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 bg-[#1679AB] hover:bg-[#1e8dc5] text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CalendarIcon size={20} />
              <span>Calendar</span>
            </motion.button>
          </div>
        </div>

        {/* Add StatCards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <StatCard
            name="Total Requests"
            icon={Files}
            value={stats.totalRequests.toLocaleString()}
            color="#1679AB"
            subtitle="All document requests"
          />
          
          <StatCard
            name="Barangay Clearance"
            icon={File}
            value={stats.barangayClearance.toLocaleString()}
            color="#45B3E3"
            subtitle="Total clearance requests"
          />
          
          <StatCard
            name="Certificate of Indigency"
            icon={FileText}
            value={stats.certificateIndigency.toLocaleString()}
            color="#73ECFF"
            subtitle="Total certificate of indigency requests"
          />
          
          <StatCard
            name="Certificate of Residency"
            icon={FileCheck}
            value={stats.certificateResidency.toLocaleString()}
            color="#183369"
            subtitle="Total residency requests"
          />
        </div>

        {/* Calendar Modal */}
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCalendar(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-4">
                <Calendar />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Barangay List Modal */}
        <BarangayListModal 
          isOpen={showBarangayList} 
          onClose={() => setShowBarangayList(false)} 
        />

        {/* Barangay Official List Modal */}
        <BarangayOfficialListModal 
          isOpen={showBarangayOfficialList} 
          onClose={() => setShowBarangayOfficialList(false)} 
        />

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-2'>
          <CategoryChart />
          <PopulationChart/>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsAdmin;