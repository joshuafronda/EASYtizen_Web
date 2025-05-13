import { motion } from "framer-motion";

const SettingSection = ({ icon: Icon, title, children }) => {
	return (
		<motion.div
			className='bg-white-100 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-[#1679ab] mb-8'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className='flex items-center mb-4'>
				<Icon className='text-[#1679ab] mr-4' size='25' />
				<h2 className='text-xl font-semibold text-[#1679AB]'>{title}</h2>
			</div>
			{children}
		</motion.div>
	);
};
export default SettingSection;