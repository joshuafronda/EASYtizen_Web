import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from 'react';
import { ChevronDown, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Dummy data generator function
const generateDummyData = () => {
  const barangayData = {
    'Alalum': { male: 35, female: 38 },
    'Antipolo': { male: 42, female: 44 },
    'Balimbing': { male: 39, female: 43 },
    'Banaba': { male: 43, female: 45 },
    'Bayanan': { male: 37, female: 39 },
    'Danglayan': { male: 36, female: 38 },
    'Del Pilar': { male: 39, female: 41 },
    'Gelerang Kawayan': { male: 38, female: 42 },
    'Ilat North': { male: 34, female: 36 },
    'Ilat South': { male: 35, female: 37 },
    'Kaingin': { male: 37, female: 39 },
    'Laurel': { male: 39, female: 42 },
    'Malaking Pook': { male: 38, female: 41 },
    'Mataas na Lupa': { male: 35, female: 37 },
    'Natunuan North': { male: 36, female: 38 },
    'Natunuan South': { male: 34, female: 36 },
    'Padre Castillo': { male: 35, female: 37 },
    'Palsahingin': { male: 39, female: 42 },
    'Pila': { male: 38, female: 41 },
    'Poblacion': { male: 47, female: 49 },
    'Pook ni Banal': { male: 34, female: 36 },
    'Pook ni Kapitan': { male: 38, female: 41 },
    'Resplandor': { male: 39, female: 42 },
    'Sambat': { male: 35, female: 37 },
    'San Antonio': { male: 39, female: 42 },
    'San Mariano': { male: 36, female: 38 },
    'San Mateo': { male: 37, female: 39 },
    'Santa Elena': { male: 39, female: 42 },
    'Santo Niño': { male: 38, female: 41 }
  };
  return barangayData;
};

const CategoryGender = () => {
  // State declarations
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genderData, setGenderData] = useState([
    { name: "Male", value: 0, color: "#1679AB" },
    { name: "Female", value: 0, color: "#FF69B4" },
  ]);

  // List of barangays
  const barangays = [
    'All Barangays',
    ...Object.keys(generateDummyData())
  ];

  // Data filtering logic
  useEffect(() => {
    const updateGenderData = () => {
      try {
        setLoading(true);
        const dummyData = generateDummyData();

        if (selectedBarangay === 'all') {
          const totalMale = Object.values(dummyData).reduce((sum, brgy) => sum + brgy.male, 0);
          const totalFemale = Object.values(dummyData).reduce((sum, brgy) => sum + brgy.female, 0);
          
          setGenderData([
            { name: "Male", value: totalMale, color: "#1679AB" },
            { name: "Female", value: totalFemale, color: "#FF69B4" }
          ]);
        } else {
          const barangayStats = dummyData[selectedBarangay];
          setGenderData([
            { name: "Male", value: barangayStats.male, color: "#1679AB" },
            { name: "Female", value: barangayStats.female, color: "#FF69B4" }
          ]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    updateGenderData();
  }, [selectedBarangay]);

  // Calculate total residents
  const totalResidents = genderData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    
    return (
      <div className="bg-white p-2 rounded-lg shadow-md border border-gray-100">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm text-[#1679AB]">{payload[0].value} residents</p>
      </div>
    );
  };

  // Print function
  const handlePrint = () => {
    const printContent = document.getElementById('gender-chart-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gender Distribution Report</title>
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
              <h1 class="title">Gender Distribution Report</h1>
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

  // Download PDF function
  const handleDownloadPDF = async () => {
    try {
      const content = document.getElementById('gender-chart-content');
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
      pdf.text('Gender Distribution Report', pageWidth/2, 20, { align: 'center' });
      
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

      pdf.save(`Gender_Distribution_${selectedBarangay}_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="relative">
      {/* Action Buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        {/* Barangay Filter */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-sm text-gray-600">
              {selectedBarangay === 'all' ? 'All Barangays' : selectedBarangay}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20 max-h-64 overflow-y-auto"
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

        {/* Print and Download buttons */}
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

      {/* Main Chart Container */}
      <motion.div
        id="gender-chart-container"
        className="bg-white rounded-lg p-6 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Chart Content */}
        <div id="gender-chart-content">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Gender Distribution
              {selectedBarangay !== 'all' && ` - ${selectedBarangay}`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalResidents.toLocaleString()} total residents
            </p>
          </div>

          {/* Chart */}
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
                      data={genderData}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
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
              <p className="text-sm text-gray-500">Total Residents</p>
              <p className="text-base font-medium text-[#1679AB]">
                {totalResidents.toLocaleString()}
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Gender Ratio</p>
              <p className="text-base font-medium text-[#1679AB]">
                {genderData[0].value}:{genderData[1].value}
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Majority Gender</p>
              <p className="text-base font-medium text-[#1679AB]">
                {genderData[0].value > genderData[1].value ? 'Male' : 'Female'}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryGender;