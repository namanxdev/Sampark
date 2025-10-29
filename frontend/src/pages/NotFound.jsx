import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-base-content mb-4">Page Not Found</h2>
        <p className="text-base-content/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </a>
      </motion.div>
    </div>
  );
};

export default NotFound;
