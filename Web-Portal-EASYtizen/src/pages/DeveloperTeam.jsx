import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import profileImage from '../components/common/img/JOSH1.jpg';

const DeveloperTeam = () => {
  const skills = [
    {
      name: 'React.js',
      description: 'Web Frontend Development',
      icon: 'https://skillicons.dev/icons?i=react'
    },
    {
      name: 'React Native',
      description: 'Mobile App Development',
      icon: 'https://skillicons.dev/icons?i=react'
    },
    {
      name: 'Tailwind CSS',
      description: 'Styling & UI Design',
      icon: 'https://skillicons.dev/icons?i=tailwind'
    },
    {
      name: 'Firebase',
      description: 'Backend & Database',
      icon: 'https://skillicons.dev/icons?i=firebase'
    },
    {
      name: 'JavaScript',
      description: 'Programming Language',
      icon: 'https://skillicons.dev/icons?i=js'
    },
    {
      name: 'Git',
      description: 'Version Control',
      icon: 'https://skillicons.dev/icons?i=git'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1679AB]/5 to-[#183369]/5">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-800 hover:text-[#1679AB] transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left Side - Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-12 py-8"
            >
              {/* Profile Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Joshua Fronda
                  </h1>
                  <p className="text-2xl text-[#1679AB] font-medium">
                    Full Stack Developer
                  </p>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed">
                  I'm a passionate full-stack developer specializing in modern web and mobile technologies. 
                  Currently leading the development of EASYtizen's web portal and mobile application, 
                  creating a comprehensive barangay management system.
                </p>

                <div className="flex space-x-6 pt-2">
                  <a
                    href="https://github.com/joshuafronda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#1679AB] transition-colors"
                  >
                    <FiGithub className="w-7 h-7" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/joshuafronda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#1679AB] transition-colors"
                  >
                    <FiLinkedin className="w-7 h-7" />
                  </a>
                  <a
                    href="joshfronda18@gmail.com"
                    className="text-gray-600 hover:text-[#1679AB] transition-colors"
                  >
                    <FiMail className="w-7 h-7" />
                  </a>
                </div>
              </div>

              {/* About Project */}
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-gray-900">
                  About EASYtizen
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  The traditional manual process of managing barangay records and processing document requests is outdated, 
                  time-consuming, and error-prone, often requiring residents to physically visit offices and endure long wait times. 
                  To solve these inefficiencies, researchers developed a comprehensive web-based system and mobile application that digitizes 
                  and streamlines document requests. Key features include QR code-enabled document retrieval, real-time issue reporting, 
                  and online request submission, providing a faster, more accessible, and user-friendly experience for both residents and barangay officials.
                </p>
              </div>
            </motion.div>

            {/* Right Side - Image and Tech Stack */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-16 py-8"
            >
              {/* Profile Image */}
              <div className="flex justify-center">
                <img
                  src={profileImage}
                  alt="Joshua Fronda"
                  className="w-72 h-72 rounded-full object-cover shadow-lg"
                />
              </div>

              {/* Tech Stack */}
              <div className="space-y-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="w-10 h-10 mx-auto flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-200">
                        <img
                          src={skill.icon}
                          alt={skill.name}
                          className="w-full h-full"
                        />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{skill.name}</h3>
                      <p className="text-gray-600">{skill.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperTeam; 