import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className={`loading loading-spinner loading-lg text-primary`}></span>
          <p className="mt-4 text-lg font-medium text-base-content">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
    </div>
  );
};

export default LoadingSpinner;
