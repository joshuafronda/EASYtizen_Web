import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { motion } from 'framer-motion';
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AgeDistributionChart = ({ data }) => {
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

  // Determine largest and smallest age groups
  const largestGroup = data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  const smallestGroup = data.reduce((prev, current) => (prev.value < current.value) ? prev : current);

  // Print function
  const handlePrint = () => {
    const printContent = document.getElementById('age-chart-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Age Distribution Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .report-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { color: #4F46E5; font-size: 24px; margin-bottom: 10px; }
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
              <h1 class="title">Age Distribution Report</h1>
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

  // Download PDF function
  const handleDownloadPDF = async () => {
    try {
      const content = document.getElementById('age-chart-content');
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
      pdf.setTextColor(79, 70, 229);
      pdf.text('Age Distribution Report', pageWidth/2, 20, { align: 'center' });
      
      // Add subtitle
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(
        `Age Distribution - ${new Date().toLocaleDateString()}`,
        pageWidth/2,
        30,
        { align: 'center' }
      );

      // Add chart
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);

      pdf.save(`Age_Distribution_${new Date().toLocaleDateString()}.pdf`);
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
          className="p-2 text-gray-600 hover:text-[#4F46E5] hover:bg-gray-50 rounded-lg transition-colors"
          title="Print Chart"
        >
          <Printer size={20} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPDF}
          className="p-2 text-gray-600 hover:text-[#4F46E5] hover:bg-gray-50 rounded-lg transition-colors"
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
        <div id="age-chart-content">
          <h3 className="text-lg font-semibold mb-7">Age Distribution</h3>
          <p className="text-sm text-gray-600 mb-4">Last 30 Days</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="#6B7280">
                <Label value="Age Groups" offset={-2} position="insideBottom" />
              </XAxis>
              <YAxis stroke="#6B7280">
                <Label value="Number of Residents" angle={-90} position="insideLeft" offset={10} />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#4F46E5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
         <div className="mt-4 p-2 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Total Residents: <span className="font-bold">{totalResidents}</span>
        </p>
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            The largest age group is <span className="font-bold">{data.reduce((prev, current) => (prev.value > current.value) ? prev : current).name}</span>, indicating a significant portion of the population falls within this range.
          </p>
          <p className="text-sm text-gray-600">
            Conversely, the smallest age group is <span className="font-bold">{data.reduce((prev, current) => (prev.value < current.value) ? prev : current).name}</span>, which may suggest a need for targeted services or programs for this demographic.
          </p>
          <p className="text-sm text-gray-600">
            Understanding the age distribution can help in planning community services, educational programs, and healthcare resources tailored to the needs of different age groups.
          </p>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default AgeDistributionChart;