import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiBell, FiGlobe, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, panchayat } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'preferences', label: 'Preferences', icon: <FiGlobe /> },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-base-content mb-8">Settings</h1>

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
                      w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3
                      ${activeTab === tab.id 
                        ? 'bg-primary text-white' 
                        : 'bg-base-200 hover:bg-base-300'
                      }
                    `}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
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
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
  });

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
      
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
            <button className="btn btn-outline btn-sm">Change Avatar</button>
            <p className="text-xs text-base-content/60 mt-2">JPG, PNG or GIF (max. 2MB)</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Full Name</span>
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
              <span className="label-text font-medium">Username</span>
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
              <span className="label-text font-medium">Email</span>
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
              <span className="label-text font-medium">Role</span>
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
            <h3 className="font-semibold mb-3">Panchayat Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-base-content/60">Name:</span>
                <span className="ml-2 font-medium">{panchayat.name}</span>
              </div>
              <div>
                <span className="text-base-content/60">Block:</span>
                <span className="ml-2 font-medium">{panchayat.block}</span>
              </div>
              <div>
                <span className="text-base-content/60">District:</span>
                <span className="ml-2 font-medium">{panchayat.district}</span>
              </div>
              <div>
                <span className="text-base-content/60">State:</span>
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
          Save Changes
        </motion.button>
      </div>
    </Card>
  );
};

const SecuritySettings = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
      
      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Current Password</span>
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
            <span className="label-text font-medium">New Password</span>
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
            <span className="label-text font-medium">Confirm New Password</span>
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
        >
          Change Password
        </motion.button>

        <div className="divider"></div>

        <div className="space-y-3">
          <h3 className="font-semibold">Two-Factor Authentication</h3>
          <p className="text-sm text-base-content/60">
            Add an extra layer of security to your account
          </p>
          <button className="btn btn-outline">Enable 2FA</button>
        </div>
      </div>
    </Card>
  );
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email_surveys: true,
    email_sync: true,
    email_conflicts: true,
    push_surveys: false,
    push_sync: true,
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
    toast.success('Settings updated');
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Email Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Survey Updates</p>
                <p className="text-sm text-base-content/60">Get notified about survey changes</p>
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
                <p className="font-medium">Sync Notifications</p>
                <p className="text-sm text-base-content/60">Notifications about sync status</p>
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
                <p className="font-medium">Conflict Alerts</p>
                <p className="text-sm text-base-content/60">Get alerts when conflicts occur</p>
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
          <h3 className="font-semibold mb-4">Push Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Survey Updates</p>
                <p className="text-sm text-base-content/60">Browser push notifications</p>
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
                <p className="font-medium">Sync Status</p>
                <p className="text-sm text-base-content/60">Real-time sync updates</p>
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
  const [language, setLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Application Preferences</h2>
      
      <div className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Language</span>
          </label>
          <select
            className="select select-bordered"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Date Format</span>
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
          <h3 className="font-semibold">Data & Storage</h3>
          <button className="btn btn-outline w-full">Clear Cache</button>
          <button className="btn btn-outline btn-error w-full">Clear All Local Data</button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn-primary w-full"
        >
          <FiSave className="mr-2" />
          Save Preferences
        </motion.button>
      </div>
    </Card>
  );
};

export default Settings;
