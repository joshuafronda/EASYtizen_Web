import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { X, UserCog } from "lucide-react";

const EditOfficialModal = ({ isOpen, onClose, official, onSave }) => {
  const positionOptions = [
    "Barangay Captain",
    "Chairperson, Bids and Awards Committee Ways and Means Social Services",
    "Chairperson, Committee on Infrastracture Agriculture",
    "Chairperson, Committee on Education Environment",
    "Chairperson, Committee on Appropriation Sports and Development Committee on Health",
    "Chairperson, Committee on Health Culture and Tourism",
    "Chairperson, Committee on Peace and Order",
    "Chairperson, Committee on Gender and Development",
    "Chairperson, Sangguniang Kabataan (SK)",
    "Secretary",
    "Treasurer"
  ];

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contactNumber: '',
    email: '',
    termStart: '',
    termEnd: ''
  });

  useEffect(() => {
    if (official) {
      setFormData({
        name: official.name || '',
        position: official.position || '',
        contactNumber: official.contactNumber || '',
        email: official.email || '',
        termStart: official.termStart || '',
        termEnd: official.termEnd || ''
      });
    }
  }, [official]);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white shadow-2xl rounded-2xl w-[900px] max-h-[90vh] mx-auto relative flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center">
            <div className="bg-[#1679AB] bg-opacity-10 p-3 rounded-xl mr-4">
              <UserCog className="text-[#1679AB]" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold italic text-[#1679AB]">
                Edit Official
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Update the information of the barangay official
              </p>
            </div>
            <button 
              onClick={onClose}
              className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1679AB]">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                    placeholder="Enter official's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1679AB]">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                    required
                  >
                    <option value="">Select a position</option>
                    {positionOptions.map((position, index) => (
                      <option key={index} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1679AB]">
                    Contact Number
                  </label>
                  <input 
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1679AB]">
                    Email Address
                  </label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Term Details Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Term Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1679AB]">
                    Term Start
                  </label>
                  <input 
                    type="date"
                    value={formData.termStart}
                    onChange={(e) => setFormData({ ...formData, termStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1679AB]">
                    Term End
                  </label>
                  <input 
                    type="date"
                    value={formData.termEnd}
                    onChange={(e) => setFormData({ ...formData, termEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-[#1679ab] rounded-lg hover:bg-[#136290] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditOfficialModal;