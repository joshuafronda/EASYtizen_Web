import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Printer, Users, UserCheck, Building2, Maximize2, X, ChartNoAxesCombined } from "lucide-react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import * as XLSX from 'xlsx';
import AgeDistributionChart from './AgeDistributionChart';
import GenderDistributionChart from './GenderDistributionChart';
import VoterStatusChart from './VoterStatusChart';
import EmploymentStatusChart from './EmploymentStatusChart';

const dummyResidents = [
  {
    id: '1',
    fullName: 'Juan Dela Cruz',
    phoneNumber: '09123456789',
    gender: 'Male',
    age: 32,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '2',
    fullName: 'Maria Santos',
    phoneNumber: '09187654321',
    gender: 'Female',
    age: 25,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '3',
    fullName: 'Pedro Reyes',
    phoneNumber: '09234567890',
    gender: 'Male',
    age: 45,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '4',
    fullName: 'Ana Garcia',
    phoneNumber: '09345678901',
    gender: 'Female',
    age: 28,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '5',
    fullName: 'Miguel Lopez',
    phoneNumber: '09456789012',
    gender: 'Male',
    age: 35,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '6',
    fullName: 'Sofia Rodriguez',
    phoneNumber: '09567890123',
    gender: 'Female',
    age: 23,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '7',
    fullName: 'Carlos Martinez',
    phoneNumber: '09678901234',
    gender: 'Male',
    age: 41,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '8',
    fullName: 'Isabella Santos',
    phoneNumber: '09789012345',
    gender: 'Female',
    age: 52,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '9',
    fullName: 'Luis Fernandez',
    phoneNumber: '09890123456',
    gender: 'Male',
    age: 29,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '10',
    fullName: 'Carmen Torres',
    phoneNumber: '09901234567',
    gender: 'Female',
    age: 38,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '11',
    fullName: 'Ramon Aquino',
    phoneNumber: '09112233445',
    gender: 'Male',
    age: 43,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '12',
    fullName: 'Patricia Lim',
    phoneNumber: '09223344556',
    gender: 'Female',
    age: 26,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '13',
    fullName: 'Antonio Tan',
    phoneNumber: '09334455667',
    gender: 'Male',
    age: 47,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '14',
    fullName: 'Elena Cruz',
    phoneNumber: '09445566778',
    gender: 'Female',
    age: 31,
    civilStatus: 'Separated',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '15',
    fullName: 'Ricardo Bautista',
    phoneNumber: '09556677889',
    gender: 'Male',
    age: 39,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '16',
    fullName: 'Diana Reyes',
    phoneNumber: '09667788990',
    gender: 'Female',
    age: 27,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '17',
    fullName: 'Marco dela Torre',
    phoneNumber: '09778899001', 
    gender: 'Female',
    age: 44,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',  
  },
  {
    id: '18',
    fullName: 'Rosa Villanueva',
    phoneNumber: '09889900112',
    gender: 'Female',
    age: 44,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '19',
    fullName: 'Gabriel Santos',
    phoneNumber: '09990011223',
    gender: 'Male',
    age: 33,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '20',
    fullName: 'Victoria Garcia',
    phoneNumber: '09100112233',
    gender: 'Female',
    age: 30,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '21',
    fullName: 'Fernando Lopez',
    phoneNumber: '09211223344',
    gender: 'Male',
    age: 48,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '22',
    fullName: 'Teresa Mendoza',
    phoneNumber: '09322334455',
    gender: 'Female',
    age: 24,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '23',
    fullName: 'Andres Bonifacio',
    phoneNumber: '09433445566',
    gender: 'Male',
    age: 42,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '24',
    fullName: 'Clara Luna',
    phoneNumber: '09544556677',
    gender: 'Female',
    age: 29,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '25',
    fullName: 'Manuel Quezon',
    phoneNumber: '09655667788',
    gender: 'Male',
    age: 37,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '26',
    fullName: 'Lucia Gomez',
    phoneNumber: '09766778899',
    gender: 'Female',
    age: 34,
    civilStatus: 'Separated',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '27',
    fullName: 'Roberto Cruz',
    phoneNumber: '09877889900',
    gender: 'Male',
    age: 45,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '28',
    fullName: 'Carmen Silang',
    phoneNumber: '09988990011',
    gender: 'Female',
    age: 28,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '29',
    fullName: 'Diego Rivera',
    phoneNumber: '09199001122',
    gender: 'Male',
    age: 39,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '30',
    fullName: 'Isabel Santos',
    phoneNumber: '09210011223',
    gender: 'Female',
    age: 31,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '31',
    fullName: 'Rafael Torres',
    phoneNumber: '09321122334',
    gender: 'Male',
    age: 40,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '32',
    fullName: 'Aurora Reyes',
    phoneNumber: '09432233445',
    gender: 'Female',
    age: 35,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '33',
    fullName: 'Pablo Luna',
    phoneNumber: '09543344556',
    gender: 'Male',
    age: 46,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '34',
    fullName: 'Beatriz Garcia',
    phoneNumber: '09654455667',
    gender: 'Female',
    age: 27,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '35',
    fullName: 'Emilio Santos',
    phoneNumber: '09765566778',
    gender: 'Male',
    age: 43,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '36',
    fullName: 'Margarita Cruz',
    phoneNumber: '09876677889',
    gender: 'Female',
    age: 32,
    civilStatus: 'Separated',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '37',
    fullName: 'Joaquin Ramos',
    phoneNumber: '09987788990',
    gender: 'Male',
    age: 38,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '38',
    fullName: 'Catalina Reyes',
    phoneNumber: '09198899001',
    gender: 'Female',
    age: 29,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '39',
    fullName: 'Lorenzo dela Cruz',
    phoneNumber: '09219900112',
    gender: 'Male',
    age: 41,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '40',
    fullName: 'Dolores Santos',
    phoneNumber: '09320011223',
    gender: 'Female',
    age: 36,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '41',
    fullName: 'Felipe Torres',
    phoneNumber: '09431122334',
    gender: 'Male',
    age: 44,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '42',
    fullName: 'Regina Lopez',
    phoneNumber: '09542233445',
    gender: 'Female',
    age: 30,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '43',
    fullName: 'Salvador Garcia',
    phoneNumber: '09653344556',
    gender: 'Male',
    age: 47,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '44',
    fullName: 'Pilar Bautista',
    phoneNumber: '09764455667',
    gender: 'Female',
    age: 33,
    civilStatus: 'Separated',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '45',
    fullName: 'Raul Martinez',
    phoneNumber: '09875566778',
    gender: 'Male',
    age: 42,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '46',
    fullName: 'Camila Reyes',
    phoneNumber: '09986677889',
    gender: 'Female',
    age: 28,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '47',
    fullName: 'Oscar Santos',
    phoneNumber: '09197788990',
    gender: 'Male',
    age: 39,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '48',
    fullName: 'Luisa Cruz',
    phoneNumber: '09218899001',
    gender: 'Female',
    age: 34,
    civilStatus: 'Widowed',
    voterStatus: 'Registered',
    employmentStatus: 'Unemployed',
  },
  {
    id: '49',
    fullName: 'Arturo Luna',
    phoneNumber: '09329900112',
    gender: 'Male',
    age: 45,
    civilStatus: 'Married',
    voterStatus: 'Registered',
    employmentStatus: 'Employed',
  },
  {
    id: '50',
    fullName: 'Maricela Torres',
    phoneNumber: '09430011223',
    gender: 'Female',
    age: 31,
    civilStatus: 'Single',
    voterStatus: 'Not Registered',
    employmentStatus: 'Unemployed',
  }
];

const TableChart = ({ user }) => {
  const [residents, setResidents] = useState(dummyResidents);
  const [searchResident, setSearchResident] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        // Using dummy data instead of Firebase fetch
        setResidents(dummyResidents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching residents:', error);
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

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

  const getStats = () => {
    const filteredData = getFilteredResidents();
    
    const stats = {
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

    return stats;
  };

  const currentStats = getStats();

  const filterTabs = [
    'all', 
    'male', 
    'female',
    'registered', 
    'unregistered', 
    'employed', 
    'unemployed'
  ];

  const filteredResidents = getFilteredResidents();

  const handleExportToExcel = () => {
    const exportData = filteredResidents.map(resident => ({
      'Full Name': resident.fullName,
      'Phone Number': resident.phoneNumber || 'N/A',
      'Civil Status': resident.civilStatus,
      'Voter Status': resident.voterStatus,
      'Employment Status': resident.employmentStatus
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Residents");
    XLSX.writeFile(wb, `Residents_${new Date().toLocaleDateString()}.xlsx`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableContent = document.getElementById('printableTable').innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Resident Information</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: center; 
            }
            th { 
              background-color: #f8f9fa;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-badge {
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 500;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-date {
              text-align: right;
              margin-bottom: 20px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Resident Information Report</h2>
          </div>
          <div class="print-date">
            Date Printed: ${new Date().toLocaleDateString()}
          </div>
          ${tableContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.print();
      // Optional: Close the window after printing
      // printWindow.close();
    };
  };

  const getAgeDistributionData = () => {
    const ageGroups = [
      { name: '18-25', value: 0 },
      { name: '26-35', value: 0 },
      { name: '36-45', value: 0 },
      { name: '46-55', value: 0 },
      { name: '56+', value: 0 }
    ];

    residents.forEach(resident => {
      const age = resident.age;
      if (age >= 18 && age <= 25) {
        ageGroups[0].value++;
      } else if (age >= 26 && age <= 35) {
        ageGroups[1].value++;
      } else if (age >= 36 && age <= 45) {
        ageGroups[2].value++;
      } else if (age >= 46 && age <= 55) {
        ageGroups[3].value++;
      } else {
        ageGroups[4].value++;
      }
    });

    return ageGroups;
  };

  const getGenderDistributionData = () => {
    const genderCounts = { male: 0, female: 0 };

    residents.forEach(resident => {
      genderCounts[resident.gender.toLowerCase()]++;
    });

    return [
      { name: 'Male', value: genderCounts.male },
      { name: 'Female', value: genderCounts.female }
    ];
  };

  const getVoterStatusData = () => {
    const registeredCount = residents.filter(r => r.voterStatus === 'Registered').length;
    const notRegisteredCount = residents.filter(r => r.voterStatus === 'Not Registered').length;

    return [
      { name: 'Registered Voters', value: registeredCount },
      { name: 'Not Registered Voters', value: notRegisteredCount },
    ];
  };

  const getEmploymentStatusData = () => {
    const employedCount = residents.filter(r => r.employmentStatus === 'Employed').length;
    const unemployedCount = residents.filter(r => r.employmentStatus === 'Unemployed').length;

    return [
      { name: 'Employed', value: employedCount },
      { name: 'Unemployed', value: unemployedCount },
    ];
  };

  const toggleAnalytics = () => {
    setShowAnalytics(prev => !prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1679AB]"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">{currentStats.label}</p>
                <h4 className="text-2xl font-bold text-blue-900">{currentStats.total}</h4>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Registered Voters</p>
                <h4 className="text-2xl font-bold text-green-900">{currentStats.registered}</h4>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Employed Residents</p>
                <h4 className="text-2xl font-bold text-purple-900">{currentStats.employed}</h4>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search, Actions, and Table Container with Maximize Button */}
        <div className="relative">
          <button
            onClick={() => setIsMaximized(true)}
            className="absolute top-1 right-1 p-1 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <ChartNoAxesCombined size={25} className="text-[#1679ab]" />
          </button>

          {/* Filter and Search Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
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

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search residents..."
                  value={searchResident}
                  onChange={(e) => setSearchResident(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-[#1679AB] text-white px-4 py-2 rounded-lg"
                >
                  <Printer size={18} />
                  Print
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2 bg-[#1679AB] text-white px-4 py-2 rounded-lg"
                >
                  <Download size={18} />
                  Export
                </motion.button>
              </div>
            </div>
          </div>

          {/* Residents Table */}
          <div id="printableTable" className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Civil Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Voter Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 text-center">
                            {resident.fullName}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="text-sm  text-center">
                            {resident.phoneNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="text-sm  text-center">
                            {resident.gender}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="text-sm  text-center">
                            {resident.age}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-0.5 text-xs font-sm rounded-full ${
                              resident.civilStatus === 'Single' 
                                ? '-700'
                                : resident.civilStatus === 'Married' 
                                ? ''
                                : resident.civilStatus === 'Widowed'
                                ? ''
                                : '' // for Separated
                            }`}>
                              {resident.civilStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-0.5 text-xs font-sm rounded-full ${
                              resident.voterStatus === 'Registered' 
                                ? '' 
                                : ''
                            }`}>
                              {resident.voterStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-0.5 text-xs font-sm rounded-full ${
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
          <div className="text-sm text-gray-500">
            Showing {filteredResidents.length} of {residents.length} residents
          </div>
        </div>

        {/* Maximized Modal for Data Visualization */}
        <AnimatePresence>
          {isMaximized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0  bg-opacity-10 z-50 flex items-center justify-center p-4"
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
                  <h2 className="text-lg font-semibold text-gray-800">Demographic Insights for Barangay</h2>
                  <button
                    onClick={() => setIsMaximized(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6 overflow-y-auto h-[calc(95vh-64px)]">
                  <AgeDistributionChart data={getAgeDistributionData()} />
                  <GenderDistributionChart data={getGenderDistributionData()} />
                  <VoterStatusChart data={getVoterStatusData()} />
                  <EmploymentStatusChart data={getEmploymentStatusData()} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default TableChart;