import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  MoreVertical, 
  Calendar,
  Clock,
  Paperclip,
  Send,
  Image as ImageIcon,
  Edit2,
  Trash2,
  AlertCircle,
  Info,
  Search
} from 'lucide-react';

const convertLinksToAnchors = (text) => {
  if (!text) return '';
  
  // URL pattern that matches http, https, and www
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  
  return text.split(urlPattern).map((part, i) => {
    if (part?.match(urlPattern)) {
      const href = part.startsWith('www.') ? `https://${part}` : part;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const validateUrl = (url) => {
  try {
    new URL(url.startsWith('www.') ? `https://${url}` : url);
    return true;
  } catch {
    return false;
  }
};

const AdminAnnouncement = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    purpose: '',
    details: '',
    actionRequired: '',
    information: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const announcementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setNewAnnouncement({
      title: announcement.title,
      purpose: announcement.purpose,
      details: announcement.details,
      actionRequired: announcement.actionRequired,
      information: announcement.information
    });
    setIsFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate URLs in all fields
    const fields = ['title', 'purpose', 'details', 'actionRequired', 'information'];
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    
    for (const field of fields) {
      const content = newAnnouncement[field];
      const urls = content.match(urlPattern) || [];
      
      for (const url of urls) {
        if (!validateUrl(url)) {
          alert(`Invalid URL found in ${field}: ${url}`);
          return;
        }
      }
    }

    try {
      if (editingId) {
        // Update existing announcement
        const announcementRef = doc(db, 'announcements', editingId);
        await updateDoc(announcementRef, {
          ...newAnnouncement,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new announcement
        await addDoc(collection(db, 'announcements'), {
          ...newAnnouncement,
          createdAt: serverTimestamp()
        });
      }
      
      setNewAnnouncement({
        title: '',
        purpose: '',
        details: '',
        actionRequired: '',
        information: ''
      });
      setIsFormVisible(false);
      setEditingId(null);
      window.location.reload();
    } catch (error) {
      console.error('Error posting/updating announcement:', error);
    }
  };

  const handleDelete = async (announcementId) => {
    try {
      // Delete the document
      await deleteDoc(doc(db, 'announcements', announcementId));
      
      // Update local state
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.filter(announcement => announcement.id !== announcementId)
      );
      
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement. Please try again.');
    }
  };

  const handleDeleteClick = (announcementId) => {
    setDeleteTarget(announcementId);
    setShowDeleteConfirm(true);
  };

  // Filter announcements based on search term
  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Search */}
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2 bg-[#1679AB] hover:bg-[#1e8dc5] text-white px-6 py-3 rounded-full shadow-md transition duration-300"
          >
            <Plus size={20} />
            <span>Create</span>
          </button>
        </div>

        {/* Search Bar */}
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
        <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto p-6">
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
                      {user?.name?.charAt(0) || 'P'}
                    </div>
                    <div> 
                      <h3 className="text-xl font-semibold text-gray-800">{announcement.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{user?.name}</span>
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
                  <div className="flex items-center gap-2">
                    <motion.button 
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-gray-400 hover:text-[#1679AB] rounded-lg hover:bg-[#1679AB]/10 transition-colors group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Edit"
                    >
                      <Edit2 size={20} className="group-hover:stroke-[#1679AB]" />
                    </motion.button>
                    <motion.button 
                      onClick={() => handleDeleteClick(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete"
                    >
                      <Trash2 size={20} className="group-hover:stroke-red-500" />
                    </motion.button>
                    <motion.button 
                      className="p-2 text-gray-400 hover:text-[#1679AB] rounded-lg hover:bg-[#1679AB]/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MoreVertical size={20} />
                    </motion.button>
                  </div>
                </div>

                {/* Announcement Content - Simplified Version */}
                <div className="p-6">
                  {/* Title and Timestamp already in header */}
                  
                  {/* Main Content Section */}
                  <div className="space-y-4 bg-gray-50 rounded-lg p-5">
                    {/* Purpose Section */}
                    <div className="text-gray-600 mb-4">
                      <span className="font-semibold">Purpose: </span>
                      <span className="text-gray-700">
                        {convertLinksToAnchors(announcement.purpose)}
                      </span>
                    </div>

                    {/* Details Section */}
                    <div className="border-t border-gray-200 text-sm italic pt-4">
                      Details:
                      <p className="text-[#1679ab] font-normal">
                        {convertLinksToAnchors(announcement.details)}
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
                                {convertLinksToAnchors(announcement.actionRequired)}
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
                                {convertLinksToAnchors(announcement.information)}
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

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {isFormVisible && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl p-8 w-full max-w-2xl m-4 shadow-lg transition-transform transform hover:scale-105"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <button 
                  onClick={() => {
                    setIsFormVisible(false);
                    setEditingId(null);
                    setNewAnnouncement({
                      title: '',
                      purpose: '',
                      details: '',
                      actionRequired: '',
                      information: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-600 mb-4">Announcement Details</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      className="w-full text-xl font-semibold border-b-2 border-gray-300 focus:border-[#1679AB] pb-2 outline-none transition duration-200"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Purpose"
                      value={newAnnouncement.purpose}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, purpose: e.target.value})}
                      className="w-full border-b border-gray-300 focus:border-[#1679AB] py-2 outline-none transition duration-200"
                      required
                    />
                    <textarea
                      placeholder="Share details with your admins..."
                      value={newAnnouncement.details}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, details: e.target.value})}
                      rows="4"
                      className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#1679AB] transition duration-200"
                      required
                    ></textarea>
                    <input
                      type="text"
                      placeholder="Action Required"
                      value={newAnnouncement.actionRequired}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, actionRequired: e.target.value})}
                      className="w-full border-b border-gray-300 focus:border-[#1679AB] py-2 outline-none transition duration-200"
                    />
                    <input
                      type="text"
                      placeholder="Additional Information"
                      value={newAnnouncement.information}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, information: e.target.value})}
                      className="w-full border-b border-gray-300 focus:border-[#1679AB] py-2 outline-none transition duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition duration-200">
                      <Paperclip size={20} />
                    </button>
                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition duration-200">
                      <ImageIcon size={20} />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-[#1679AB] hover:bg-[#1e8dc5] text-white px-6 py-2 rounded-full shadow-sm transition duration-300"
                    >
                      <Send size={18} />
                      <span>{editingId ? 'Update' : 'Post'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
              }
            }}
          >
            <motion.div 
              className="bg-white rounded-xl p-8 w-full max-w-md m-4 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Announcement</h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete this announcement? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                  <motion.button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }}
                    className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={async () => {
                      if (deleteTarget) {
                        await handleDelete(deleteTarget);
                        setShowDeleteConfirm(false);
                        setDeleteTarget(null);
                      }
                    }}
                    className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium shadow-sm hover:shadow transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAnnouncement;