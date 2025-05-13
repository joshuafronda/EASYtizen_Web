import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Info, Search } from 'lucide-react';
import Header from '../components/common/Header';

const Announcement = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Real-time announcements:', announcementsData);
      setAnnouncements(announcementsData);
    }, (error) => {
      console.error('Error fetching announcements:', error);
    });

    return () => unsubscribe();
  }, []);

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!announcements || announcements.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No announcements available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative z-10 h-screen"> {/* Full height for the screen */}
      <Header title="Announcement" user={user} /> 
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
            placeholder="Search announcements by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Announcements Stream with Border and Scroll */}
      <div className="border border-gray-200 rounded-xl shadow-sm bg-white">
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Announcement Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1679AB] rounded-full flex items-center justify-center text-white font-bold text-xl">
                      P
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{announcement.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>ABC President</span>
                        <span>•</span>
                        <Calendar size={14} className="inline" />
                        <span>
                          {announcement.createdAt?.toDate().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <Clock size={14} className="inline" />
                        <span>
                          {announcement.createdAt?.toDate().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcement Content - Simplified Version */}
                <div className="p-6">
                  {/* Main Content Section */}
                  <div className="space-y-4 bg-gray-50 rounded-lg p-5">
                    {/* Purpose Section */}
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-[#1679AB] mt-1" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#1679AB] uppercase tracking-wide">Purpose</h4>
                        <p className="text-gray-700 mt-1">{announcement.purpose}</p>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="border-t border-gray-200 text-sm font-bold italic pt-4">Details:
                      <p className="text-[#1679ab]">
                        {announcement.details}
                      </p>
                    </div>

                    {/* Action and Information Section */}
                    {(announcement.actionRequired || announcement.information) && (
                      <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                        {announcement.actionRequired && (
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 mt-1" />
                            <div>
                              <h4 className="text-sm font-semibold text-amber-500 uppercase tracking-wide">
                                Action Required
                              </h4>
                              <p className="text-gray-700 mt-1">
                                {announcement.actionRequired}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {announcement.information && (
                          <div className="flex items-start gap-3 text-gray-600">
                            <Info className="w-5 h-5 mt-1 opacity-60" />
                            <div>
                              <h4 className="text-sm font-semibold uppercase tracking-wide opacity-75">
                                Additional Information
                              </h4>
                              <p className="mt-1">
                                {announcement.information}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer with timestamp */}
                  <div className="mt-4 text-sm text-gray-500 flex justify-end">
                    {announcement.updatedAt ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Updated: {announcement.updatedAt.toDate().toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm 
                  ? "No announcements found matching your search."
                  : "No announcements available."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Announcement;