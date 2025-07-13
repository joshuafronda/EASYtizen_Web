import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUsers, FiFileText, FiClipboard, FiShield, FiCheck, FiAward, FiClock, FiSmartphone, FiHome, FiUser, FiBell, FiMenu } from 'react-icons/fi';
import logo from '../components/common/img/logo.jpg';
import easytizenLogo from '../components/common/img/Easytizen.png';
import qrCode from '../components/common/img/QRCode.png';

const LandingPage = () => {
  const features = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Resident Information",
      description: "Easy access to resident profiles and demographics with secure data management"
    },
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: "Document Processing",
      description: "Fast and efficient document requests and processing system"
    },
    {
      icon: <FiClipboard className="w-8 h-8" />,
      title: "Barangay Services",
      description: "Streamlined community services and resource management"
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Secure System",
      description: "Advanced security measures to protect sensitive information"
    }
  ];

  const stats = [
    { number: "1000+", label: "Residents Served" },
    { number: "24/7", label: "Service Availability" },
    { number: "100%", label: "Data Security" },
    { number: "29", label: "Barangays Trust Us" }
  ];

  const benefits = [
    "Quick and efficient document processing",
    "Secure resident information management",
    "24/7 service availability",
    "Real-time updates and notifications",
    "User-friendly interface",
    "Comprehensive reporting system"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1679AB]/5 to-[#183369]/5">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#1679AB] to-[#ff0a0a] text-transparent bg-clip-text">
                EASY<span className="italic">tizen</span>
              </span>
            </div>
            <Link
              to="/admin-login"
              className="px-6 py-2 bg-gradient-to-r from-[#183369] to-[#1e8dc5] text-white rounded-lg 
                       hover:from-[#1679AB] hover:to-[#1679AB] transition-all duration-300"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-5 leading-tight">
              Transform Your
              <br />
              <span className="bg-gradient-to-r from-[#1679AB] to-[#ff0a0a] text-transparent bg-clip-text">
                Barangay Services
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Experience the future of barangay management with our innovative digital platform
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-[#1679AB] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Features for Modern Governance
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your barangay efficiently in one platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="bg-[#1679AB]/10 w-16 h-16 rounded-xl flex items-center justify-center text-[#1679AB] mb-6 group-hover:bg-[#1679AB] group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-[#183369] to-[#1e8dc5] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Why Choose EASYtizen?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Experience the benefits of digital transformation in your barangay
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="flex-shrink-0">
                  <FiCheck className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-lg">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile App Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left side - Text Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                EASYtizen in Your Pocket
              </h2>
              <p className="text-xl text-gray-600">
                Access barangay services anytime, anywhere with our mobile application. 
              </p>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">Key Features:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <FiCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Real-time document request tracking</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Push notifications for updates</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Digital ID and QR code system</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="w-5 h-5 text-green-500" />
                    <span className="text-gray-600">Secure document storage</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative w-72 h-[600px] bg-[#1679AB] rounded-[3rem] border-[14px] border-gray-900 shadow-xl">
                <div className="absolute top-0 inset-x-0">
                  <div className="h-6 w-40 mx-auto bg-gray-900 rounded-b-3xl"></div>
                </div>
                <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
                  <div className="h-full w-full bg-white p-4">
                    {/* App Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#1679AB] to-[#ff0a0a] text-transparent bg-clip-text">
                EASY<span className="italic">tizen</span>
              </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiBell className="w-6 h-6 text-gray-600" />
                        <FiMenu className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-4">
                      {/* Welcome Card */}
                      <div className="bg-gradient-to-r from-[#1679AB] to-[#183369] p-4 rounded-xl text-white">
                        <h3 className="text-lg font-semibold mb-2">Welcome Back!</h3>
                        <p className="text-sm opacity-90">Access your digital services here</p>
                      </div>

                      {/* QR Code Section */}
                      <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-center">
                        <img src={qrCode} alt="QR Code" className="h-32 w-32" />
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                          <FiFileText className="w-6 h-6 mx-auto text-[#1679AB] mb-2" />
                          <span className="text-sm text-gray-600">Documents</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                          <FiUsers className="w-6 h-6 mx-auto text-[#1679AB] mb-2" />
                          <span className="text-sm text-gray-600">Profile</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
                      <div className="flex justify-around">
                        <FiHome className="w-6 h-6 text-[#1679AB]" />
                        <FiFileText className="w-6 h-6 text-gray-400" />
                        <FiUser className="w-6 h-6 text-gray-400" />
                        <FiClipboard className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Modernize Your Barangay?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the growing number of barangays transforming their services with EASYtizen
            </p>
            <Link
              to="/admin-login"
              className="px-8 py-4 bg-gradient-to-r from-[#183369] to-[#1e8dc5] text-white rounded-xl 
                       font-medium text-lg hover:from-[#1679AB] hover:to-[#1679AB] 
                       transition-all duration-300 inline-flex items-center gap-2 group"
            >
              Get Started Now 
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-xl font-bold bg-gradient-to-r from-[#1679AB] to-[#ff0a0a] text-transparent bg-clip-text">
                  EASY<span className="italic">tizen</span>
                </span>
              </div>
              <p className="text-gray-600">
                Transforming barangay services through digital innovation
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Resident Management</li>
                <li>Document Processing</li>
                <li>Service Management</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Us</li>
                <li>FAQs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex justify-between items-center">
            <p className="text-gray-600">
              © 2024 EASYtizen. All rights reserved.
            </p>
            <Link
              to="/developer"
              className="px-6 py-2 text-[#1679AB] rounded-lg 
                       hover:bg-[#1679AB] hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              Developer
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 