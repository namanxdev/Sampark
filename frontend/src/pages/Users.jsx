import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiSearch, FiUserCheck, FiUserX, 
  FiShield, FiCalendar, FiFileText, FiMapPin,
  FiRefreshCw, FiFilter
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Users = () => {
  const { t } = useTranslation(['users', 'common']);
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState(null);
  const [surveysData, setSurveysData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [surveyFilter, setSurveyFilter] = useState('all');

  useEffect(() => {
    fetchUsersData();
    fetchSurveysData();
  }, []);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users/overview');
      setUsersData(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('users:messages.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveysData = async (userId = null) => {
    try {
      const params = userId ? { user_id: userId } : {};
      const response = await api.get('/api/users/surveys', { params });
      setSurveysData(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      toast.error(t('users:messages.surveys_load_failed'));
    }
  };

  const handleUserFilter = (userId) => {
    setSelectedUser(userId);
    if (userId === 'all') {
      fetchSurveysData();
    } else {
      fetchSurveysData(userId);
    }
  };

  const handleRefresh = () => {
    fetchUsersData();
    fetchSurveysData(selectedUser !== 'all' ? selectedUser : null);
    toast.success(t('users:messages.data_refreshed'));
  };

  const filteredUsers = usersData?.users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredSurveys = surveysData.filter(survey => {
    if (surveyFilter === 'completed') return survey.is_complete;
    if (surveyFilter === 'incomplete') return !survey.is_complete;
    if (surveyFilter === 'synced') return survey.sync_status === 'synced';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary flex items-center gap-3">
              <FiUsers className="text-secondary" />
              {t('users:page_title')}
            </h1>
            <p className="text-base-content/70 mt-2">
              {t('users:page_subtitle')}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="btn btn-primary gap-2"
          >
            <FiRefreshCw /> {t('users:actions.refresh')}
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiUsers />}
          title={t('users:statistics.total_users')}
          value={usersData?.total_users || 0}
          color="primary"
        />
        <StatCard
          icon={<FiUserCheck />}
          title={t('users:statistics.active_users')}
          value={usersData?.active_users || 0}
          color="success"
        />
        <StatCard
          icon={<FiShield />}
          title={t('users:statistics.admin_users')}
          value={usersData?.admin_users || 0}
          color="warning"
        />
        <StatCard
          icon={<FiFileText />}
          title={t('users:statistics.total_surveys')}
          value={usersData?.total_surveys || 0}
          color="info"
        />
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="form-control">
          <div className="input-group">
            <span className="bg-base-200">
              <FiSearch className="text-xl" />
            </span>
            <input
              type="text"
              placeholder={t('users:search.placeholder')}
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Users Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FiUsers /> {t('users:user_section.title')} ({filteredUsers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <UserCard key={user.user_id} user={user} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Surveys Table Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FiFileText /> {t('users:table.title')} ({filteredSurveys.length})
          </h2>
          
          <div className="flex gap-2 flex-wrap">
            {/* User Filter */}
            <select
              className="select select-bordered"
              value={selectedUser || 'all'}
              onChange={(e) => handleUserFilter(e.target.value)}
            >
              <option value="all">{t('users:filters.all_users')}</option>
              {usersData?.users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name || user.username}
                </option>
              ))}
            </select>

            {/* Survey Filter */}
            <select
              className="select select-bordered"
              value={surveyFilter}
              onChange={(e) => setSurveyFilter(e.target.value)}
            >
              <option value="all">{t('users:filters.all_status')}</option>
              <option value="completed">{t('users:filters.completed')}</option>
              <option value="incomplete">{t('users:filters.incomplete')}</option>
              <option value="synced">{t('users:filters.synced')}</option>
            </select>
          </div>
        </div>

        <SurveysTable surveys={filteredSurveys} />
      </motion.div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`card bg-base-100 shadow-xl border-l-4 border-${color}`}
  >
    <div className="card-body">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base-content/70 text-sm">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`text-${color} text-4xl opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  </motion.div>
);

// User Card Component
const UserCard = ({ user, index }) => {
  const { t } = useTranslation('users');
  
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'badge-warning';
      case 'staff': return 'badge-info';
      default: return 'badge-ghost';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all"
    >
      <div className="card-body">
        {/* User Avatar and Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className={`bg-${user.is_active ? 'primary' : 'base-300'} text-primary-content rounded-full w-12`}>
                <span className="text-xl font-bold">
                  {user.full_name?.charAt(0) || user.username?.charAt(0)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="card-title text-lg">{user.full_name || user.username}</h3>
              <p className="text-sm text-base-content/70">@{user.username}</p>
            </div>
          </div>
          <div className={`badge ${getRoleBadgeColor(user.role)}`}>
            {t(`roles.${user.role}`)}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-2 mt-4">
          {user.email && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base-content/70">📧</span>
              <span className="truncate">{user.email}</span>
            </div>
          )}
          
          {user.panchayat_name && (
            <div className="flex items-center gap-2 text-sm">
              <FiMapPin className="text-base-content/70" />
              <span className="truncate">{user.panchayat_name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <FiFileText className="text-base-content/70" />
            <span>
              <span className="font-semibold">{user.surveys_created}</span> {t('user_card.surveys_created')}
            </span>
          </div>

          {user.last_survey_date && (
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-base-content/70" />
              <span>{t('user_card.last_activity')}: {new Date(user.last_survey_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="card-actions justify-end mt-4">
          <div className={`badge gap-2 ${user.is_active ? 'badge-success' : 'badge-error'}`}>
            {user.is_active ? <FiUserCheck /> : <FiUserX />}
            {user.is_active ? t('user_card.active') : t('user_card.inactive')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Surveys Table Component
const SurveysTable = ({ surveys }) => {
  const { t } = useTranslation('users');
  
  const getSyncStatusBadge = (status) => {
    const badges = {
      synced: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-error',
      conflict: 'badge-info'
    };
    return badges[status] || 'badge-ghost';
  };

  if (surveys.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <FiFileText className="text-6xl text-base-content/20" />
          <h3 className="text-xl font-bold mt-4">{t('table.empty.title')}</h3>
          <p className="text-base-content/70">{t('table.empty.subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>{t('table.columns.village_name')}</th>
              <th>{t('table.columns.created_by')}</th>
              <th>{t('table.columns.panchayat')}</th>
              <th>{t('table.columns.progress')}</th>
              <th>{t('table.columns.status')}</th>
              <th>{t('table.columns.created_date')}</th>
              <th>{t('table.columns.last_modified')}</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <motion.tr
                key={survey.survey_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              >
                <td>
                  <div className="font-semibold">
                    {survey.village_name || t('table.unnamed_village')}
                  </div>
                  <div className="text-xs text-base-content/70">
                    {survey.survey_id.substring(0, 12)}...
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-8">
                        <span className="text-xs">
                          {survey.created_by_fullname?.charAt(0) || survey.created_by_username?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {survey.created_by_fullname || survey.created_by_username}
                      </div>
                      <div className="text-xs text-base-content/70">
                        @{survey.created_by_username}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-sm">{survey.panchayat_name || 'N/A'}</span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <progress 
                      className="progress progress-primary w-20" 
                      value={survey.completion_percentage} 
                      max="100"
                    />
                    <span className="text-sm font-medium">
                      {survey.completion_percentage}%
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className={`badge badge-sm ${getSyncStatusBadge(survey.sync_status)}`}>
                      {t(`sync_status.${survey.sync_status}`)}
                    </span>
                    {survey.is_complete && (
                      <span className="badge badge-sm badge-success">{t('filters.completed')}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="text-sm">
                    {new Date(survey.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <span className="text-sm">
                    {new Date(survey.updated_at).toLocaleDateString()}
                  </span>
                  <div className="text-xs text-base-content/70">
                    {new Date(survey.updated_at).toLocaleTimeString()}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
