import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Login = () => {
  const { t } = useTranslation(['auth', 'common']);
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
      toast.success(t('auth:login.success'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || t('auth:login.error'));
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
                {t('common:app_name')}
              </h1>
              <p className="text-sm text-base-content/60 mt-2">
                {t('auth:login.tagline')}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">{t('auth:login.username')}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    placeholder={t('auth:login.username_placeholder')}
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
                  <span className="label-text font-medium">{t('auth:login.password')}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-base-content/40" />
                  </div>
                  <input
                    type="password"
                    placeholder={t('auth:login.password_placeholder')}
                    className="input input-bordered w-full pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <label className="label">
                  <Link to="/forgot-password" className="label-text-alt link link-hover text-primary">
                    {t('auth:login.forgot_password')}
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
                {loading ? t('auth:login.signing_in') : t('auth:login.submit')}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="divider">OR</div>

            {/* Demo Credentials */}
            <div className="bg-info/10 rounded-lg p-4">
              <p className="text-xs text-center font-semibold text-info mb-2">
                {t('auth:login.demo_credentials')}
              </p>
              <div className="text-xs space-y-1 text-center">
                <p><strong>{t('auth:login.demo_admin')}:</strong> admin / admin123</p>
                <p><strong>{t('auth:login.demo_staff')}:</strong> staff / staff123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-base-content/60 mt-6">
          {t('auth:login.help_text')}
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

