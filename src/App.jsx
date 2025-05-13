import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LandingPage from './pages/LandingPage';
import loadingGif from '/src/components/common/img/loadv3.gif'; // Adjust the path as necessary
import DeveloperTeam from './pages/DeveloperTeam';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        setUser({ ...firebaseUser, ...userData }); // Set user data regardless of role
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img 
          src={loadingGif} 
          alt="Loading..." 
          style={{ width: '10%', height: 'auto' }} // Reduce size to 50%
        />
      </div>
    );
  }

  // If user is authenticated, show appropriate dashboard based on role
  if (user) {
    if (user.role === 'superadmin') {
      return <SuperAdminDashboard user={user} />;
    }
    return <AdminDashboard user={user} />;
  }

  // If not authenticated, show routes for public access
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin-login" element={<AdminLogin onAuthSuccess={setUser} />} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="developer" element={<DeveloperTeam/>} />
    </Routes>
  );
}

export default App;