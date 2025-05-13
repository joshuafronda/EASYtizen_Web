import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const StatCard = ({ name, icon: Icon, Descriptions, facebookUrl, color, logoUrl }) => {
  return (

    <motion.div
      className='bg-white bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray'
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
    >
      <div className='relative px-4 py-5 sm:p-6 flex-1'>
        <span className='flex items-center text-1xl font-medium italic text-black'>
          <Icon size={25} 
          className="mr-2" 
          style={{ color }} 
          />
          {name}
        </span>
        <p className='mt-1 text-sm font-medium text-black-100'>
          {Descriptions}
        </p>
        <div className='flex-shrink-0 p-4'>
        <img 
          src={logoUrl} 
          alt={`${name} Logo`} 
          style={{ width: '130px', height: '130px', objectFit: 'cover'}}
        />
      </div>
        <a 
          href={facebookUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-1 rounded inline-flex items-center px-4 py-2 bg-[#1679AB] text-white text-sm font-medium hover:bg-[#064869] transition-colors"
        >
          See More<ArrowRight size={23} className="ml-2"/>
        </a>
      </div>
    </motion.div>
  );
};

export default StatCard;
