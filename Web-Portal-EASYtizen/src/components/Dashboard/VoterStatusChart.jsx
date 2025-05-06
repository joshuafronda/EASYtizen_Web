import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

const VoterStatusChart = ({ data }) => {
  const totalVoters = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-[#4F46E5] font-medium">{`${payload[0].value} voters`}</p>
          <p className="text-sm text-gray-500">{`${((payload[0].value / totalVoters) * 100).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  const handlePrint = () => {
    const printContent = document.getElementById('voter-status-chart-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Voter Status Report</title>
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
              <h1 class="title">Voter Status Report</h1>
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
      const content = document.getElementById('voter-status-chart-content');
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
      pdf.setTextColor(79, 70, 229);
      pdf.text('Voter Status Report', pageWidth/2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Voter Status - ${new Date().toLocaleDateString()}`, pageWidth/2, 30, { align: 'center' });
      pdf.addImage(imgData, 'PNG', 10, 40, pageWidth - 20, pageHeight - 60);
      pdf.save(`Voter_Status_${new Date().toLocaleDateString()}.pdf`);
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
      
        <div id="voter-status-chart-content">
          <h3 className="text-lg font-semibold mb-7">Voter Registration Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#0088FE' : '#FFBB28'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4">
            <h4 className="text-md font-semibold"></h4>
            <p className="text-sm text-gray-600">{`Total Voters: ${totalVoters}`}</p>
            <p className="text-sm text-gray-600">{`Registered Voters: ${data[0].value} (${((data[0].value / totalVoters) * 100).toFixed(1)}%)`}</p>
            <p className="text-sm text-gray-600">{`Not Registered Voters: ${data[1].value} (${((data[1].value / totalVoters) * 100).toFixed(1)}%)`}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoterStatusChart;