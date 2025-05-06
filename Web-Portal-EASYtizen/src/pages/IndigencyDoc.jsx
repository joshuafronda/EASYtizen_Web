// src/pages/RequestDoc.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import IndigencyTable from '../components/Request/IndigencyTable';

const IndigencyDoc = ({ user }) => {
  if (!user || !user.barangayId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600">Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header 
        title="Certificate of Indigency" 
        barangayId={user.barangayId} 
        user={user} 
      />
      <div className="px-4 py-2">
        <IndigencyTable 
          barangayId={user.barangayId} 
          user={user}
        />
      </div>
    </motion.div>
  );
}

export default IndigencyDoc;