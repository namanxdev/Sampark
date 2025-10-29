import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">
            {/* Logo & Title */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="text-6xl mb-4"
              >
                🏛️
              </motion.div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sampark
              </h1>
              <p className="text-sm text-base-content/60 mt-2">
                Panchayat Survey Management System
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Username</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="input input-bordered w-full pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-base-content/40" />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input input-bordered w-full pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <label className="label">
                  <Link to="/forgot-password" className="label-text-alt link link-hover text-primary">
                    Forgot password?
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {!loading && <FiLogIn className="mr-2" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="divider">OR</div>

            {/* Demo Credentials */}
            <div className="bg-info/10 rounded-lg p-4">
              <p className="text-xs text-center font-semibold text-info mb-2">
                Demo Credentials
              </p>
              <div className="text-xs space-y-1 text-center">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Staff:</strong> staff / staff123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-base-content/60 mt-6">
          Need help? Contact your block officer or admin.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
