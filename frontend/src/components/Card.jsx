import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, gradient = false }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : {}}
      className={`
        bg-base-100 rounded-2xl shadow-lg p-6 
        ${gradient ? 'bg-gradient-to-br from-primary/5 to-secondary/5' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
