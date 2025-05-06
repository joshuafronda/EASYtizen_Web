import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarAdmin from '../superadmin/SidebarAdmin';
import Admin from '../superadmin/Admin';
import AdminAnnouncements from '../superadmin/AdminAnnouncement';
import BarangayLandmark from '../superadmin/BarangayLandmark';
import AnalyticsAdmin from '../superadmin/AnalyticsAdmin';

function SuperAdminDashboard({ user }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarAdmin user={user} />
      <Routes>
        <Route path="/" element={<AnalyticsAdmin user={user} />} />
        <Route path="/Admin" element={<Admin user={user} />} />
        <Route path="/BarangayLandmark" element={<BarangayLandmark user={user}/>} />
        <Route path="/Announcement" element={<AdminAnnouncements user={user} />} />
        <Route path="/AnalyticsAdmin" element={<AnalyticsAdmin user={user}/>} />
      </Routes>
    </div>
  );
}

export default SuperAdminDashboard;