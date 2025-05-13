import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Search, FilePlus, Edit, Trash2, AlertCircle, FileText, Printer, X, History } from "lucide-react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BlotterTable = ({ user }) => {
  const [blotterRecords, setBlotterRecords] = useState([]);
  const [resolvedRecords, setResolvedRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordData, setRecordData] = useState({
    complainantName: '',
    respondentName: '',
    dateFiled: new Date().toISOString().split('T')[0],
    dateHappened: new Date().toISOString().split('T')[0],
    narrativeReport: '',
    contactNo: '',
    status: 'Pending',
  });
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    recordId: null
  });
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);

  const statusOptions = ['Pending', 'Under Investigation', 'Resolved'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '';
      case 'Under Investigation':
        return '';
      case 'Resolved':
        return '';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (user && user.barangayId) {
      fetchBlotterRecords();
    }
  }, [user]);

  const fetchBlotterRecords = async () => {
    try {
      const q = query(collection(db, 'blotterRecords'), where("barangayId", "==", user.barangayId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const resolved = fetchedRecords.filter(record => record.status === 'Resolved');
        const active = fetchedRecords.filter(record => record.status !== 'Resolved');

        setBlotterRecords(active);
        setResolvedRecords(resolved);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching blotter records:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecordData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactNumberChange = (e) => {
    const { value } = e.target;
    // Only allow numbers and limit to 11 digits
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
    setRecordData(prev => ({ ...prev, contactNo: numbersOnly }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.role !== 'admin') {
        alert("Only admins can add or edit records");
        return;
      }

      const newRecord = {
        ...recordData,
        barangayId: user.barangayId,
        updatedAt: serverTimestamp(),
      };

      if (editingRecord) {
        await updateDoc(doc(db, 'blotterRecords', editingRecord.id), newRecord);
      } else {
        await addDoc(collection(db, 'blotterRecords'), {
          ...newRecord,
          createdAt: serverTimestamp(),
        });
      }

      setRecordData({
        complainantName: '',
        respondentName: '',
        dateFiled: new Date().toISOString().split('T')[0],
        dateHappened: new Date().toISOString().split('T')[0],
        narrativeReport: '',
        contactNo: '',
        status: 'Pending',
      });
      setFormVisible(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error adding/updating blotter record: ", error);
      alert(`Failed to save record: ${error.message}`);
    }
  };

  const handleEdit = (record) => {
    if (user.role !== 'admin') {
      alert("Only admins can edit records");
      return;
    }
    setEditingRecord(record);
    setRecordData({
      complainantName: record.complainantName,
      respondentName: record.respondentName,
      dateFiled: record.dateFiled,
      dateHappened: record.dateHappened,
      narrativeReport: record.narrativeReport,
      contactNo: record.contactNo,
      status: record.status || 'Pending',
    });
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    if (user.role !== 'admin') {
      alert("Only admins can delete records");
      return;
    }
    setDeleteConfirmation({ isOpen: true, recordId: id });
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'blotterRecords', deleteConfirmation.recordId));
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting blotter record:", error);
      alert(`Failed to delete record: ${error.message}`);
    }
    setDeleteConfirmation({ isOpen: false, recordId: null });
  };

  const filteredRecords = blotterRecords.filter(record =>
    record.complainantName.toLowerCase().includes(searchTerm) ||
    record.respondentName.toLowerCase().includes(searchTerm) ||
    record.narrativeReport.toLowerCase().includes(searchTerm)
  );

  const generateBlotterPDF = async (record) => {
    try {
      // Create PDF document
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('BARANGAY BLOTTER RECORD', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
      // Add barangay name and date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Barangay: ${user.barangayName}`, 20, 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
  
      // Blotter details
      const startY = 50;
      const lineHeight = 10;
  
      const addField = (label, value, y) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '', 70, y);
      };
  
      addField('Blotter No:', record.id, startY);
      addField('Complainant:', record.complainantName, startY + lineHeight);
      addField('Respondent:', record.respondentName, startY + lineHeight * 2);
      addField('Date Filed:', new Date(record.dateFiled).toLocaleDateString(), startY + lineHeight * 3);
      addField('Date of Incident:', new Date(record.dateHappened).toLocaleDateString(), startY + lineHeight * 4);
      addField('Contact Number:', record.contactNo, startY + lineHeight * 5);
      addField('Status:', record.status, startY + lineHeight * 6);
  
      // Narrative Report
      doc.setFont('helvetica', 'bold');
      doc.text('NARRATIVE REPORT:', 20, startY + lineHeight * 8);
      doc.setFont('helvetica', 'normal');
  
      // Handle long narrative text with word wrap
      const splitNarrative = doc.splitTextToSize(record.narrativeReport, 170);
      doc.text(splitNarrative, 20, startY + lineHeight * 9);
  
      // Add footer
      const footerY = doc.internal.pageSize.height - 40;
      doc.setFont('helvetica', 'bold');
      doc.line(20, footerY, doc.internal.pageSize.width - 20, footerY); // Line across the page
      doc.text('Barangay Captain', doc.internal.pageSize.width / 2, footerY + 10, { align: 'center' });
  
      // Save PDF
      doc.save(`Blotter_Record_${record.id}.pdf`);
      alert('Document generated successfully!');
  
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate document');
    }
  };

  const handleViewAndPrint = (record) => {
    setPreviewRecord(record);
    setIsPreviewing(true);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory); // Toggle history visibility
  };

  const filteredHistoryRecords = resolvedRecords.filter(record =>
    record.complainantName.toLowerCase().includes(historySearchTerm) ||
    record.respondentName.toLowerCase().includes(historySearchTerm) ||
    record.narrativeReport.toLowerCase().includes(historySearchTerm)
  );

  const handlePrintOfResolvedCases = () => {
    // Filter resolved cases
    const resolvedCases = resolvedRecords.filter(record => record.status === 'Resolved');

    // Check if there are any cases to print
    if (resolvedCases.length === 0) {
        alert('No resolved cases found.');
        return; // Exit if no rows to print
    }

    // Create the print content with formatted IDs
    const printContent = resolvedCases.map((record, index) => {
        const formattedId = `BLT-${new Date(record.dateFiled).getFullYear()}-${index + 1}`; // Format the ID
        return `
            <tr>
                <td>${formattedId}</td>
                <td>${record.complainantName}</td>
                <td>${record.respondentName}</td>
                <td>${new Date(record.dateHappened).toLocaleDateString()}</td>
                <td>${record.status || 'Pending'}</td>
                <td>${new Date(record.dateFiled).toLocaleDateString()}</td>
            </tr>
        `;
    }).join('');

    const newWindow = window.open('', '', 'width=800,height=600'); // Open a new window
    newWindow.document.write(`
      <html>
        <head>
          <title>Print Resolved Cases</title>
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
          <h2>Resolved Cases</h2>
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Complainant</th>
                <th>Respondent</th>
                <th>Incident Date</th>
                <th>Status</th>
                <th>Date Filed</th>
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
        <div className="flex space-x-3">
          <button 
            className="flex items-center bg-[#1679AB] text-white rounded-full px-6 py-2"
            onClick={() => {
              if (user.role !== 'admin') {
                alert("Only admins can add records");
                return;
              }
              setEditingRecord(null);
              setRecordData({
                complainantName: '',
                respondentName: '',
                dateFiled: new Date().toISOString().split('T')[0],
                dateHappened: new Date().toISOString().split('T')[0],
                narrativeReport: '',
                contactNo: '',
                status: 'Pending',
              });
              setFormVisible(true);
            }}
          >
            <FilePlus className="mr-3" size={20}/>
            Add Blotter Record
          </button>
          <button 
            className="flex items-center bg-[#1679AB] text-white rounded-full px-6 py-2"
            onClick={toggleHistory} // Toggle history visibility
          >
            <History className="mr-3" size={20}/>
            History
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg max-h-[600px] shadow-md overflow-y-auto'>
        <table id="blotterTable" className='min-w-full divide-y divide-gray-200'>
          <thead>
            <tr>
              <th className='px-10 py-4 text-center text-xs font-medium text-black uppercase tracking-wider'>Case No.</th>
              <th className='px-10 py-4 text-center text-xs font-medium text-black uppercase tracking-wider'>Complainant</th>
              <th className='px-10 py-4 text-center text-xs font-medium text-black uppercase tracking-wider'>Respondent</th>
              <th className='px-10 py-4 text-center text-xs font-medium text-black uppercase tracking-wider'>Date Filed</th>
              <th className='px-10 py-4 text-center text-xs font-medium text-black uppercase tracking-wider'>Status</th>
              <th className='px-10 py-4 text-center text-xs font-medium text-black uppercase tracking-wider'>Action</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredRecords.map((record, index) => (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='px-10 py-4 text-center whitespace-nowrap text-sm text-black'>
                  {`BLT-${new Date(record.dateFiled).getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                </td>
                <td className='px-10 py-4 text-center whitespace-nowrap text-sm text-black'>{record.complainantName}</td>
                <td className='px-10 py-4 text-center whitespace-nowrap text-sm text-black'>{record.respondentName}</td>
                <td className='px-10 py-4 text-center whitespace-nowrap text-sm text-black'>
                  {new Date(record.dateFiled).toLocaleDateString()}
                </td>
                <td className='px-10 py-4 text-center whitespace-nowrap text-sm text-black'>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status || 'Pending'}
                  </span>
                </td>
                <td className='px-10 py-4 text-center whitespace-nowrap text-sm text-black'>
                  <div className='flex justify-center space-x-3'>
                    <button
                      className='flex items-center gap-2 px-2 py-2 rounded-lg border border-[#1679AB] text-[#1679AB] hover:bg-[#1679AB] hover:text-white transition-colors'
                      onClick={() => handleViewAndPrint(record)}
                    >
                      <FileText size={20} />
                      View & Print
                    </button>
                    <Edit 
                      className='cursor-pointer mt-2 text-[#1679ab]' 
                      size={20} 
                      onClick={() => handleEdit(record)}
                    />
                    <Trash2 
                      className='cursor-pointer mt-2  text-red-500' 
                      size={20} 
                      onClick={() => handleDelete(record.id)}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {formVisible && (
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
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center">
                    <div className="bg-[#1679AB] bg-opacity-10 p-3 rounded-xl mr-4">
                        <FileText className="text-[#1679AB]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold italic text-[#1679AB]">
                            {editingRecord ? 'Edit Blotter Record' : 'New Blotter Record'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Fill in the information below to {editingRecord ? 'update' : 'create'} a blotter record
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            setFormVisible(false);
                            setEditingRecord(null);
                        }}
                        className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Complainant Information Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Complainant Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Complainant Name
                                </label>
                                <input 
                                    type="text" 
                                    name="complainantName" 
                                    value={recordData.complainantName} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    placeholder="Enter complainant's name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Contact No.
                                </label>
                                <input 
                                    type="tel" 
                                    name="contactNo" 
                                    value={recordData.contactNo} 
                                    onChange={handleContactNumberChange}
                                    pattern="[0-9]{11}"
                                    maxLength="11"
                                    placeholder="09XXXXXXXXX"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Respondent Information Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Respondent Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Respondent Name
                                </label>
                                <input 
                                    type="text" 
                                    name="respondentName" 
                                    value={recordData.respondentName} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    placeholder="Enter respondent's name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={recordData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Incident Details Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-4">Incident Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Date Filed
                                </label>
                                <input 
                                    type="date" 
                                    name="dateFiled" 
                                    value={recordData.dateFiled} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#1679AB]">
                                    Date Happened
                                </label>
                                <input 
                                    type="date" 
                                    name="dateHappened" 
                                    value={recordData.dateHappened} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#1679AB]">
                                Narrative Report
                            </label>
                            <textarea 
                                name="narrativeReport" 
                                value={recordData.narrativeReport} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                rows="6"
                                placeholder="Enter detailed narrative report"
                                required
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button 
                            type="button" 
                            onClick={() => {
                                setFormVisible(false);
                                setEditingRecord(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1679ab] rounded-lg hover:bg-[#136290] transition-colors"
                        >
                            {editingRecord ? 'Update Record' : 'Submit Record'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    </motion.div>
)}

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
                Are you sure you want to delete this blotter record? This action cannot be undone.
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
                  onClick={() => setDeleteConfirmation({ isOpen: false, recordId: null })}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isPreviewing && previewRecord && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white border border-gray-300 p-8 rounded-xl w-full max-w-4xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Blotter Record Preview</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => generateBlotterPDF(previewRecord)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1679AB] text-white rounded-lg hover:bg-[#1e8dc5] transition-colors"
                >
                  <FileText size={18} />
                  Print Document
                </button>
                <button
                  onClick={() => setIsPreviewing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 max-h-[70vh] overflow-y-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#1679AB] mb-2">BARANGAY BLOTTER RECORD</h1>
                <p className="text-lg font-medium text-gray-600">Barangay {user.barangayName}</p>
                <p className="text-lg font-medium text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="font-semibold text-gray-700">Status:</p>
                  <span className={`px-3 py-1 text-gray-700 inline-flex leading-5 font-semibold rounded-full ${getStatusColor(previewRecord.status)}`}>
                    {previewRecord.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Complainant Name:</p>
                  <p className="text-gray-600">{previewRecord.complainantName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Respondent Name:</p>
                  <p className="text-gray-600">{previewRecord.respondentName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Date Filed:</p>
                  <p className="text-gray-600">{new Date(previewRecord.dateFiled).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Date of Incident:</p>
                  <p className="text-gray-600">{new Date(previewRecord.dateHappened).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Contact Number:</p>
                  <p className="text-gray-600">{previewRecord.contactNo}</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="font-semibold text-gray-700 mb-2">NARRATIVE REPORT:</p>
                <p className="text-gray-600 whitespace-pre-wrap p-4 bg-gray-50 rounded-lg">
                  {previewRecord.narrativeReport}
                </p>
              </div>

              <div className="text-center mt-12">
                <div className="w-48 mx-auto">
                  <div className="border-t border-gray-400 pt-2">
                    <p className="font-semibold">Barangay Captain</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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
                            <History className="text-[#1679AB] mr-3" size={28} />
                            <div>
                                <h3 className="text-2xl italic font-semibold text-[#1679AB]">Blotter History</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {resolvedRecords.length} resolved {resolvedRecords.length === 1 ? 'case' : 'cases'}
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
                        {Array.from(new Set(resolvedRecords.map(record => 
                            new Date(record.dateFiled).getFullYear()
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
                            onClick={handlePrintOfResolvedCases}
                            className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#1679AB] text-white hover:bg-[#136290] transition-colors"
                        >
                            <Printer size={16} className="inline-block mr-1" />
                            Print
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-250px)]">
                        {filteredHistoryRecords.length > 0 ? (
                            <div className="space-y-4">
                                {filteredHistoryRecords.map((record, index) => (
                                    <motion.div
                                        key={record.id}
                                        className="bg-gray-50 rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        {/* Record Content */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <span className="bg-[#1679AB] text-white px-3 py-1 rounded-full text-sm font-medium">
                                                        {`BLT-${new Date(record.dateFiled).getFullYear()}-${String(index + 1).padStart(4, '0')}`}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Filed: {new Date(record.dateFiled).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Names Section */}
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-500 mb-1">Complainant</p>
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {record.complainantName}
                                                        </h4>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-500 mb-1">Respondent</p>
                                                        <h4 className="text-lg font-semibold text-[#1679ab]">
                                                            {record.respondentName}
                                                        </h4>
                                                    </div>
                                                </div>

                                                {/* Additional Details */}
                                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Incident Date</p>
                                                        <p className="font-medium">
                                                            {new Date(record.dateHappened).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">Status</p>
                                                        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                                            {record.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side - Actions */}
                                            <div className="ml-6">
                                                <button
                                                    onClick={() => handleViewAndPrint(record)}
                                                    className="inline-flex items-center px-4 py-2 border-2 border-[#1679AB] text-sm font-medium rounded-lg text-[#1679AB] bg-white hover:bg-gray-50 transition-colors"
                                                    title="View Complete Details"
                                                >
                                                    <FileText size={16} className="mr-2" />
                                                    View & Print
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">No records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BlotterTable;
