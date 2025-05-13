import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from "framer-motion";
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DemographicsChart = ({ data }) => {
  const totalMales = data.reduce((acc, curr) => acc + curr.male, 0);
  const totalFemales = data.reduce((acc, curr) => acc + curr.female, 0);
  const totalPopulation = totalMales + totalFemales;

  const handlePrint = () => {
    const printContent = document.getElementById('demographics-chart-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Demographics Report</title>
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
              <h1 class="title">Demographics Report</h1>
              <p class="subtitle">${new Date().toLocaleDateString()}</p>
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
      const content = document.getElementById('demographics-chart-content');
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

      pdf.setFontSize(20);
      pdf.setTextColor(22, 121, 171); // Matching the blue color
      pdf.text('Demographics Report', pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Demographics - ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);
      pdf.save(`Demographics_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <motion.div className="bg-white rounded-xl p-6 shadow-md relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Gender and Age Distribution in the Population</h2>
        <div className="flex items-center gap-3">
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
      </div>

      <div id="demographics-chart-content">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="ageGroup" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="male" fill="#1679AB" name="Male" />
              <Bar dataKey="female" fill="#FF69B4" name="Female" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50/30 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Total Males</p>
            <p className="text-lg font-semibold">{totalMales}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Females</p>
            <p className="text-lg font-semibold">{totalFemales}</p>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <ul className="list-disc list-inside text-gray-700">
            <h1>Total Population: {totalPopulation} residents.</h1>
            <h1>Gender Distribution: {((totalMales / totalPopulation) * 100).toFixed(2)}% Male, {((totalFemales / totalPopulation) * 100).toFixed(2)}% Female.</h1>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

// Custom Tooltip for the Bar Chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md">
        <p className="font-medium text-gray-800">{`Age Group: ${payload[0].payload.ageGroup}`}</p>
        <p className="text-[#1679AB]">{`Males: ${payload[0].value}`}</p>
        <p className="text-[#FF69B4]">{`Females: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

export default DemographicsChart;