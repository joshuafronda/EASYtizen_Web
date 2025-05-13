import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';
import QRCode from '../components/common/img/QRCode.png';

const QrCodeScanning = ({user}) => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);

  useEffect(() => {
    let scanner;
    
    if (isScannerActive) {
      // Create scanner instance
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 500,
          height: 500,
        },
        fps: 5,
      });

      // Success handler
      const onScanSuccess = async (decodedText) => {
        try {
          const residentData = JSON.parse(decodedText);
          setScanResult(residentData);
          setIsScannerActive(false);
          scanner.clear();
        } catch (err) {
          setError('Invalid QR Code format');
          console.error('Error processing QR code:', err);
        }
      };

      // Start scanning
      scanner.render(onScanSuccess, (error) => {
        console.warn('QR Code scanning failed:', error);
      });
    }

    // Cleanup
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isScannerActive]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Process the uploaded image file here
      console.log('Uploaded file:', file);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('id-card-to-print');
    const originalContents = document.body.innerHTML;
  
    document.body.innerHTML = printContent.innerHTML;
    
    window.print();
    
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React functionality
  };

  const IDCard = ({ data }) => (
    <div className="flex flex-col items-center gap-4">
      <div 
        id="id-card-to-print"
        className="w-[450px] h-[280px] bg-white rounded-xl shadow-2xl overflow-hidden relative mx-auto"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-repeat" 
            style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E')",
            }}
          />
        </div>
  
        {/* Card Content */}
        <div className="relative h-full">
          {/* Header */}
          <div className="bg-[#1679AB] text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">QR CODE</h3>
            </div>
          </div>
  
          {/* Main Content */}
          <div className="p-4 flex gap-4">
            {/* Left Side - QR Code */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-32 bg-white border-2 border-[#1679AB] rounded-lg flex items-center justify-center p-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
                    fullName: data.fullName,
                    barangayName: data.barangayName,
                    email: data.email
                  }))}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
  
            {/* Right Side - Details */}
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-lg font-bold text-gray-800">{data.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Barangay</p>
                <p className="font-medium text-gray-800">{data.barangayName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-800 text-sm truncate">{data.email}</p>
              </div>
            </div>
          </div>
  
          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#1679AB] text-white py-2 px-4 flex justify-between items-center text-sm">
            <span>ID No: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            <span>Valid Until: {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handlePrint}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print QR Code
      </button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto relative item z-10">
      <Header title="QR CODE Scanning" user={user} />
      
      <div className="flex justify-center items-center mt-10 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-[#1679AB] rounded-2xl p-6 w-full max-w-2xl bg-white"
        >
          {!isScannerActive && !scanResult && (
            <div className="flex flex-col items-center space-y-4">
              <img
                src={QRCode}
                style={{ width: '300px', height: '300px' }}
                className="object-contain"
              />
              <p className="text-gray-600 text-center">
                Position the QR code within the scanner frame to verify resident information
              </p>
            </div>
          )}

          {isScannerActive && (
            <div id="reader" className="mb-4"></div>
          )}

          {scanResult && <IDCard data={scanResult} />}

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <div className="flex flex-col items-center space-y-2 mt-6">
            <button
              onClick={() => {
                setIsScannerActive(!isScannerActive);
                setScanResult(null);
                setError(null);
              }}
              className={`
                ${isScannerActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1679AB] hover:bg-[#146390]'}
                text-white px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium
                flex items-center gap-2
              `}
            >
              {isScannerActive ? 'Stop Scanning' : 'Open Scanner'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QrCodeScanning;