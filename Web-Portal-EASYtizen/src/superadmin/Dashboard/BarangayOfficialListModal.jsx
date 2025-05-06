import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Building2, Search, X, ChevronLeft, ChevronUp, ChevronDown, Pencil, Trash2, Edit2Icon, UserRoundPen, Printer, FileSpreadsheet } from "lucide-react";
import { getBarangayLogo } from '../../components/common/img/barangaylogos';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import EditOfficialModal from './EditOfficialModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import * as XLSX from 'xlsx';

const OfficialTable = ({ officials, loading, selectedBarangay, onOfficialUpdated }) => {
  const [searchOfficial, setSearchOfficial] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, official: null });
  const [editModal, setEditModal] = useState({ isOpen: false, official: null });

  // Filter officials based on search
  const filteredOfficials = officials.filter(official => 
    official.name?.toLowerCase().includes(searchOfficial.toLowerCase()) ||
    official.position?.toLowerCase().includes(searchOfficial.toLowerCase())
  );

  const handleEdit = (official) => {
    setEditModal({ isOpen: true, official });
  };

  const handleDelete = (official) => {
    setDeleteModal({ isOpen: true, official });
  };

  const handleEditSave = async (formData) => {
    try {
      const officialRef = doc(db, 'barangayOfficials', editModal.official.id);
      await updateDoc(officialRef, {
        ...formData,
        updatedAt: new Date()
      });

      toast.success('Official updated successfully');
      setEditModal({ isOpen: false, official: null });
      if (onOfficialUpdated) onOfficialUpdated(selectedBarangay);
    } catch (error) {
      console.error('Error updating official:', error);
      toast.error('Failed to update official');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'barangayOfficials', deleteModal.official.id));
      toast.success('Official deleted successfully');
      setDeleteModal({ isOpen: false, official: null });
      if (onOfficialUpdated) onOfficialUpdated(selectedBarangay);
    } catch (error) {
      console.error('Error deleting official:', error);
      toast.error('Failed to delete official');
    }
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
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search officials..."
            value={searchOfficial}
            onChange={(e) => setSearchOfficial(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
          />
        </div>

        {/* Officials Table */}
        <div className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <div className="max-h-[610px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Contact Number
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Term Start
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Term End
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOfficials.map((official) => (
                    <motion.tr 
                      key={official.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {official.name}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {official.position}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {official.contactNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {official.email}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {official.termStart}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {official.termEnd}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(official)}
                            className="p-2 text-[#1679ab] hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit Official"
                          >
                            <UserRoundPen size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(official)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Official"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditOfficialModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, official: null })}
        official={editModal.official}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, official: null })}
        onConfirm={confirmDelete}
        officialName={deleteModal.official?.name}
      />
    </>
  );
};

const BarangayOfficialListModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [barangayList, setBarangayList] = useState([]);
  const [uniqueBarangays, setUniqueBarangays] = useState([]);

  // Fetch all unique barangays that have officials
  useEffect(() => {
    const fetchUniqueBarangays = async () => {
      try {
        const officialsRef = collection(db, 'barangayOfficials');
        const querySnapshot = await getDocs(officialsRef);
        const barangays = new Set();
        
        querySnapshot.forEach((doc) => {
          const barangayId = doc.data().barangayId;
          if (barangayId) {
            barangays.add(barangayId);
          }
        });
        
        setUniqueBarangays(Array.from(barangays).sort());
      } catch (error) {
        console.error('Error fetching barangays:', error);
      }
    };

    fetchUniqueBarangays();
  }, []);

  const fetchOfficials = async (barangayName) => {
    setLoading(true);
    try {
      const officialsRef = collection(db, 'barangayOfficials');
      const q = query(officialsRef, where('barangayId', '==', barangayName));
      const querySnapshot = await getDocs(q);

      const officialsData = [];
      querySnapshot.forEach((doc) => {
        officialsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setOfficials(officialsData);
    } catch (error) {
      console.error('Error fetching officials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter barangays based on search term
  const filteredBarangays = uniqueBarangays.filter(barangay =>
    barangay.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBarangayClick = (barangay) => {
    setSelectedBarangay(barangay);
    fetchOfficials(barangay);
  };

  // Handle Excel Export
  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = officials.map(official => ({
      'Full Name': official.name,
      'Position': official.position,
      'Contact Number': official.contactNumber || 'N/A',
      'Email': official.email,
      'Term Start': official.termStart,
      'Term End': official.termEnd
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Officials");
    
    // Generate filename with barangay name and date
    const fileName = `${selectedBarangay}_Officials_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fileName);
  };

  // Handle Print
  const handlePrint = () => {
    const printContent = document.createElement('div');

    printContent.innerHTML = `
      <html>
        <head>
          <title>Barangay Officials - ${selectedBarangay}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
            }
            .print-date { 
              text-align: right; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Barangay Officials List</h2>
            <h3>Barangay ${selectedBarangay}</h3>
          </div>
          <div class="print-date">
            Generated on: ${new Date().toLocaleString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Position</th>
                <th>Contact Number</th>
                <th>Email</th>
                <th>Term Start</th>
                <th>Term End</th>
              </tr>
            </thead>
            <tbody>
              ${officials.map(official => `
                <tr>
                  <td>${official.name}</td>
                  <td>${official.position}</td>
                  <td>${official.contactNumber || 'N/A'}</td>
                  <td>${official.email}</td>
                  <td>${official.termStart}</td>
                  <td>${official.termEnd}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="print-date">
            Total: ${officials.length} officials
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
                {selectedBarangay ? `${selectedBarangay} Officials` : 'Officials/Barangay List'}
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
              <div className="mb-4">
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

              {/* Scrollable Barangay Grid with Scroll Buttons */}
              <div className="relative border border-gray-200 rounded-xl p-4">
                {/* Barangay Grid with ID for scrolling */}
                <div 
                  id="barangay-grid" 
                  className="max-h-[calc(100vh-250px)] overflow-y-auto scroll-smooth px-2"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
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
                            <p className="text-sm text-gray-500">Click to view officials</p>
                          </div>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronLeft size={20} className="text-[#1679AB] rotate-180" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
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
            <>
              {/* Search and Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 text-[#1679AB] bg-[#1679AB]/10 hover:bg-[#1679AB]/20 rounded-lg transition-colors"
                  >
                    <Printer size={20} />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                  <button
                    onClick={handleExportToExcel}
                    className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <FileSpreadsheet size={20} />
                    <span className="hidden sm:inline">Export Excel</span>
                  </button>
                </div>
              </div>

              <OfficialTable 
                officials={officials} 
                loading={loading}
                selectedBarangay={selectedBarangay}
                onOfficialUpdated={fetchOfficials}
              />
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BarangayOfficialListModal;