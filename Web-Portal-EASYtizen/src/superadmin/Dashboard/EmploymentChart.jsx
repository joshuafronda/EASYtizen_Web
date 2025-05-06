import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from "framer-motion";
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const EmploymentChart = ({ data }) => {
  // Prepare data for employment status
  const employmentData = [
    { status: 'Employed', count: data.filter(person => person.employmentStatus === 'Employed').length },
    { status: 'Unemployed', count: data.filter(person => person.employmentStatus === 'Unemployed').length },
    { status: 'Self-Employed', count: data.filter(person => person.employmentStatus === 'Self-Employed').length },
    { status: 'Student', count: data.filter(person => person.employmentStatus === 'Student').length },
    { status: 'Retired', count: data.filter(person => person.employmentStatus === 'Retired').length },
  ];

  // Calculate insights
  const totalCount = data.length;
  const employedCount = employmentData.find(item => item.status === 'Employed').count;
  const unemployedCount = employmentData.find(item => item.status === 'Unemployed').count;
  const selfEmployedCount = employmentData.find(item => item.status === 'Self-Employed').count;
  const studentCount = employmentData.find(item => item.status === 'Student').count;
  const retiredCount = employmentData.find(item => item.status === 'Retired').count;

  const employedPercentage = ((employedCount / totalCount) * 100).toFixed(2);
  const unemployedPercentage = ((unemployedCount / totalCount) * 100).toFixed(2);
  const selfEmployedPercentage = ((selfEmployedCount / totalCount) * 100).toFixed(2);
  const studentPercentage = ((studentCount / totalCount) * 100).toFixed(2);
  const retiredPercentage = ((retiredCount / totalCount) * 100).toFixed(2);

  const handlePrint = () => {
    const printContent = document.getElementById('employment-chart-content');
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
              <h1 class="title">Employment Status Report</h1>
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
      const content = document.getElementById('employment-chart-content');
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
      pdf.text('Employment Status Report', pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Employment Status - ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);
      pdf.save(`Employment_Status_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <motion.div className="bg-white rounded-lg p-6 shadow-md mt-6">
      <div className="relative">
        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
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

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment Status Distribution</h2>
        <div id="employment-chart-content" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employmentData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="status" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4CAF50" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Section */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">
            Out of {totalCount} individuals, {employedCount} ({employedPercentage}%) are employed, 
            {unemployedCount} ({unemployedPercentage}%) are unemployed, {selfEmployedCount} 
            ({selfEmployedPercentage}%) are self-employed, {studentCount} ({studentPercentage}%) are students, 
            and {retiredCount} ({retiredPercentage}%) are retired. This data highlights the importance of 
            employment opportunities in the community for economic stability and growth.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default EmploymentChart;