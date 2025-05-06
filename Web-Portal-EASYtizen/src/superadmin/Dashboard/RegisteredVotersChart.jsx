import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const RegisteredVotersChart = ({ data }) => {
  // Prepare data for registered voters
  const registeredCount = data.filter(person => person.voterStatus === 'Registered').length;
  const unregisteredCount = data.length - registeredCount;

  const pieData = [
    { name: 'Registered', value: registeredCount },
    { name: 'Unregistered', value: unregisteredCount },
  ];

  // Calculate insights
  const totalVoters = data.length;
  const registeredPercentage = ((registeredCount / totalVoters) * 100).toFixed(2);
  const unregisteredPercentage = ((unregisteredCount / totalVoters) * 100).toFixed(2);

  const handlePrint = () => {
    const printContent = document.getElementById('voters-chart-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Registered Voters Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .report-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { color: #4CAF50; font-size: 24px; margin-bottom: 10px; }
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
              <h1 class="title">Registered Voters Report</h1>
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
      const content = document.getElementById('voters-chart-content');
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
      pdf.setTextColor(76, 175, 80);
      pdf.text('Registered Voters Report', pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Voter Registration Status - ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);
      pdf.save(`Registered_Voters_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <motion.div className="bg-white rounded-xl p-6 shadow-md mt-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Voter Registration Overview for Barangay</h2>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-[#4CAF50] hover:bg-gray-50 rounded-lg transition-colors"
            title="Print Chart"
          >
            <Printer size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            className="p-2 text-gray-600 hover:text-[#4CAF50] hover:bg-gray-50 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download size={20} />
          </motion.button>
        </div>
      </div>

      <div id="voters-chart-content">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#4CAF50' : '#FF69B4'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Section */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <ul className="list-disc list-inside text-gray-700">
            <h1>Total Voters: {totalVoters} individuals.</h1>
            <h1>Registered Voters: {registeredCount} ({registeredPercentage}%).</h1>
            <h1>Unregistered Voters:{unregisteredCount} ({unregisteredPercentage}%).</h1>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisteredVotersChart;