import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { ChevronDown, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CategoryChart = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [documentData, setDocumentData] = useState([
    { name: "Barangay Clearance", value: 0, color: "#1679AB" },
    { name: "Certificate of Indigency", value: 0, color: "#45B3E3" },
    { name: "Certificate of Residency", value: 0, color: "#73ECFF" }
  ]);

  // Memoize barangays list
  const barangays = [
    'All Barangays',
    'Alalum', 'Antipolo', 'Balimbing', 'Banaba', 'Bayanan',
    'Danglayan', 'Del Pilar', 'Gelerang Kawayan', 'Ilat North',
    'Ilat South', 'Kaingin', 'Laurel', 'Malaking Pook',
    'Mataas na Lupa', 'Natunuan North', 'Natunuan South',
    'Padre Castillo', 'Palsahingin', 'Pila', 'Poblacion',
    'Pook ni Banal', 'Pook ni Kapitan', 'Resplandor', 'Sambat',
    'San Antonio', 'San Mariano', 'San Mateo', 'Santa Elena',
    'Santo Niño'
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchAllRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize request counts
        const requestCounts = {
          "Barangay Clearance": 0,
          "Certificate of Indigency": 0,
          "Certificate of Residency": 0
        };

        // Parallel fetching of both collections
        const [documentSnapshot, residencySnapshot] = await Promise.all([
          getDocs(collection(db, 'documentRequests')),
          getDocs(collection(db, 'residencyRequests'))
        ]);

        // Process document requests
        documentSnapshot.forEach((doc) => {
          const data = doc.data();
          if ((selectedBarangay === 'all' || data.barangayId === selectedBarangay) && 
              data.certificateType in requestCounts) {
            requestCounts[data.certificateType]++;
          }
        });

        // Process residency requests
        residencySnapshot.forEach((doc) => {
          const data = doc.data();
          if (selectedBarangay === 'all' || data.barangayId === selectedBarangay) {
            requestCounts["Certificate of Residency"]++;
          }
        });

        if (isMounted) {
          setDocumentData([
            { 
              name: "Barangay Clearance", 
              value: requestCounts["Barangay Clearance"],
              color: "#1679AB"
            },
            { 
              name: "Certificate of Indigency", 
              value: requestCounts["Certificate of Indigency"],
              color: "#45B3E3"
            },
            { 
              name: "Certificate of Residency", 
              value: requestCounts["Certificate of Residency"],
              color: "#73ECFF"
            }
          ]);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error('Error fetching requests:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllRequests();

    return () => {
      isMounted = false;
    };
  }, [selectedBarangay]);

  const totalRequests = documentData.reduce((sum, item) => sum + item.value, 0);

  // Memoized CustomTooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-3 rounded-lg shadow-md border border-gray-100"
      >
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-[#1679AB]">
          {data.value.toLocaleString()} requests
        </p>
      </motion.div>
    );
  };

  // Memoized CustomLegend component
  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-4">
      {payload.map((entry, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: activeIndex === index || activeIndex === null ? 1 : 0.6 }}
          className="flex items-center gap-2"
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">
            {entry.value}
          </span>
        </motion.div>
      ))}
    </div>
  );

  const handlePrint = () => {
    const printContent = document.getElementById('document-chart-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Requests Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .report-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { color: #1679AB; font-size: 24px; margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 16px; }
            @media print {
              body { padding: 20px; }
              .report-container { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h1 class="title">Document Requests Report</h1>
              <p class="subtitle">
                ${selectedBarangay !== 'all' ? selectedBarangay : 'All Barangays'} - 
                ${new Date().toLocaleDateString()}
              </p>
            </div>
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    };
  };

  const handleDownloadPDF = async () => {
    try {
      const content = document.getElementById('document-chart-content');
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(22, 121, 171);
      pdf.text('Document Requests Report', pageWidth/2, 20, { align: 'center' });
      
      // Add subtitle
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(
        `${selectedBarangay !== 'all' ? selectedBarangay : 'All Barangays'} - ${new Date().toLocaleDateString()}`,
        pageWidth/2,
        30,
        { align: 'center' }
      );

      // Add chart
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);

      pdf.save(`Document_Requests_${selectedBarangay}_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-sm text-gray-600">
              {selectedBarangay === 'all' ? 'All Barangays' : selectedBarangay}
            </span>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-10 max-h-64 overflow-y-auto"
              >
                {barangays.map((barangay) => (
                  <button
                    key={barangay}
                    onClick={() => {
                      setSelectedBarangay(barangay === 'All Barangays' ? 'all' : barangay);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                      ${selectedBarangay === (barangay === 'All Barangays' ? 'all' : barangay) 
                        ? 'bg-gray-50 text-[#1679AB]' 
                        : 'text-gray-600'}`}
                  >
                    {barangay}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="p-2 text-gray-600 hover:text-[#1679AB] hover:bg-gray-50 rounded-lg transition-colors"
          title="Print Chart"
        >
          <Printer size={20} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPDF}
          className="p-2 text-gray-600 hover:text-[#1679AB] hover:bg-gray-50 rounded-lg transition-colors"
          title="Download PDF"
        >
          <Download size={20} />
        </motion.button>
      </div>

      <motion.div
        className="bg-white rounded-lg p-6 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div id="document-chart-content">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-medium text-gray-800">
              Distribution of Document Requests by Type {selectedBarangay !== 'all' ? `(${selectedBarangay})` : ''}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {totalRequests.toLocaleString()} total requests
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-96"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1679AB]" />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-96 text-red-500"
              >
                Error loading data: {error}
              </motion.div>
            ) : (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-96"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentData}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {documentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} verticalAlign="bottom" height={120} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Most Requested</p>
              <p className="text-base font-medium text-[#1679AB]">
                {documentData.reduce((prev, current) => 
                  (prev.value > current.value) ? prev : current
                ).name}
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Average Requests</p>
              <p className="text-base font-medium text-[#1679AB]">
                {Math.round(totalRequests / documentData.length).toLocaleString()}
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Document Types</p>
              <p className="text-base font-medium text-[#1679AB]">
                {documentData.length}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryChart;