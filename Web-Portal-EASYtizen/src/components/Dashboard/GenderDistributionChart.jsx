import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

const GenderDistributionChart = ({ data }) => {
  const totalResidents = data.reduce((acc, curr) => acc + curr.value, 0);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-[#1679AB] font-medium">{`${payload[0].value} residents`}</p>
          <p className="text-sm text-gray-500">{`${((payload[0].value / totalResidents) * 100).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  // Prepare data for the doughnut chart
  const doughnutData = [
    { name: 'Male', value: data.find(item => item.name === 'Male')?.value || 0 },
    { name: 'Female', value: data.find(item => item.name === 'Female')?.value || 0 },
  ];

  // Define colors for each segment
  const COLORS = ['#1679AB', '#f699CD']; // Green for Male, Orange for Female

  // Determine largest and smallest gender groups
  const largestGroup = data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  const smallestGroup = data.reduce((prev, current) => (prev.value < current.value) ? prev : current);

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
              <p class="subtitle>${new Date().toLocaleDateString()}</p>
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
        `Gender Distribution - ${new Date().toLocaleDateString()}`,
        pageWidth/2,
        30,
        { align: 'center' }
      );

      // Add chart
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);

      pdf.save(`Gender_Distribution_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
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
        <div id="gender-chart-content">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-medium text-gray-800">
                Gender Distribution
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {totalResidents.toLocaleString()} total residents
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={doughnutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="60%"
                paddingAngle={5}
                label
              >
                {doughnutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Largest Gender Group</p>
              <p className="text-base font-medium text-[#1679AB]">
                {largestGroup.name} ({largestGroup.value})
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Smallest Gender Group</p>
              <p className="text-base font-medium text-[#1679AB]">
                {smallestGroup.name} ({smallestGroup.value})
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-50/30 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-gray-500">Total Residents</p>
              <p className="text-base font-medium text-[#1679AB]">
                {totalResidents.toLocaleString()}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GenderDistributionChart;