import { motion } from 'framer-motion';
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSurveys } from '../hooks/useSurveys';
import { surveyService } from '../services/surveyService';
import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, panchayat } = useAuth();
  const { surveys, loading } = useSurveys(panchayat?.panchayat_id);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const status = await surveyService.getSyncStatus(panchayat?.panchayat_id);
        setSyncStatus(status);
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
      }
    };

    if (panchayat?.panchayat_id) {
      fetchSyncStatus();
    }
  }, [panchayat]);

  if (loading) return <LoadingSpinner fullScreen />;

  const completedSurveys = surveys.filter(s => s.is_complete).length;
  const pendingSurveys = surveys.length - completedSurveys;

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-base-content mb-2">
            Welcome back, {user?.full_name || user?.username}! 👋
          </h1>
          <p className="text-base-content/60">
            {panchayat ? `${panchayat.name}, ${panchayat.district}` : 'Your Dashboard Overview'}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total Surveys"
              value={surveys.length}
              icon={<FiFileText />}
              color="primary"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Completed"
              value={completedSurveys}
              icon={<FiCheckCircle />}
              color="success"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="In Progress"
              value={pendingSurveys}
              icon={<FiClock />}
              color="warning"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Sync Status"
              value={syncStatus ? `${syncStatus.sync_percentage}%` : '0%'}
              icon={<FiTrendingUp />}
              color="info"
            />
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Surveys */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Surveys</h2>
                <Link to="/surveys" className="btn btn-primary btn-sm">
                  View All
                </Link>
              </div>

              {surveys.length === 0 ? (
                <div className="text-center py-12">
                  <FiFileText className="mx-auto text-6xl text-base-content/20 mb-4" />
                  <p className="text-base-content/60 mb-4">No surveys yet</p>
                  <Link to="/surveys/new" className="btn btn-primary">
                    Create Your First Survey
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {surveys.slice(0, 5).map((survey) => (
                    <Link key={survey.survey_id} to={`/surveys/${survey.survey_id}`}>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{survey.village_name || 'Untitled Survey'}</p>
                          <p className="text-xs text-base-content/60">
                            {new Date(survey.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="radial-progress text-primary" 
                            style={{ "--value": survey.completion_percentage }}>
                            {survey.completion_percentage}%
                          </div>
                          <span className={`badge ${survey.is_complete ? 'badge-success' : 'badge-warning'}`}>
                            {survey.is_complete ? 'Complete' : 'In Progress'}
                          </span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick Actions & Sync Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card gradient>
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/surveys/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary w-full"
                  >
                    <FiFileText className="mr-2" />
                    New Survey
                  </motion.button>
                </Link>
                <Link to="/surveys">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline w-full"
                  >
                    View All Surveys
                  </motion.button>
                </Link>
              </div>
            </Card>

            {/* Sync Status Detail */}
            {syncStatus && (
              <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FiAlertCircle className="mr-2 text-info" />
                  Sync Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Synced</span>
                    <span className="badge badge-success">{syncStatus.synced}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <span className="badge badge-warning">{syncStatus.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conflicts</span>
                    <span className="badge badge-error">{syncStatus.conflict}</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>{syncStatus.total}</span>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
