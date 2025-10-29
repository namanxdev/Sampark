import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiFilter, FiDownload, 
  FiRefreshCw, FiEdit, FiTrash2, FiEye 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSurveys } from '../hooks/useSurveys';
import { surveyService } from '../services/surveyService';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { STATUS_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

const Surveys = () => {
  const { panchayat, user } = useAuth();
  const { surveys, loading, refetch } = useSurveys(panchayat?.panchayat_id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await surveyService.batchSync(surveys);
      toast.success(`Synced ${result.synced_count} surveys successfully`);
      refetch();
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await surveyService.deleteSurvey(surveyId);
        toast.success('Survey deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete survey');
      }
    }
  };

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.village_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'complete' && survey.is_complete) ||
      (filterStatus === 'incomplete' && !survey.is_complete);
    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">Surveys</h1>
            <p className="text-base-content/60">
              Manage and track all panchayat surveys
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSync}
              className={`btn btn-outline ${syncing ? 'loading' : ''}`}
              disabled={syncing}
            >
              {!syncing && <FiRefreshCw className="mr-2" />}
              Sync
            </motion.button>
            <Link to="/surveys/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                <FiPlus className="mr-2" />
                New Survey
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search by village name..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <select
                  className="select select-bordered w-full md:w-auto"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Surveys Grid */}
        {filteredSurveys.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center py-12">
              <FiSearch className="mx-auto text-6xl text-base-content/20 mb-4" />
              <p className="text-xl text-base-content/60 mb-2">No surveys found</p>
              <p className="text-base-content/40 mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Create your first survey to get started'}
              </p>
              {!searchTerm && (
                <Link to="/surveys/new">
                  <button className="btn btn-primary">
                    <FiPlus className="mr-2" />
                    Create Survey
                  </button>
                </Link>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey, index) => {
              // Use survey_id or local_id as the identifier
              const surveyIdentifier = survey.survey_id || survey.local_id;
              
              return (
              <motion.div
                key={surveyIdentifier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="h-full">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-base-content mb-1">
                          {survey.village_name || 'Untitled Survey'}
                        </h3>
                        <p className="text-xs text-base-content/60">
                          ID: {surveyIdentifier.slice(-8)}
                        </p>
                      </div>
                      <div className={`badge ${STATUS_COLORS[survey.sync_status || 'pending']}`}>
                        {survey.synced ? 'synced' : (survey.sync_status || 'pending')}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold text-primary">
                          {survey.completion_percentage || 0}%
                        </span>
                      </div>
                      <progress 
                        className="progress progress-primary w-full" 
                        value={survey.completion_percentage || 0} 
                        max="100"
                      ></progress>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Status:</span>
                        <span className={`badge badge-sm ${survey.is_complete ? 'badge-success' : 'badge-warning'}`}>
                          {survey.is_complete ? 'Complete' : 'In Progress'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Created:</span>
                        <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Updated:</span>
                        <span>{new Date(survey.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Link to={`/surveys/${surveyIdentifier}`} className="flex-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn btn-primary btn-sm w-full"
                        >
                          <FiEye className="mr-1" />
                          View
                        </motion.button>
                      </Link>
                      <Link to={`/surveys/${surveyIdentifier}/edit`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-ghost btn-sm"
                        >
                          <FiEdit />
                        </motion.button>
                      </Link>
                      {user?.role === 'admin' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(surveyIdentifier)}
                          className="btn btn-ghost btn-sm text-error"
                        >
                          <FiTrash2 />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};

export default Surveys;
