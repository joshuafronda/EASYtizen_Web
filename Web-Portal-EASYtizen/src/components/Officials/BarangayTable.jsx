import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit, Search, UserPlus, Printer, AlertCircle, X, History, Archive } from "lucide-react"; // Import X icon for exit
import { collection, addDoc, deleteDoc, getDocs, query, where, doc, updateDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from "../../firebaseConfig";

const OfficialTable = ({ user }) => {
  // Check if user is authenticated
  if (!user || !user.barangayId) {
    return <div>Loading or unauthorized...</div>;
  }
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState(""); // State for year filter
  const [officials, setOfficials] = useState([]);
  const [filteredOfficials, setFilteredOfficials] = useState([]);
  const [endedOfficials, setEndedOfficials] = useState([]); // State for ended officials
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contactNumber: '',
    email: '',
    termStart: '',
    termEnd: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOfficialId, setCurrentOfficialId] = useState(null);
  const [barangayName, setBarangayName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    officialId: null
  });
  const [showHistory, setShowHistory] = useState(false); // State to manage history visibility
  const [resolvedOfficials, setResolvedOfficials] = useState([]); // Add this state

  const positionOptions = [
    "Barangay Captain",
    "Chairperson, Bids and Awards Committee Ways and Means Social Services",
    "Chairperson, Committee on Infrastracture Agriculture",
    "Chairperson, Committee on Education Environment",
    "Chairperson, Committee on Appropriation Sports and Development Committee on Health",
    "Chairperson, Committee on Health Culture and Tourism",
    "Chairperson, Committee on Peace and Order",
    "Chairperson, Committee on Gender and Development",
    "Chairperson, Sangguniang Kabataan (SK)",
    "Secretary",
    "Treasurer"
  ];

  useEffect(() => {
    fetchOfficials();
    fetchBarangayData(); // Fetch barangay name
  }, [user]);

  useEffect(() => {
    // Filter officials based on search term and year filter
    const activeOfficials = officials.filter(official => {
      const matchesSearch = official.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter ? new Date(official.termStart).getFullYear() === parseInt(yearFilter) : true;
      return matchesSearch && matchesYear && getTermStatus(official.termEnd).status !== 'Term Ended';
    });

    const endedOfficials = officials.filter(official => getTermStatus(official.termEnd).status === 'Term Ended');

    setFilteredOfficials(activeOfficials);
    setEndedOfficials(endedOfficials);
  }, [searchTerm, yearFilter, officials]);

  useEffect(() => {
    if (!user.barangayId) return;

    const q = query(
      collection(db, 'barangayOfficials'),
      where('barangayId', '==', user.barangayId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const officialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter officials with ended terms
      const endedOfficials = officialsData.filter(official => 
        getTermStatus(official.termEnd).status === 'Term Ended'
      );
      
      setResolvedOfficials(endedOfficials);
    });

    return () => unsubscribe();
  }, [user.barangayId]);

  useEffect(() => {
    const checkTermStatus = async () => {
      const today = new Date();
      
      officials.forEach(async (official) => {
        const termEndDate = new Date(official.termEnd);
        
        // Check if term has ended and status is still Active
        if (today > termEndDate && official.status === 'Active') {
          try {
            // Update the official's status to TermEnded
            const officialRef = doc(db, 'barangayOfficials', official.id);
            await updateDoc(officialRef, {
              status: 'TermEnded',
              updatedAt: serverTimestamp()
            });
          } catch (error) {
            console.error('Error updating official status:', error);
          }
        }
      });
    };

    // Run the check when officials data changes
    if (officials.length > 0) {
      checkTermStatus();
    }

    // Set up an interval to check daily
    const intervalId = setInterval(checkTermStatus, 24 * 60 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [officials]);

  const fetchOfficials = async () => {
    try {
      const q = query(collection(db, 'barangayOfficials'), where("barangayId", "==", user.barangayId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const officialsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOfficials(officialsData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching officials:', error);
    }
  };

  const fetchBarangayData = async () => {
    if (user && user.barangayId) {
      const q = query(collection(db, 'barangays'), where('id', '==', user.barangayId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setBarangayName(doc.data().name); // Assuming the barangay's name is stored in the field 'name'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactNumberChange = (e) => {
    const { value } = e.target;
    // Only allow numbers and limit to 11 digits
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, contactNumber: numbersOnly }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.role !== 'admin') {
        return;
      }

      const officialData = {
        ...formData,
        barangayId: user.barangayId,
        updatedAt: serverTimestamp(),
        status: 'Active',
      };

      if (isEditing) {
        await updateDoc(doc(db, 'barangayOfficials', currentOfficialId), officialData);
      } else {
        await addDoc(collection(db, 'barangayOfficials'), {
          ...officialData,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error adding/updating official:", error);
    }
  };

  const handleEdit = (official) => {
    if (user.role !== 'admin') {
      return; // Just return if not admin
    }
    setFormData({
      name: official.name,
      position: official.position,
      contactNumber: official.contactNumber,
      email: official.email,
      termStart: official.termStart,
      termEnd: official.termEnd,
    });
    setCurrentOfficialId(official.id);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (user.role !== 'admin') {
      return; // Just return if not admin
    }
    setDeleteConfirmation({ isOpen: true, officialId: id });
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'barangayOfficials', deleteConfirmation.officialId));
    } catch (error) {
      console.error("Error deleting official:", error);
    }
    setDeleteConfirmation({ isOpen: false, officialId: null });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      contactNumber: '',
      email: '',
      termStart: '',
      termEnd: '',
    });
    setIsAdding(false);
    setIsEditing(false);
    setCurrentOfficialId(null);
  };

  const getTermStatus = (termEnd) => {
    const today = new Date();
    const endDate = new Date(termEnd);
    const monthsLeft = (endDate - today) / (1000 * 60 * 60 * 24 * 30); // Approximate months

    if (today > endDate) {
      return { color: 'bg-red-100 text-red-800', status: 'Term Ended' };
    } else if (monthsLeft <= 3) {
      return { color: 'bg-yellow-100 text-yellow-800', status: 'Ending Soon' };
    } else {
      return { color: 'bg-green-100 text-green-800', status: 'Active' };
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('officialsTable');
    const rows = Array.from(printContent.getElementsByTagName('tr')); // Get all rows from the table
    const filteredRows = rows.map(row => {
      const cells = Array.from(row.getElementsByTagName('td')); // Get all cells in the row
      return `<tr>${cells.slice(0, -1).map(cell => cell.outerHTML).join('')}</tr>`; // Exclude the last cell (Actions column)
    }).join('');

    const newWindow = window.open('', '', 'width=800,height=600'); // Open a new window
    newWindow.document.write(`
      <html>
        <head>
          <title>Print Officials</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h2 {
              text-align: center;
            }
            .date {
              text-align: center;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f1f1f1;
            }
            footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #555;
            }
          </style>
          <div class="date">${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                <th>Official ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Term Duration</th>
                <th>Term Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRows}
            </tbody>
          </table>
          <footer>
          </footer>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print(); // Trigger the print dialog
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory); // Toggle history visibility
  };

  const handlePrintOfHistory = () => {
    // Filter officials whose term has ended
    const termEndedOfficials = resolvedOfficials.filter(official => {
        const termEndDate = new Date(official.termEnd);
        const currentDate = new Date();
        return termEndDate < currentDate; // Include only those whose term has ended
    });

    // Check if there are any officials to print
    if (termEndedOfficials.length === 0) {
        alert('No officials with ended terms found.');
        return; // Exit if no rows to print
    }

    // Create the print content
    const printContent = termEndedOfficials.map(official => `
        <tr>
            <td>${official.id}</td>
            <td>${official.name}</td>
            <td>${official.position}</td>
            <td>${official.contactNumber}</td>
            <td>${official.email}</td>
            <td>${new Date(official.termEnd).toLocaleDateString()}</td>
            <td>TermEnded</td>
        </tr>
    `).join('');

    const newWindow = window.open('', '', 'width=800,height=600'); // Open a new window
    newWindow.document.write(`
      <html>
        <head>
          <title>Print Officials</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h2 {
              text-align: center;
            }
            .date {
              text-align: center;
              font-size: 14px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="date">${new Date().toLocaleDateString()}</div>
          <h2>Officials with Ended Terms</h2>
          <table>
            <thead>
              <tr>
                <th>Official ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Term End</th>
                <th>Term Status</th>
              </tr>
            </thead>
            <tbody>
              ${printContent}
            </tbody>
          </table>
          <footer>
            Printed on ${new Date().toLocaleDateString()}
          </footer>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print(); // Trigger the print dialog
};

  return (
    <>
      <motion.div
        className="relative bg-white bg-opacity-20 rounded-xl p-5 border border-white mb-8"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
          <div className="flex space-x-3">
            <button 
              className="flex items-center bg-[#1679AB] text-white rounded-full px-6 py-2"
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
            >
              <UserPlus className="mr-3" size={20}/> 
              Add Barangay Officials 
            </button>
            <button 
              className="flex items-center bg-[#1679AB] text-white rounded-full px-4 py-2"
              onClick={toggleHistory}
            >
              <History className="mr-2" size={20} />
              History {resolvedOfficials.length > 0 && `(${resolvedOfficials.length})`}
            </button>
            <button 
              className="flex items-center bg-[#1679AB] text-white rounded-full px-4 py-2"
              onClick={handlePrint}
            >
              <Printer className="mr-2" size={20} />
              Print
            </button>
          </div>
        </div>

        {/* Main Table for Active Officials */}
        <div className="bg-white rounded-lg max-h-[600px] shadow-md overflow-y-auto">
          <table id="officialsTable" className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Official ID</th>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Name</th>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Position</th>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Contact</th>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Email</th>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Term Duration</th>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Term Status</th>
                <th className="px-2 py-4 text-center text-xs font-medium text-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOfficials.map((official, index) => {
                const termStatus = getTermStatus(official.termEnd);
                return (
                  <tr key={official.id}>
                    <td className="px-2 py-3 whitespace-nowrap text-center" style={{ fontSize: '0.75rem' }}>
                      {`OFFICIAL-${new Date(official.termEnd).getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-center" style={{ fontSize: '0.75rem' }}>{official.name}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-[#1679ab] italic text-center" style={{ fontSize: '0.75rem' }}>
                      {official.position.split(' ').map((word, index) => (
                        <span key={index}>
                          {word}
                          {index === 0 ? <br /> : null} {/* Add a line break after the first word */}
                        </span>
                      ))}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-center" style={{ fontSize: '0.75rem' }}>{official.contactNumber}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-center" style={{ fontSize: '0.75rem' }}>{official.email}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-center" style={{ fontSize: '0.75rem' }}>
                      {new Date(official.termStart).toLocaleDateString()} - {new Date(official.termEnd).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center" style={{ fontSize: '0.75rem' }}>
                      <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${termStatus.color}`}>
                        {termStatus.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-3">
                        <Edit 
                          className="cursor-pointer text-[#1679AB]" 
                          size={20} 
                          onClick={() => handleEdit(official)}
                          title="Edit Official"
                        />
                        <Trash2 
                          className="cursor-pointer text-red-500" 
                          size={20} 
                          onClick={() => handleDelete(official.id)}
                          title="Delete Official"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
{/* History Section */}
{showHistory && (
    <motion.div
        className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <motion.div
            className="bg-white shadow-2xl rounded-2xl w-[900px] max-h-[90vh] mx-auto relative flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="p-6">
                {/* Fixed Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <div className="flex items-center">
                        <div className="bg-[#1679AB] bg-opacity-10 p-3 rounded-xl mr-4">
                            <History className="text-[#1679AB]" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl italic font-semibold text-[#1679AB]">Officials History</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {resolvedOfficials.length} ended {resolvedOfficials.length === 1 ? 'term' : 'terms'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search in history..."
                                    className="w-full bg-gray-50 text-gray-600 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
                                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={toggleHistory}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Year Filter Tabs */}
                <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                    {Array.from(new Set(resolvedOfficials.map(official => 
                        new Date(official.termEnd).getFullYear()
                    ))).sort((a, b) => b - a).map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                                ${selectedYear === year 
                                    ? 'bg-[#1679AB] text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {year}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedYear(null)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                            ${!selectedYear 
                                ? 'bg-[#1679AB] text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All Years
                    </button>
                    <button
                        onClick={handlePrintOfHistory}
                        className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#1679AB] text-white hover:bg-[#136290] transition-colors"
                    >
                        <Printer size={16} className="inline-block mr-1" />
                        Print
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-250px)]">
                    {resolvedOfficials.length > 0 ? (
                        <div className="space-y-4">
                            {resolvedOfficials.map((official, index) => {
                                // Determine the term status
                                const termEndDate = new Date(official.termEnd);
                                const currentDate = new Date();
                                const termStatus = termEndDate < currentDate ? 'TermEnded' : 'Active'; // Determine status

                                return (
                                    <motion.div
                                        key={official.id}
                                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <span className="bg-[#1679AB] text-white px-3 py-1 rounded-full text-sm font-medium">
                                                        {`OFFICIAL-${termEndDate.getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Term End: {termEndDate.toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-500 mb-1">Official Name</p>
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {official.name}
                                                        </h4>
                                                        <p className="text-sm text-[#1679ab] italic mt-1">
                                                            {official.position}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-500 mb-1">Contact Details</p>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Phone:</span> {official.contactNumber}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Email:</span> {official.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side - Actions */}
                                            <div className="ml-6">
                                                <button
                                                    onClick={() => handleEdit(official)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-[#1679AB] text-sm font-medium rounded-full text-[#1679AB] bg-white hover:bg-gray-50 transition-colors"
                                                >
                                                    <Edit size={14} className="mr-1.5" />
                                                    Edit Details
                                                </button>
                                            </div>
                                        </div>
                                        {/* New Term Status Field */}
                                        <div className="mt-2">
                                            <span className="text-sm font-medium">Term Status: </span>
                                            <span className={`text-sm ${termStatus === 'TermEnded' ? 'text-red-500' : 'text-green-500'}`}>
                                                {termStatus}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-xl">
                            <History size={48} className="text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No completed terms found</p>
                            <p className="text-sm text-gray-400">All completed terms will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    </motion.div>
)}

        {/* Add Official Form */}
{isAdding && (
    <motion.div
        className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <motion.div
            className="bg-white shadow-2xl rounded-2xl w-[900px] max-h-[90vh] mx-auto relative flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header - Fixed at top */}
            <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
                <div className="flex items-center">
                    <div className="bg-[#1679AB] bg-opacity-10 p-3 rounded-xl mr-4">
                        <UserPlus className="text-[#1679AB]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl italic font-semibold text-[#1679AB]">
                            {isEditing ? 'Edit Official' : 'Add Official'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Fill in the information below to {isEditing ? 'update' : 'add'} an official
                        </p>
                    </div>
                    <button 
                        onClick={resetForm}
                        className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Form Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 pb-24">
                <form id="officialForm" onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Personal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Position
                                </label>
                                <select
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Position</option>
                                    {positionOptions.map((position, index) => (
                                        <option key={index} value={position}>{position}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleContactNumberChange}
                                    pattern="[0-9]{11}"
                                    maxLength="11"
                                    placeholder="09XXXXXXXXX"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Term Details Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Term Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Term Start
                                </label>
                                <input
                                    type="date"
                                    name="termStart"
                                    value={formData.termStart}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Term End
                                </label>
                                <input
                                    type="date"
                                    name="termEnd"
                                    value={formData.termEnd}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 rounded-b-2xl">
                <div className="flex justify-end space-x-4">
                    <button 
                        type="button" 
                        onClick={resetForm}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        form="officialForm"
                        className="px-4 py-2 text-sm font-medium text-white bg-[#1679ab] rounded-lg hover:bg-[#136290] transition-colors"
                    >
                        {isEditing ? 'Update Official' : 'Add Official'}
                    </button>
                </div>
            </div>
        </motion.div>
    </motion.div>
)}
      </motion.div>
      {deleteConfirmation.isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl max-w-sm w-full mx-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center">
              <AlertCircle 
                className="w-16 h-16 text-red-500 mb-4" 
                strokeWidth={1.5}
              />
              <h3 className="text-xl font-medium text-center mb-2">Delete Confirmation</h3>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete this official? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDelete}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, officialId: null })}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default OfficialTable;