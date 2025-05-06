// src/pages/AdminDashboard.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/common/Header';
import BrgyOfficial from './BrgyOfficial';
import QrCodeScanning from './QrCodeScanning';
import Announcement from './Announcement';
import BlotterRecord from './BlotterRecord';
import Barangay from './Barangay';
import Settings from './Settings';
import Analytics from './Analytics';
import RequestDoc from './RequestDoc';
import ClearanceDoc from './CleareanceDoc';
import IndigencyDoc from './IndigencyDoc';
import ResidencyDoc from './ResidencyDoc';
import ResidentVerification from './ResidentVerification';

function AdminDashboard({ user }) {
  return (
    <div className=" flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <Routes>
        <Route path="/" element={<Analytics user={user} />} /> {/* Default route */}
        <Route path="/Analytics" element={<Analytics user={user}/>} />
        <Route path="/RequestDoc" element={<RequestDoc user={user} />} />
        <Route path="/BrgyOfficial" element={<BrgyOfficial user={user} />} />
        <Route path="/QRCodeScanning" element={<QrCodeScanning user={user} />} />
        <Route path="/Announcement" element={<Announcement user={user} />} />
        <Route path="/BlotterRecord" element={<BlotterRecord user={user} />} />
        <Route path="/Barangay" element={<Barangay user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
        <Route path="RequestDoc/BarangayClearance" element={<ClearanceDoc user={user}  />} />
        <Route path="RequestDoc/CertificateOfIndigency" element={<IndigencyDoc user={user} />} />
        <Route path="RequestDoc/CertificateOfResidency" element={<ResidencyDoc user={user} />} />
        <Route path="/verify-resident" element={<ResidentVerification user={user} />} />
      </Routes>
    </div>
  );
}

export default AdminDashboard;