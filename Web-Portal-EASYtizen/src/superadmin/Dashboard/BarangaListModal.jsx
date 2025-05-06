import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Search, Users, X, ChevronLeft, Download, Printer, ChartNoAxesCombined } from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import * as XLSX from 'xlsx';
import { getBarangayLogo } from '../../components/common/img/barangaylogos';
import DemographicsChart from './DemographicChart';
import EmploymentChart from './EmploymentChart';
import RegisteredVotersChart from './RegisteredVotersChart';

const ResidentTable = ({ residents, loading, selectedBarangay }) => {
  const [searchResident, setSearchResident] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const printTableRef = useRef();
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [showDemographicsChart, setShowDemographicsChart] = useState(false);
  const [showEmploymentChart, setShowEmploymentChart] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Add filter tabs array
  const filterTabs = [
    'all', 
    'male', 
    'female',
    'registered', 
    'unregistered', 
    'employed', 
    'unemployed'
  ];

  // Add filtered residents logic
  const getFilteredResidents = () => {
    return residents.filter(resident => {
      const matchesSearch = resident.fullName.toLowerCase().includes(searchResident.toLowerCase());

      switch (activeTab) {
        case 'male':
          return matchesSearch && resident.gender === 'Male';
        case 'female':
          return matchesSearch && resident.gender === 'Female';
        case 'registered':
          return matchesSearch && resident.voterStatus === 'Registered';
        case 'unregistered':
          return matchesSearch && resident.voterStatus === 'Not Registered';
        case 'employed':
          return matchesSearch && resident.employmentStatus === 'Employed';
        case 'unemployed':
          return matchesSearch && resident.employmentStatus === 'Unemployed';
        default:
          return matchesSearch;
      }
    });
  };

  // Function to categorize residents into age groups
  const categorizeByAgeGroup = (residents) => {
    const ageGroups = {
      '0-18': { male: 0, female: 0 },
      '19-35': { male: 0, female: 0 },
      '36-50': { male: 0, female: 0 },
      '51+': { male: 0, female: 0 },
    };

    residents.forEach(resident => {
      if (resident.age <= 18) {
        ageGroups['0-18'][resident.gender === 'Male' ? 'male' : 'female']++;
      } else if (resident.age <= 35) {
        ageGroups['19-35'][resident.gender === 'Male' ? 'male' : 'female']++;
      } else if (resident.age <= 50) {
        ageGroups['36-50'][resident.gender === 'Male' ? 'male' : 'female']++;
      } else {
        ageGroups['51+'][resident.gender === 'Male' ? 'male' : 'female']++;
      }
    });

    return Object.keys(ageGroups).map(ageGroup => ({
      ageGroup,
      male: ageGroups[ageGroup].male,
      female: ageGroups[ageGroup].female,
    }));
  };

  // Prepare the data for the demographics chart
  const demographicsData = categorizeByAgeGroup(getFilteredResidents());

  // Add stats calculation
  const getStats = () => {
    const filteredData = getFilteredResidents();
    
    return {
      total: filteredData.length,
      registered: filteredData.filter(r => r.voterStatus === 'Registered').length,
      employed: filteredData.filter(r => r.employmentStatus === 'Employed').length,
      label: activeTab === 'all' ? 'Total Residents' :
             activeTab === 'male' ? 'Male Residents' :
             activeTab === 'female' ? 'Female Residents' :
             activeTab === 'registered' ? 'Registered Voters' :
             activeTab === 'unregistered' ? 'Unregistered Voters' :
             activeTab === 'employed' ? 'Employed Residents' :
             'Unemployed Residents'
    };
  };

  const currentStats = getStats();
  const filteredResidents = getFilteredResidents();

  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = filteredResidents.map(resident => ({
      'Full Name': resident.fullName,
      'Phone Number': resident.phoneNumber || 'N/A',
      'Civil Status': resident.civilStatus,
      'Voter Status': resident.voterStatus,
      'Employment Status': resident.employmentStatus
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Residents");
    
    // Generate filename with barangay name and date
    const fileName = `${selectedBarangay}_Residents_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = (filterType) => {
    // Filter residents based on selected type
    const filteredForPrint = residents.filter(resident => {
      switch(filterType) {
        case 'registered':
          return resident.voterStatus === 'Registered';
        case 'not-registered':
          return resident.voterStatus !== 'Registered';
        case 'employed':
          return resident.employmentStatus === 'Employed';
        case 'unemployed':
          return resident.employmentStatus === 'Unemployed';
        default:
          return true; // 'all' case
      }
    });

    const printContent = document.createElement('div');
    const statusText = {
      'all': 'All Residents',
      'registered': 'Registered Voters',
      'not-registered': 'Non-Registered Voters',
      'employed': 'Employed Residents',
      'unemployed': 'Unemployed Residents'
    }[filterType];

    printContent.innerHTML = `
      <html>
        <head>
          <title>${statusText} - Barangay ${selectedBarangay}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .header { text-align: center; margin-bottom: 20px; }
            .print-date { text-align: right; font-size: 12px; color: #666; }
            .status { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${statusText}</h2>
            <h3>Barangay ${selectedBarangay}</h3>
          </div>
          <div class="print-date">
            Generated on: ${new Date().toLocaleString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Civil Status</th>
                <th>Voter Status</th>
                <th>Employment Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredForPrint.map(resident => `
                <tr>
                  <td>${resident.fullName}</td>
                  <td>${resident.phoneNumber || 'N/A'}</td>
                  <td>${resident.civilStatus}</td>
                  <td>${resident.voterStatus}</td>
                  <td>${resident.employmentStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="print-date">
            Total: ${filteredForPrint.length} residents
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1679AB]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm">
          <h4 className="text-blue-800 text-sm font-semibold">{currentStats.label}</h4>
          <p className="text-2xl font-bold text-blue-900">{currentStats.total}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl shadow-sm">
          <h4 className="text-green-800 text-sm font-semibold">Registered Voters</h4>
          <p className="text-2xl font-bold text-green-900">{currentStats.registered}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl shadow-sm">
          <h4 className="text-purple-800 text-sm font-semibold">Employed Residents</h4>
          <p className="text-2xl font-bold text-purple-900">{currentStats.employed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap
              ${activeTab === tab 
                ? tab === 'male' 
                  ? 'bg-blue-600 text-white'
                  : tab === 'female'
                  ? 'bg-pink-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search and Export Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search residents..."
            value={searchResident}
            onChange={(e) => setSearchResident(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPrintOptions(!showPrintOptions)}
              className="flex items-center gap-2 bg-[#1679AB] hover:bg-[#1e8dc5] text-white px-4 py-2 rounded-lg transition-colors"
              disabled={loading || residents.length === 0}
            >
              <Printer size={18} />
              Print
            </motion.button>
            
            {showPrintOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                <div className="py-1">
                  <button
                    onClick={() => { handlePrint('all'); setShowPrintOptions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Residents
                  </button>
                  <button
                    onClick={() => { handlePrint('registered'); setShowPrintOptions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Registered Voters
                  </button>
                  <button
                    onClick={() => { handlePrint('not-registered'); setShowPrintOptions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Non-Registered Voters
                  </button>
                  <button
                    onClick={() => { handlePrint('employed'); setShowPrintOptions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Employed Residents
                  </button>
                  <button
                    onClick={() => { handlePrint('unemployed'); setShowPrintOptions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Unemployed Residents
                  </button>
                </div>
              </div>
            )}
          </div>
          

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportToExcel}
            className="flex items-center gap-2 bg-[#1679AB] hover:bg-[#1e8dc5] text-white px-4 py-2 rounded-lg transition-colors"
            disabled={loading || residents.length === 0}
          >
            <Download size={20} />
            Export
            
          </motion.button>
          
        </div>
        
       {/* Maximize Button with Icon */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsMaximized(true)}
        className="text-[#1679ab] mr-3 relative group"
        disabled={loading || residents.length === 0}
      >
        <ChartNoAxesCombined size={20} />
        {/* Custom Tooltip */}
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-100 text-[#1679ab] px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          View Analytics
        </span>
      </motion.button>
      </div>

      {/* Residents Table */}
      <div id="printableTable" className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <div className="max-h-[450px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Civil Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Voter Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Employment Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResidents.map((resident) => (
                  <motion.tr 
                    key={resident.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-sm font-sm text-gray-900">
                      <div className="max-w-[200px] mx-auto">
                        {resident.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm  text-gray-900">
                      <div className="max-w-[150px] mx-auto">
                        {resident.phoneNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <div className="max-w-[100px] mx-auto">
                        {resident.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      <div className="max-w-[80px] mx-auto">
                        {resident.age}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 text-xs font-sm rounded-full ${
                          resident.civilStatus === 'Single' 
                            ? ''
                            : resident.civilStatus === 'Married' 
                            ? ''
                            : resident.civilStatus === 'Widowed'
                            ? ''
                            : ''
                        }`}>
                          {resident.civilStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 text-xs font-sm rounded-full ${
                          resident.voterStatus === 'Registered' 
                            ? '' 
                            :''
                        }`}>
                          {resident.voterStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 text-xs font-sm rounded-full ${
                          resident.employmentStatus === 'Employed' 
                            ? '' 
                            : ''
                        }`}>
                          {resident.employmentStatus}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
        <span>
          Showing {filteredResidents.length} of {residents.length} residents
        </span>
        {filteredResidents.length > 0 && (
          <span className="text-[#1679AB]">
            Tip: Use the Export button to download this data
          </span>
        )}
      </div>

      {/* Maximized Modal for Data Visualization */}
      <AnimatePresence>
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-opacity-10 z-50 flex items-center justify-center p-4"
            onClick={() => setIsMaximized(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-[75%] h-[96vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Barangay Demographics Overview</h2>
                <button
                  onClick={() => setIsMaximized(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

             {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(95vh-64px)]">
          {/* Render Demographics Chart */}
          <DemographicsChart data={demographicsData} />
          
          {/* Render Employment Chart */}
          <EmploymentChart data={filteredResidents} />
          
          {/* Render Registered Voters Chart */}
          <RegisteredVotersChart data={filteredResidents} />
        </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Modal Component
const BarangayListModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const barangayList = [
    "Alalum", "Antipolo", "Balimbing", "Banaba", "Bayanan",
    "Danglayan", "Del Pilar", "Gelerang Kawayan", "Ilat North", "Ilat South",
    "Kaingin", "Laurel", "Malaking Pook", "Mataas na Lupa",
    "Natunuan North", "Natunuan South", "Padre Castillo", "Palsahingin",
    "Pila", "Poblacion", "Pook ni Banal", "Pook ni Kapitan",
    "Resplandor", "Sambat", "San Antonio", "San Mariano",
    "San Mateo", "Santa Elena", "Santo Niño"
  ];

  // Filter barangays based on search term
  const filteredBarangays = barangayList.filter(barangay =>
    barangay.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sampleResidents = [
    {
      id: 1,
      fullName: "Juan Dela Cruz",
      phoneNumber: "09123456783",
      gender: "Male",
      age: 33,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 2,
      fullName: "Maria Santos",
      phoneNumber: "09187654325",
      gender: "Female",
      age: 52,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 3,
      fullName: "Pedro Reyes",
      phoneNumber: "09199999995",
      gender: "Male",
      age: 39,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 4,
      fullName: "Ana Garcia",
      phoneNumber: "09166666662",
      gender: "Female",
      age: 28,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 5,
      fullName: "Miguel Lopez",
      phoneNumber: "09177777773",
      gender: "Male",
      age: 44,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 6,
      fullName: "Sofia Rodriguez",
      phoneNumber: "09123456784",
      gender: "Female",
      age: 25,
      civilStatus: "Single",
      voterStatus: "Not Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 7,
      fullName: "Carlos Martinez",
      phoneNumber: "09187654326",
      gender: "Male",
      age: 31,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 8,
      fullName: "Isabella Santos",
      phoneNumber: "09199999994",
      gender: "Female",
      age: 34,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 9,
      fullName: "Luis Fernandez",
      phoneNumber: "09166666661",
      gender: "Male",
      age: 33,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 10,
      fullName: "Carmen Torres",
      phoneNumber: "09177777772",
      gender: "Female",
      age: 37,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 11,
      fullName: "Ramon Aquino",
      phoneNumber: "09123456785",
      gender: "Male",
      age: 42,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 12,
      fullName: "Patricia Lim",
      phoneNumber: "09187654327",
      gender: "Female",
      age: 38,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 13,
      fullName: "Antonio Tan",
      phoneNumber: "09199999993",
      gender: "Male",
      age: 41,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 14,
      fullName: "Elena Cruz",
      phoneNumber: "09166666660",
      gender: "Female",
      age: 27,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 15,
      fullName: "Ricardo Bautista",
      phoneNumber: "09177777771",
      gender: "Male",
      age: 28,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 16,
      fullName: "Diana Reyes",
      phoneNumber: "09123456786",
      gender: "Female",
      age: 28,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 17,
      fullName: "Marco dela Torre",
      phoneNumber: "09187654328",
      gender: "Male",
      age: 31,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 18,
      fullName: "Rosa Villanueva",
      phoneNumber: "09199999992",
      gender: "Female",
      age: 47,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 19,
      fullName: "Gabriel Santos",
      phoneNumber: "09166666659",
      gender: "Male",
      age: 38,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 20,
      fullName: "Teresa Ramos",
      phoneNumber: "09177777770",
      gender: "Female",
      age: 36,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 21,
      fullName: "Manuel Gonzales",
      phoneNumber: "09123456787",
      gender: "Male",
      age: 33,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 22,
      fullName: "Clara Mendoza",
      phoneNumber: "09187654329",
      gender: "Female",
      age: 29,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 23,
      fullName: "Felipe Dizon",
      phoneNumber: "09199999991",
      gender: "Male",
      age: 39,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 24,
      fullName: "Beatriz Ocampo",
      phoneNumber: "09166666658",
      gender: "Female",
      age: 29,
      civilStatus: "Single",
      voterStatus: "Not Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 25,
      fullName: "Andres Pascual",
      phoneNumber: "09177777769",
      gender: "Male",
      age: 30,
      civilStatus: "Single",
      voterStatus: "Not Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 26,
      fullName: "Margarita Castro",
      phoneNumber: "09123456788",
      gender: "Female",
      age: 35,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 27,
      fullName: "Roberto Miranda",
      phoneNumber: "09187654330",
      gender: "Male",
      age: 40,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 28,
      fullName: "Lucia Velasco",
      phoneNumber: "09199999990",
      gender: "Female",
      age: 57,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 29,
      fullName: "Eduardo Morales",
      phoneNumber: "09166666657",
      gender: "Male",
      age: 52,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 30,
      fullName: "Cristina Domingo",
      phoneNumber: "09177777768",
      gender: "Female",
      age: 53,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 31,
      fullName: "Fernando Mercado",
      phoneNumber: "09123456789",
      gender: "Male",
      age: 28,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 32,
      fullName: "Aurora Navarro",
      phoneNumber: "09187654321",
      gender: "Female",
      age: 35,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 33,
      fullName: "Rodrigo Salazar",
      phoneNumber: "09199999999",
      gender: "Male",
      age: 34,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 34,
      fullName: "Victoria Robles",
      phoneNumber: "09166666666",
      gender: "Female",
      age: 34,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 35,
      fullName: "Alejandro Flores",
      phoneNumber: "09177777777",
      gender: "Male",
      age: 33,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 36,
      fullName: "Camila Aguilar",
      phoneNumber: "09123456790",
      gender: "Female",
      age: 33,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 37,
      fullName: "Benjamin Santos",
      phoneNumber: "09187654322",
      gender: "Male",
      age: 25,
      civilStatus: "Single",
      voterStatus: "Not Registered",
      employmentStatus: "Employed"
    },
    {
      id: 38,
      fullName: "Isabella Reyes",
      phoneNumber: "09199999998",
      gender: "Female",
      age: 25,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 39,
      fullName: "Mateo dela Rosa",
      phoneNumber: "09166666665",
      gender: "Male",
      age: 33,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 40,
      fullName: "Regina Valencia",
      phoneNumber: "09177777776",
      gender: "Female",
      age: 46,
      civilStatus: "Single",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 41,
      fullName: "Diego Ramirez",
      phoneNumber: "09123456791",
      gender: "Male",
      age: 38,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 42,
      fullName: "Valentina Cruz",
      phoneNumber: "09187654323",
      gender: "Female",
      age: 53,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 43,
      fullName: "Sebastian Torres",
      phoneNumber: "09199999997",
      gender: "Male",
      age: 47,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 44,
      fullName: "Catalina Ortiz",
      phoneNumber: "09166666664",
      gender: "Female",
      age: 57,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 45,
      fullName: "Nicolas Mendoza",
      phoneNumber: "09177777775",
      gender: "Male",
      age: 39,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 46,
      fullName: "Gabriela Jimenez",
      phoneNumber: "09123456792",
      gender: "Female",
      age: 41,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 47,
      fullName: "Rafael Castillo",
      phoneNumber: "09187654324",
      gender: "Male",
      age: 35,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    },
    {
      id: 48,
      fullName: "Daniela Ramos",
      phoneNumber: "09199999996",
      gender: "Female",
      age: 34,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 49,
      fullName: "Santiago Herrera",
      phoneNumber: "09166666663",
      gender: "Male",
      age: 45,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Employed"
    },
    {
      id: 50,
      fullName: "Emma Vargas",
      phoneNumber: "09177777774",
      gender: "Female",
      age: 44,
      civilStatus: "Married",
      voterStatus: "Registered",
      employmentStatus: "Unemployed"
    }
];

  // In your component, temporarily use this instead of fetching from Firebase
  const fetchResidents = async (barangayName) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResidents(sampleResidents);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarangayClick = (barangay) => {
    setSelectedBarangay(barangay);
    fetchResidents(barangay);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedBarangay(null);
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-[75%] h-[96vh] overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              {selectedBarangay && (
                <button
                  onClick={() => setSelectedBarangay(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} className="text-gray-600" />
                </button>
              )}
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedBarangay ? `Barangay ${selectedBarangay}` : 'Residents/Barangay List'}
              </h3>
            </div>
            <button 
              onClick={() => {
                setSelectedBarangay(null);
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {!selectedBarangay ? (
            <>
              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search barangay..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Added scrollable container with border */}
              <div className="border border-gray-200 rounded-xl p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                {/* Barangay Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBarangays.map((barangay, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleBarangayClick(barangay)}
                      className="group relative bg-white p-6 rounded-xl border border-gray-200 hover:border-[#1679AB] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors overflow-hidden">
                          <img 
                            src={getBarangayLogo(barangay)}
                            alt={`${barangay} logo`}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#1679AB] transition-colors">
                            {barangay}
                          </h4>
                          <p className="text-sm text-gray-500">Click to view residents</p>
                        </div>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} className="text-[#1679AB] rotate-180" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredBarangays.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No barangays found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <ResidentTable 
              residents={residents} 
              loading={loading}
              selectedBarangay={selectedBarangay}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BarangayListModal;