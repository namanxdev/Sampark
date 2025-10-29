import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color = 'primary', trend = null }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`card bg-gradient-to-br from-${color} to-${color}/70 text-white shadow-xl`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 ${trend > 0 ? 'text-success' : 'text-error'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </p>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="text-4xl opacity-80"
          >
            {icon}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
