import React, { useState } from 'react';
import Header from '../components/common/Header';
import BarangayPage from '../components/common/Barangay/BarangayPage';
import { motion } from "framer-motion";
import { LandmarkIcon, Search } from "lucide-react";
import barangay1 from '/src/components/common/img/alalum.png';
import barangay2 from '/src/components/common/img/Municipal.png';

const barangayData = [
  { name: "Barangay Alalum", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/profile.php?id=61550922843184", logoUrl: barangay2 },
  { name: "Barangay Antipolo", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Balimbing", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Banaba", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Bayanan", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Danglayan", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Del Pilar", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Gelerang Kawayan", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Ilat North", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Ilat South", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Kaingin", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Laurel", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Malaking Pook", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Mataas na Lupa", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Natanuan North", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Natanuan South", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Padre Castillo", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Palsahingin", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Pila", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Poblacion", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Pook ni Banal", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Pook ni Kapitan", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Resplandor", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Sambat", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay San Antonio", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay San Mariano", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay San Mateo", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Santa Elena", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 },
  { name: "Barangay Santo Niño", icon: LandmarkIcon, color: '#1679AB', facebookUrl: "https://www.facebook.com/barangay4", logoUrl: barangay2 }
];

const BarangayPages = ({user}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredBarangays = barangayData.filter(barangay =>
    barangay.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      
      <main className="max-w-7x1 mx-auto py-5 px-4 lg:px-8 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-5">Barangay</h2>
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
                color={barangay.color}
                facebookUrl={barangay.facebookUrl}
                logoUrl={barangay.logoUrl}
              />
            ))}
          </div>
        </motion.div>
      </main>
  );
}

export default BarangayPages;