import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { motion } from 'framer-motion';
import logo from '../components/common/img/logo.jpg';

function AdminLogin({ onAuthSuccess, initialError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set initial error if provided
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login handling
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
        await auth.signOut();
        throw new Error('Unauthorized access');
      }

      // Call onAuthSuccess with user data
      onAuthSuccess({
        ...userCredential.user,
        ...userData,
        role: userData.role,
        barangayName: userData.barangayName || 'Unknown'
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Unauthorized access') {
        setError('Unauthorized access. Please contact administrator.');
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative bg-gradient-to-br from-[#1679AB]/5 to-[#183369]/5 h-screen w-screen flex justify-center items-center'>
      <div className='relative z-10 bg-white px-10 py-8 rounded-2xl shadow-lg max-w-md w-full mx-4'>
        {/* Header Section */}
        <div className='flex flex-col items-center mb-10'>
          <img 
            src={logo} 
            alt="Logo" 
            className="w-45 h-40 object-cover mb-4"
          />
          <h1 className='text-6xl font-bold bg-gradient-to-r from-[#1679AB] to-[#ff0a0a] text-transparent bg-clip-text'>
            EASY<span className="italic">tizen</span>
          </h1>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className='text-sm font-medium italic text-gray-700 mb-1'>
              Email
            </label>
            <input
              type="email"
              placeholder="brgy@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg 
                       focus:ring-1 focus:ring-[#1679AB] focus:border-[#1679AB] 
                       transition-colors duration-200 disabled:bg-gray-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className='text-sm font-medium italic text-gray-700 mb-1'>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg 
                       focus:ring-1 focus:ring-[#1679AB] focus:border-[#1679AB] 
                       transition-colors duration-200 mb-6 disabled:bg-gray-100"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-sm border border-red-200 rounded-lg bg-red-50"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-red-600">{error}</p>
              </div>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 bg-gradient-to-r from-[#183369] to-[#1e8dc5] 
                     text-white rounded-xl font-medium text-lg 
                     hover:from-[#1679AB] hover:to-[#1679AB] 
                     transition-all duration-300
                     disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;