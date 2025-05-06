import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Search, X, Edit, Trash2 } from "lucide-react";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import defaultLogo from '../components/common/img/Municipal.png';
import { getBarangayLogo } from '../components/common/img/barangaylogos';

const barangayOptions = [
  'Alalum',
  'Antipolo',
  'Balimbing',
  'Banaba',
  'Bayanan',
  'Danglayan',
  'Del Pilar',
  'Gelerang Kawayan',
  'Ilat North',
  'Ilat South',
  'Kaingin',
  'Laurel',
  'Malaking Pook',
  'Mataas na Lupa',
  'Natunuan North',
  'Natunuan South',
  'Padre Castillo',
  'Palsahingin',
  'Pila',
  'Poblacion',
  'Pook ni Banal',
  'Pook ni Kapitan',
  'Resplandor',
  'Sambat',
  'San Antonio',
  'San Mariano',
  'San Mateo',
  'Santa Elena',
  'Santo Niño'
];

// Add phone number validation
const validatePhoneNumber = (number) => {
  const phoneRegex = /^(09|\+639)\d{9}$/;  // Philippine phone number format
  return phoneRegex.test(number);
};

const validatePassword = (password) => {
  const minLength = 8;
  if (password.length < minLength) {
    return ['Password must be at least 8 characters long'];
  }
  return [];
};

function Admin() {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    barangay: '',
    phoneNumber: '',
    logo: null
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    adminId: null,
    adminName: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [previewLogo, setPreviewLogo] = useState({
    isOpen: false,
    url: '',
    name: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const q = query(collection(db, 'users'), where("role", "==", "admin"));
    const querySnapshot = await getDocs(q);
    const fetchedAdmins = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAdmins(fetchedAdmins);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Updated validation
    if (!newAdmin.name || !newAdmin.password || !newAdmin.barangay || !newAdmin.phoneNumber) {
      alert('Please fill all fields');
      setLoading(false);
      return;
    }

    // Password validation
    const passwordErrors = validatePassword(newAdmin.password);
    if (passwordErrors.length > 0) {
      alert(passwordErrors[0]);
      setLoading(false);
      return;
    }

    // Phone number validation
    if (!validatePhoneNumber(newAdmin.phoneNumber)) {
      alert('Please enter a valid Philippine phone number (e.g., 09123456789 or +639123456789)');
      setLoading(false);
      return;
    }

    try {
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newAdmin.email, 
        newAdmin.password
      );


      // Create user document with additional fields including logo URL
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: newAdmin.name,
        email: newAdmin.email,
        phoneNumber: newAdmin.phoneNumber,
        role: 'admin',
        barangayId: newAdmin.barangay,
        barangayName: newAdmin.barangay,
        createdAt: new Date().toISOString()
      });

      // Sign out immediately after creation
      await auth.signOut();

      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        barangay: '',
        phoneNumber: '',
      });
      setLogoPreview(null);

      // Fetch updated admin list
      await fetchAdmins();

      alert('Admin account created successfully!');
      setIsFormVisible(false);

    } catch (error) {
      console.error('Error creating admin account: ', error);
      
      let errorMessage = 'Failed to create admin account.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (admin) => {
    setDeleteModal({
      isOpen: true,
      adminId: admin.id,
      adminName: admin.name
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.adminId) return;

    try {
      // Get the admin data first to access the logo URL
      const adminToDelete = admins.find(admin => admin.id === deleteModal.adminId);
      
      // Delete the user document from Firestore
      await deleteDoc(doc(db, 'users', deleteModal.adminId));

      // Delete the logo from Storage if it exists
      if (adminToDelete?.logoUrl) {
        const logoRef = ref(storage, `barangay-logos/${deleteModal.adminId}`);
        try {
          await deleteObject(logoRef);
        } catch (error) {
          console.error('Error deleting logo:', error);
          // Continue with deletion even if logo deletion fails
        }
      }

      // Update the local state
      setAdmins(prevAdmins => 
        prevAdmins.filter(admin => admin.id !== deleteModal.adminId)
      );

      // Close the modal
      setDeleteModal({ isOpen: false, adminId: null, adminName: '' });


    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin account. Please try again.');
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.barangayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size must be less than 2MB');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG or PNG)');
        e.target.value = ''; // Clear the input
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Update state
      setNewAdmin(prev => ({ ...prev, logo: file }));
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const closeForm = () => {
    setIsFormVisible(false);
    setLogoPreview(null);
    setNewAdmin({
      name: '',
      email: '',
      password: '',
      barangay: '',
      phoneNumber: '',
      logo: null
    });
  };

  // Add this function to handle phone number input
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    const numbersOnly = value.replace(/[^\d]/g, '');
    
    // Update the state with numbers only
    setNewAdmin(prev => ({
      ...prev,
      phoneNumber: numbersOnly
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Admin Management</h2>
        <button
          onClick={() => setIsFormVisible(true)}
          className="bg-[#1679AB] hover:bg-[#1e8dc5] text-white font-bold py-2 px-4 rounded-full flex items-center transition duration-300"
        >
          <UserPlus size={20} className="mr-2" />
          Add Admin
        </button>
      </div>

      <div className="mb-6 flex items-center bg-white rounded-lg shadow-md p-2">
        <Search className="text-gray-400 mr-2" size={20} />
        <input
          type="text"
          placeholder="Search admins..."
          className="w-full outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="max-h-[650px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-white">
                  Logo
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-white">
                  Admin Name
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-white">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-white">
                  Telephone No.of Barangay
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-white">
                  Barangay
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center bg-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading...</td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <motion.tr
                    key={admin.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Logo Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center space-x-2">
                        {/* Clickable Logo */}
                        <img 
                          src={admin.logoUrl || getBarangayLogo(admin.barangayName)} 
                          alt={`${admin.barangayName} logo`}
                          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-20 transition-opacity"
                          onClick={() => setPreviewLogo({
                            isOpen: true,
                            url: admin.logoUrl || getBarangayLogo(admin.barangayName),
                            name: admin.barangayName
                          })}
                          onError={(e) => {
                            e.target.src = defaultLogo;
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    </td>

                    {/* Admin Name Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {admin.name}
                      </span>
                    </td>

                    {/* Email Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center relative group">
                        <span className="text-sm text-gray-600 truncate max-w-[200px]" title={admin.email}>
                          {admin.email}
                        </span>
                        {/* Tooltip */}
                        <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-2 px-3 left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap z-50">
                          {admin.email}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500">
                        {admin.phoneNumber}
                      </span>
                    </td>

                    {/* Barangay Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500">
                        {admin.barangayName}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <motion.button
                          onClick={() => handleDelete(admin)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors group"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Delete Admin"
                        >
                          <Trash2 size={20} className="group-hover:stroke-red-500 text-red-500" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
    {isFormVisible && (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                            <UserPlus className="text-[#1679AB]" size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold italic text-[#1679AB]">
                                Create Admin Account
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Fill in the information below to create a new admin account
                            </p>
                        </div>
                        <button 
                            onClick={closeForm}
                            className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information Section */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <label className="text-sm italic font-medium text-[#1679AB]">Admin Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={newAdmin.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter full name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Barangay Field */}
                                <div className="space-y-2">
                                    <label className="text-sm italic font-medium text-[#1679AB]">Barangay</label>
                                    <select
                                        id="barangay"
                                        name="barangay"
                                        value={newAdmin.barangay}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select your barangay</option>
                                        {barangayOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Phone Number Field */}
                                <div className="space-y-2">
                                    <label className="text-sm italic font-medium text-[#1679AB]">Telephone No.of Barangay</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={newAdmin.phoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        placeholder="09123456789"
                                        maxLength="11"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                        required
                                        onKeyPress={(e) => {
                                          // Prevent non-numeric key presses
                                          if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                          }
                                        }}
                                    />
                                    {newAdmin.phoneNumber && !validatePhoneNumber(newAdmin.phoneNumber) && (
                                        <p className="text-red-500 text-xs mt-1">Please enter a valid Philippine phone number (e.g., 09123456789)</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Information Section */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="text-sm font-medium text-gray-500 mb-4">Account Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#1679AB]">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={newAdmin.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#1679AB]">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={newAdmin.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#1679AB] focus:border-transparent"
                                        required
                                    />
                                    <p className="text-sm text-gray-500">Password must be at least 8 characters long</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <button 
                                type="button" 
                                onClick={closeForm}
                                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#1679ab] rounded-lg hover:bg-[#136290] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Account...' : 'Create Admin Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>

      {/* Add Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-[400px] shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Delete Modal Content */}
              <div className="text-center">
                {/* Warning Icon */}
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                {/* Modal Text */}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Admin Account
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete the admin account for{' '}
                  <span className="font-medium text-gray-900">{deleteModal.adminName}</span>?
                  This action cannot be undone.
                </p>

                {/* Modal Actions */}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, adminId: null, adminName: '' })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo Preview Modal */}
      <AnimatePresence>
        {previewLogo.isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewLogo({ isOpen: false, url: '', name: '' })}
          >
            <motion.div
              className="bg-white p-4 rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center">
                <img 
                  src={previewLogo.url} 
                  alt={`${previewLogo.name} logo preview`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = defaultLogo;
                    e.target.onerror = null;
                  }}
                />
                <p className="mt-4 text-lg font-semibold text-gray-700">{previewLogo.name}</p>
                <button
                  onClick={() => setPreviewLogo({ isOpen: false, url: '', name: '' })}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Admin;