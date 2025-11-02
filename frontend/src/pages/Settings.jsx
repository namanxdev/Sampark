import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiBell, FiGlobe, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import LanguageSwitcher from '../components/LanguageSwitcher';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, panchayat } = useAuth();
  const { t } = useTranslation('settings');
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), icon: <FiUser /> },
    { id: 'security', label: t('tabs.security'), icon: <FiLock /> },
    { id: 'notifications', label: t('tabs.notifications'), icon: <FiBell /> },
    { id: 'preferences', label: t('tabs.preferences'), icon: <FiGlobe /> },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-base-content mb-8">{t('title')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <Card className="lg:col-span-1 h-fit">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all flex items-center space-x-3 font-medium
                      ${activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg border-2 border-primary' 
                        : 'bg-base-100 hover:bg-base-200 border-2 border-transparent hover:border-base-300'
                      }
                    `}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-white"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && <ProfileSettings user={user} panchayat={panchayat} />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'preferences' && <PreferencesSettings />}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ProfileSettings = ({ user, panchayat }) => {
  const { t } = useTranslation('settings');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
  });

  const handleSave = () => {
    toast.success(t('profile.profile_updated'));
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">{t('profile.title')}</h2>
      
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="avatar placeholder">
            <div className="bg-primary text-white rounded-full w-24">
              <span className="text-3xl font-bold">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
              </span>
            </div>
          </div>
          <div>
            <button className="btn btn-outline btn-sm">{t('profile.change_avatar')}</button>
            <p className="text-xs text-base-content/60 mt-2">{t('profile.avatar_hint')}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t('profile.full_name')}</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t('profile.username')}</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.username}
              disabled
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t('profile.email')}</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t('profile.role')}</span>
            </label>
            <input
              type="text"
              className="input input-bordered capitalize"
              value={user?.role}
              disabled
            />
          </div>
        </div>

        {/* Panchayat Info */}
        {panchayat && (
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">{t('profile.panchayat_info.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-base-content/60">{t('profile.panchayat_info.name')}</span>
                <span className="ml-2 font-medium">{panchayat.name}</span>
              </div>
              <div>
                <span className="text-base-content/60">{t('profile.panchayat_info.block')}</span>
                <span className="ml-2 font-medium">{panchayat.block}</span>
              </div>
              <div>
                <span className="text-base-content/60">{t('profile.panchayat_info.district')}</span>
                <span className="ml-2 font-medium">{panchayat.district}</span>
              </div>
              <div>
                <span className="text-base-content/60">{t('profile.panchayat_info.state')}</span>
                <span className="ml-2 font-medium">{panchayat.state}</span>
              </div>
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn btn-primary"
        >
          <FiSave className="mr-2" />
          {t('profile.save_changes')}
        </motion.button>
      </div>
    </Card>
  );
};

const SecuritySettings = () => {
  const { t } = useTranslation('settings');
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error(t('security.all_fields_required'), {
        position: 'top-center'
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error(t('security.password_mismatch'), {
        position: 'top-center'
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast.error(t('security.password_length_error'), {
        position: 'top-center'
      });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(passwords.current, passwords.new);
      toast.success(t('security.password_changed'), {
        position: 'top-center'
      });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || t('security.password_change_failed');
      toast.error(errorMessage, {
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">{t('security.title')}</h2>
      
      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t('security.current_password')}</span>
          </label>
          <input
            type="password"
            className="input input-bordered"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t('security.new_password')}</span>
          </label>
          <input
            type="password"
            className="input input-bordered"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t('security.confirm_password')}</span>
          </label>
          <input
            type="password"
            className="input input-bordered"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleChangePassword}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {t('security.changing_password')}
            </>
          ) : (
            t('security.change_password')
          )}
        </motion.button>

        <div className="divider"></div>

        <div className="space-y-3">
          <h3 className="font-semibold">{t('security.two_factor.title')}</h3>
          <p className="text-sm text-base-content/60">
            {t('security.two_factor.description')}
          </p>
          <button className="btn btn-outline">{t('security.two_factor.enable')}</button>
        </div>
      </div>
    </Card>
  );
};

const NotificationSettings = () => {
  const { t } = useTranslation('settings');
  const [settings, setSettings] = useState({
    email_surveys: true,
    email_sync: true,
    email_conflicts: true,
    push_surveys: false,
    push_sync: true,
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
    toast.success(t('notifications.settings_updated'));
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">{t('notifications.title')}</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">{t('notifications.email.title')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('notifications.email.survey_updates.title')}</p>
                <p className="text-sm text-base-content/60">{t('notifications.email.survey_updates.description')}</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.email_surveys}
                onChange={() => handleToggle('email_surveys')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('notifications.email.sync_notifications.title')}</p>
                <p className="text-sm text-base-content/60">{t('notifications.email.sync_notifications.description')}</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.email_sync}
                onChange={() => handleToggle('email_sync')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('notifications.email.conflict_alerts.title')}</p>
                <p className="text-sm text-base-content/60">{t('notifications.email.conflict_alerts.description')}</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.email_conflicts}
                onChange={() => handleToggle('email_conflicts')}
              />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <h3 className="font-semibold mb-4">{t('notifications.push.title')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('notifications.push.survey_updates.title')}</p>
                <p className="text-sm text-base-content/60">{t('notifications.push.survey_updates.description')}</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.push_surveys}
                onChange={() => handleToggle('push_surveys')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('notifications.push.sync_status.title')}</p>
                <p className="text-sm text-base-content/60">{t('notifications.push.sync_status.description')}</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={settings.push_sync}
                onChange={() => handleToggle('push_sync')}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const PreferencesSettings = () => {
  const { t, i18n } = useTranslation('settings');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  ];

  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      toast.success(t('preferences.language_changed'));
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error('Failed to change language');
    }
  };

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">{t('preferences.title')}</h2>
      
      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t('preferences.language')}</span>
          </label>
          
          {/* Language Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => changeLanguage(lang.code)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${i18n.language === lang.code
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-base-300 bg-base-100 hover:border-base-400 hover:bg-base-200'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div>
                      <div className="font-semibold text-lg">{lang.nativeName}</div>
                      <div className="text-sm opacity-70">{lang.name}</div>
                    </div>
                  </div>
                  {i18n.language === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-primary text-2xl"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          
          <p className="text-sm text-base-content/60 mt-2">
            {t('preferences.current_language')}: <span className="font-semibold">{currentLanguage.nativeName}</span>
          </p>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t('preferences.date_format')}</span>
          </label>
          <select
            className="select select-bordered"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="divider"></div>

        <div className="space-y-3">
          <h3 className="font-semibold">{t('preferences.data_storage.title')}</h3>
          <button className="btn btn-outline w-full">{t('preferences.data_storage.clear_cache')}</button>
          <button className="btn btn-outline btn-error w-full">{t('preferences.data_storage.clear_all_data')}</button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-primary w-full"
        >
          <FiSave className="mr-2" />
          {t('preferences.save_preferences')}
        </motion.button>
      </div>
    </Card>
  );
};

export default Settings;
