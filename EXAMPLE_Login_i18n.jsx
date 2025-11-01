/**
 * Example: Login Page with i18n
 * Shows how to integrate react-i18next into existing components
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Login() {
  // Get translation function
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credentials);
      toast.success(t('auth:login.success'));
      navigate('/dashboard');
    } catch (error) {
      if (error.message === 'Network Error') {
        toast.error(t('auth:login.network_error'));
      } else {
        toast.error(t('auth:login.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Title with translation */}
          <h2 className="card-title text-2xl font-bold text-center justify-center mb-4">
            {t('auth:login.title')}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Username field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('auth:login.username')}</span>
              </label>
              <input
                type="text"
                placeholder={t('auth:login.username_placeholder')}
                className="input input-bordered"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
              />
            </div>

            {/* Password field */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">{t('auth:login.password')}</span>
              </label>
              <input
                type="password"
                placeholder={t('auth:login.password_placeholder')}
                className="input input-bordered"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />
            </div>

            {/* Remember me checkbox */}
            <div className="form-control mt-4">
              <label className="label cursor-pointer justify-start gap-2">
                <input type="checkbox" className="checkbox checkbox-sm" />
                <span className="label-text">{t('auth:login.remember_me')}</span>
              </label>
            </div>

            {/* Submit button */}
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? t('common:messages.loading') : t('auth:login.submit')}
              </button>
            </div>
          </form>

          {/* Forgot password link */}
          <div className="text-center mt-4">
            <a href="#" className="link link-primary text-sm">
              {t('auth:login.forgot_password')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
