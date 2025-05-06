import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

const EmploymentStatusChart = ({ data }) => {
  // Updated radar data structure for employment metrics
  const radarData = [
    { category: 'Employed', value: data.find(item => item.name === 'Employed')?.value || 0 },
    { category: 'Unemployed', value: data.find(item => item.name === 'Unemployed')?.value || 0 },
    { category: 'Self-employed', value: data.find(item => item.name === 'Self-employed')?.value || 0 },
    { category: 'Student', value: data.find(item => item.name === 'Student')?.value || 0 },
    { category: 'Retired', value: data.find(item => item.name === 'Retired')?.value || 0 },
  ];

  const totalIndividuals = radarData.reduce((acc, curr) => acc + curr.value, 0);

  const handlePrint = () => {
    const printContent = document.getElementById('employment-status-chart-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Employment Status Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .report-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { color: #FF8042; font-size: 24px; margin-bottom: 10px; }
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
              <h1 class="title">Employment Status Report</h1>
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

  const handleDownloadPDF = async () => {
    try {
      const content = document.getElementById('employment-status-chart-content');
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
      pdf.setTextColor(255, 128, 66);
      pdf.text('Employment Status Report', pageWidth/2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Employment Status - ${new Date().toLocaleDateString()}`, pageWidth/2, 30, { align: 'center' });
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);
      pdf.save(`Employment_Status_${new Date().toLocaleDateString()}.pdf`);
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
          className="p-2 text-gray-600 hover:text-[#FF8042] hover:bg-gray-50 rounded-lg transition-colors"
          title="Print Chart"
        >
          <Printer size={20} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPDF}
          className="p-2 text-gray-600 hover:text-[#FF8042] hover:bg-gray-50 rounded-lg transition-colors"
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
        <div id="employment-status-chart-content">
          <h3 className="text-lg font-semibold mb-7">Employment Status Overview</h3>
          <p className="text-sm text-gray-600 mb-4">Last 30 Days</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis />
              <Radar name="Employment Status" dataKey="value" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <p className="text-sm text-gray-600">{`Total Individuals: ${totalIndividuals}`}</p>
            <p className="text-sm text-gray-600">{`Employed: ${data.find(item => item.name === 'Employed')?.value || 0} (${((data.find(item => item.name === 'Employed')?.value || 0) / totalIndividuals * 100).toFixed(1)}%)`}</p>
            <p className="text-sm text-gray-600">{`Unemployed: ${data.find(item => item.name === 'Unemployed')?.value || 0} (${((data.find(item => item.name === 'Unemployed')?.value || 0) / totalIndividuals * 100).toFixed(1)}%)`}</p>
            <p className="text-sm text-gray-600">{`Self-employed: ${data.find(item => item.name === 'Self-employed')?.value || 0} (${((data.find(item => item.name === 'Self-employed')?.value || 0) / totalIndividuals * 100).toFixed(1)}%)`}</p>
            <p className="text-sm text-gray-600">{`Students: ${data.find(item => item.name === 'Student')?.value || 0} (${((data.find(item => item.name === 'Student')?.value || 0) / totalIndividuals * 100).toFixed(1)}%)`}</p>
            <p className="text-sm text-gray-600">{`Retired: ${data.find(item => item.name === 'Retired')?.value || 0} (${((data.find(item => item.name === 'Retired')?.value || 0) / totalIndividuals * 100).toFixed(1)}%)`}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmploymentStatusChart;