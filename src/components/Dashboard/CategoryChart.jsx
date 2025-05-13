import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const CategoryChart = ({ user }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [documentData, setDocumentData] = useState([
    { 
      name: "Barangay Clearance", 
      value: 0,
      color: "#1679AB"
    },
    { 
      name: "Certificate of Indigency", 
      value: 0,
      color: "#45B3E3"
    },
    { 
      name: "Certificate of Residency", 
      value: 0,
      color: "#73ECFF"
    }
  ]);

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        // Initialize counters
        let requestCounts = {
          "Barangay Clearance": 0,
          "Certificate of Indigency": 0,
          "Certificate of Residency": 0
        };

        // Fetch all document requests
        const docRequestsRef = collection(db, 'documentRequests');
        const docSnapshot = await getDocs(docRequestsRef);

        // Count document requests
        docSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.barangayId === user.barangayId && data.certificateType in requestCounts) {
            requestCounts[data.certificateType]++;
          }
        });

        // Fetch all residency requests
        const residencyRef = collection(db, 'residencyRequests');
        const residencySnapshot = await getDocs(residencyRef);

        // Count residency requests
        residencySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.barangayId === user.barangayId) {
            requestCounts["Certificate of Residency"]++;
          }
        });

        // Update state with combined data
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

      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    if (user?.barangayId) {
      fetchAllRequests();
    }
  }, [user?.barangayId]);

  const totalRequests = documentData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalRequests) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-md">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-[#1679AB]">
            {data.value.toLocaleString()} requests
          </p>
          <p className="text-sm text-gray-500">
            {`${percentage}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="grid grid-cols-3 gap-4 mt-8">
      {payload.map((entry, index) => (
        <div 
          key={`legend-${index}`}
          className={`flex items-center p-2 rounded transition-all duration-200 cursor-pointer
            ${activeIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div 
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.payload.color }}
          />
          <div className="ml-2">
            <span className="text-sm font-medium text-gray-600">
              {entry.payload.name}
              <span className="block text-xs text-gray-400">
                ({((entry.payload.value / totalRequests) * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      className="bg-white rounded-lg p-6 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-gray-800">
            Document Requests by Type
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalRequests.toLocaleString()} total requests
          </p>
        </div>
      </div>

      <div className="h-96">
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
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="text-center p-3 bg-gray-50/30 rounded">
          <p className="text-sm text-gray-500">Most Requested</p>
          <p className="text-base font-medium text-[#1679AB]">
            {documentData.reduce((prev, current) => 
              (prev.value > current.value) ? prev : current
            ).name}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50/30 rounded">
          <p className="text-sm text-gray-500">Average</p>
          <p className="text-base font-medium text-[#1679AB]">
            {Math.round(totalRequests / documentData.length).toLocaleString()}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50/30 rounded">
          <p className="text-sm text-gray-500">Types</p>
          <p className="text-base font-medium text-[#1679AB]">
            {documentData.length}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryChart;