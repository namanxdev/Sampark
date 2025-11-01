import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiFileText, FiUsers, FiSettings, 
  FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiWifi
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SyncStatusIndicator from './SyncStatusIndicator';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-primary to-secondary shadow-lg backdrop-blur-md bg-opacity-95"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="text-3xl font-bold text-white"
            >
              🏛️ Sampark
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/dashboard" icon={<FiHome />}>{t('navigation.dashboard')}</NavLink>
            <NavLink to="/surveys" icon={<FiFileText />}>{t('navigation.surveys')}</NavLink>
            <NavLink to="/offline-demo" icon={<FiWifi />}>{t('navigation.offline_demo')}</NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/users" icon={<FiUsers />}>{t('navigation.users')}</NavLink>
            )}
            <NavLink to="/settings" icon={<FiSettings />}>{t('navigation.settings')}</NavLink>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Sync Status Indicator */}
            <SyncStatusIndicator />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle text-white"
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </motion.button>

            {/* User Info */}
            <div className="dropdown dropdown-end">
              <motion.div
                whileHover={{ scale: 1.05 }}
                tabIndex={0}
                className="btn btn-ghost text-white"
              >
                <div className="flex items-center space-x-2">
                  <div className="avatar placeholder">
                    <div className="bg-white text-primary rounded-full w-10">
                      <span className="text-lg font-bold">
                        {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-semibold">{user?.full_name}</div>
                    <div className="text-xs opacity-75 capitalize">{user?.role}</div>
                  </div>
                </div>
              </motion.div>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-4">
                <li><Link to="/profile">{t('navigation.profile')}</Link></li>
                <li><Link to="/settings">{t('navigation.settings')}</Link></li>
                <li><button onClick={handleLogout} className="text-error">
                  <FiLogOut /> {t('actions.logout')}
                </button></li>
              </ul>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden btn btn-ghost btn-circle text-white"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col space-y-2">
              <div className="px-4 py-2">
                <SyncStatusIndicator showDetails={true} />
              </div>
              <MobileNavLink to="/dashboard" icon={<FiHome />}>{t('navigation.dashboard')}</MobileNavLink>
              <MobileNavLink to="/surveys" icon={<FiFileText />}>{t('navigation.surveys')}</MobileNavLink>
              <MobileNavLink to="/offline-demo" icon={<FiWifi />}>{t('navigation.offline_demo')}</MobileNavLink>
              {user?.role === 'admin' && (
                <MobileNavLink to="/users" icon={<FiUsers />}>{t('navigation.users')}</MobileNavLink>
              )}
              <MobileNavLink to="/settings" icon={<FiSettings />}>{t('navigation.settings')}</MobileNavLink>
              <button
                onClick={handleLogout}
                className="btn btn-ghost text-white justify-start"
              >
                <FiLogOut /> {t('actions.logout')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, icon, children }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center space-x-1 text-white hover:text-accent transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </motion.div>
  </Link>
);

const MobileNavLink = ({ to, icon, children }) => (
  <Link to={to}>
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-3 text-white hover:bg-white/10 px-4 py-3 rounded-lg"
    >
      {icon}
      <span>{children}</span>
    </motion.div>
  </Link>
);

export default Navbar;
