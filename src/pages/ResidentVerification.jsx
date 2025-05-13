import React from 'react';
import Header from '../components/common/Header';
import QrCodeScanning from './QrCodeScanning';
import { motion } from 'framer-motion';

const ResidentVerification = ({ user }) => {
  return (
    <div className="flex-1 overflow-hidden">
      <Header title="Resident Verification" user={user} />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Verify Resident Identity
            </h1>
            <p className="text-gray-600">
              Scan the resident's QR code to verify their identity and view their information
            </p>
          </div>

          <QRScanner />

          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Instructions</h2>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Ask the resident to show their QR code</li>
              <li>Ensure the code is clearly visible and not damaged</li>
              <li>Keep the code within the scanning frame</li>
              <li>Verify the displayed information matches their ID</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResidentVerification;