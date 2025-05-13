import React, { useState } from 'react';
import Header from '../components/common/Header';
import BarangayPage from '../components/common/Barangay/BarangayPage';
import { motion } from "framer-motion";
import { LandmarkIcon, Search } from "lucide-react";
import barangay1 from '/src/components/common/img/alalum.png';
import barangay2 from '/src/components/common/img/Municipal.png';

const barangayData = [
  { name: "Barangay Alalum", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/profile.php?id=61550922843184", logoUrl: barangay2 },
  { name: "Barangay Antipolo", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Balimbing", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Banaba", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Bayanan", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Danglayan", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Del Pilar", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Gelerang Kawayan", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Ilat North", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Ilat South", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Kaingin", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Laurel", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Malaking Pook", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Mataas na Lupa", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Natanuan North", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Natanuan Sotuh", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Padre Castillo", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Palsahingin", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Pila", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Poblacion", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Pook ni Banal", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Pook ni Kapitan", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Resplandor", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Sambat", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay San Antonio", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay San Mariano", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay San Mateo", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Santa Elena", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Santo Niño", icon: LandmarkIcon, Descriptions: "", color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },


  // ... other barangay data ...
];

const Barangay = ({user}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredBarangays = barangayData.filter(barangay =>
    barangay.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1">      
      <Header title="Barangay" user={user}/>
      
      <main className="max-w-7x1 mx-auto py-5 px-4 lg:px-8 h-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="relative mb-5">
            <Search className="absolute left-3 top-2.5 text-[#1679AB]" size={18} />
            <input
              type="text"
              placeholder="Search Barangay..."
              className="bg-white text-black placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1679AB]"
              onChange={handleSearch}
              value={searchTerm}
            />
          </div>

          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
            {filteredBarangays.map((barangay, index) => (
              <BarangayPage
                key={index}
                name={barangay.name}
                icon={barangay.icon}
                Descriptions={barangay.Descriptions}
                color={barangay.color}
                facebookUrl={barangay.facebookUrl}
                logoUrl={barangay.logoUrl}
              />
            ))}
          </div>

          {/* Simple Footer */}
          <motion.div
            className="border-t border-gray-200 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="text-center mt-8 text-gray-500 text-sm">
              <p>© 2024 EASYtizen DRS. All rights reserved.</p>
              <p className="mt-4 mb-10">Version 1.0.0</p>
            </div>
          </motion.div> 
        </motion.div>
      </main>
    </div>
  );
}

export default Barangay;