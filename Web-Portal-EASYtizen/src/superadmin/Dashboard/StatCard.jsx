import { motion } from "framer-motion";

const StatCard = ({ name, icon: Icon, value, color, percentage, trend, subtitle }) => {
  return (
    <motion.div
      className="bg-white rounded-lg p-5 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-800">
            {name}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        <div 
          className={`p-2 rounded-lg`}
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon 
            size={20} 
            style={{ color }} 
          />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-semibold text-[#1679AB]">
          {value}
        </h3>
        {percentage && (
          <span 
            className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {percentage}
          </span>
        )}
      </div>

      {/* Optional Progress Indicator */}
      {percentage && (
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                backgroundColor: color,
                width: `${Math.min(Math.abs(parseFloat(percentage)), 100)}%`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(parseFloat(percentage)), 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
