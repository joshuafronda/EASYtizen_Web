// src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Bell } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import defaultAvatar from './img/Municipal.png'; 
import { getBarangayLogo } from './img/barangaylogos';  // Import the logo helper

const Header = ({ title, user }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState({
    barangayName: "",
    role: ""
  });
  const navigate = useNavigate();
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Clock update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(formattedTime);
    };

    const timer = setInterval(updateTime, 1000);
    updateTime(); // Initial update
    return () => clearInterval(timer);
  }, []);

  // User data fetching effect
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData({
            barangayName: data.barangayName || "Unknown Barangay",
            role: data.role || "Unknown Role"
          });
        } else {
          console.warn("No user document found for:", user.uid);
          setUserData({
            barangayName: "Unknown Barangay",
            role: "Unknown Role"
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData({
          barangayName: "Error Loading",
          role: "Error Loading"
        });
      }
    };

    fetchUserData();
  }, [user?.uid]); // Only re-run if user ID changes

  // Real-time notifications effect
  useEffect(() => {
    if (!user?.barangayId) return;

    const documentRequestsQuery = query(
      collection(db, 'documentRequests'),
      where('barangayId', '==', user.barangayId),
      where('status', '==', 'Pending'),
      orderBy('createdAt', 'desc')
    );

    const residencyRequestsQuery = query(
      collection(db, 'residencyRequests'),
      where('barangayId', '==', user.barangayId),
      where('status', '==', 'Pending'),
      orderBy('createdAt', 'desc')
    );

    // Subscribe to document requests
    const unsubscribeDocuments = onSnapshot(documentRequestsQuery, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          
          // Fetch user details
          const userRef = doc(db, "users", data.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : null;
          
          const notification = {
            id: change.doc.id,
            type: data.certificateType,
            requestedBy: userData ? `${userData.firstName} ${userData.lastName}` : "Unknown User",
            timestamp: data.createdAt?.toDate(),
            read: false,
            collection: 'documentRequests',
            purpose: data.purpose || 'Not specified'
          };
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });
    });

    // Subscribe to residency requests
    const unsubscribeResidency = onSnapshot(residencyRequestsQuery, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          
          // Fetch user details
          const userRef = doc(db, "users", data.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : null;

          const notification = {
            id: change.doc.id,
            type: "Certificate of Residency",
            requestedBy: userData ? `${userData.firstName} ${userData.lastName}` : "Unknown User",
            timestamp: data.createdAt?.toDate(),
            read: false,
            collection: 'residencyRequests',
            purpose: data.purpose || 'Not specified'
          };
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });
    });

    return () => {
      unsubscribeDocuments();
      unsubscribeResidency();
    };
  }, [user?.barangayId]);

  // Remove the click handlers since we don't want it clickable
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Get the barangay logo based on user's barangay
  const getProfileLogo = () => {
    if (!userData || !userData.barangayName) return defaultAvatar;
    return getBarangayLogo(userData.barangayName);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">{title}</h1>

        <div className="flex items-center space-x-6">
          <span className="text-xl text-[#1679AB]">{currentTime}</span>

          {/* Notifications Bell with Counter */}
          <div className="relative">
            <button 
              className="focus:outline-none relative p-1 hover:bg-gray-100 rounded-full"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={24} className="text-black hover:text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Simplified Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-sm text-gray-500">
                        {unreadCount} new {unreadCount === 1 ? 'request' : 'requests'}
                      </span>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b last:border-0 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <p className="font-medium text-gray-800">
                                {notification.type}
                              </p>
                              <span className="text-xs text-gray-500">
                                {notification.timestamp?.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              From: <span className="font-medium">{notification.requestedBy}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Purpose: <span className="font-medium">{notification.purpose}</span>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center ml-4">
              <div className="flex flex-col items-end text-right">
                <span className="text-black italic font-medium">
                  Barangay {userData.barangayName}
                </span>
                <span className="text-gray-600 text-sm">
                  {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                </span>
              </div>
              {/* Updated Profile Logo Section */}
              <div className="relative group ml-2">
                <button 
                  onClick={handleSettingsClick}
                  className="relative focus:outline-none transition-transform hover:scale-105"
                >
                  <img
                    src={getProfileLogo()}  // Use the barangay-specific logo
                    alt={`${userData.barangayName} Logo`}
                    className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    onError={(e) => {
                      console.log('Error loading barangay logo, using default');
                      e.target.src = defaultAvatar;
                    }}
                  />
                  <Settings 
                    size={16} 
                    className="absolute bottom-0 right-0 text-[#1679AB] bg-white rounded-full p-0.5 border border-gray-300 transform translate-x-1/4 translate-y-1/4" 
                  />
                </button>
                <span className="absolute left-1/2 transform -translate-x-1/2 bottom-[-1.5rem] 
                               bg-[#1679AB] text-white text-xs rounded-md px-2 py-1 
                               opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Profile
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;