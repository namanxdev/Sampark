import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiFilter, FiDownload, 
  FiRefreshCw, FiEdit, FiTrash2, FiEye 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { useSurveys } from '../hooks/useSurveys';
import { surveyService } from '../services/surveyService';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { STATUS_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

const Surveys = () => {
  const { t } = useTranslation(['survey', 'common']);
  const { panchayat, user } = useAuth();
  const { isOnline } = useSync();
  const { surveys, loading, refetch } = useSurveys(panchayat?.panchayat_id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await surveyService.batchSync(surveys);
      toast.success(t('common:sync.sync_complete'));
      refetch();
    } catch (error) {
      toast.error(t('common:sync.sync_failed'));
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (surveyId) => {
    const survey = surveys.find(s => s.survey_id === surveyId);
    const confirmMessage = isOnline 
      ? t('survey:messages.delete_confirm', { name: survey?.village_name || 'this survey' })
      : t('survey:messages.delete_offline');
    
    if (window.confirm(confirmMessage)) {
      try {
        await surveyService.deleteSurvey(surveyId);
        
        if (isOnline) {
          toast.success(t('survey:messages.survey_deleted'));
        } else {
          toast.success(t('survey:messages.delete_offline'));
        }
        
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(t('common:messages.operation_failed'));
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
            <h1 className="text-4xl font-bold text-base-content mb-2">{t('survey:title')}</h1>
            <p className="text-base-content/60">
              {t('survey:all_surveys')}
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
              {t('common:sync.sync_now')}
            </motion.button>
            <Link to="/surveys/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                <FiPlus className="mr-2" />
                {t('survey:new_survey')}
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
                  placeholder={t('survey:search_placeholder')}
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
                  <option value="all">{t('survey:status.all')}</option>
                  <option value="complete">{t('survey:status.complete')}</option>
                  <option value="incomplete">{t('survey:status.in_progress')}</option>
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
              <p className="text-xl text-base-content/60 mb-2">{t('survey:messages.no_surveys')}</p>
              <p className="text-base-content/40 mb-6">
                {searchTerm ? t('survey:no_results') : t('survey:messages.create_first')}
              </p>
              {!searchTerm && (
                <Link to="/surveys/new">
                  <button className="btn btn-primary">
                    <FiPlus className="mr-2" />
                    {t('survey:new_survey')}
                  </button>
                </Link>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey, index) => {
              // Use survey_id, local_id, or IndexedDB id as the identifier (priority order)
              const surveyIdentifier = survey.survey_id || survey.local_id || survey.id;
              
              // Determine sync status badge based on completion percentage
              const getSyncStatus = () => {
                const completionPercentage = survey.completion_percentage || 0;
                
                if (completionPercentage === 100) {
                  return { label: 'completed', color: 'badge-success' };
                } else {
                  return { label: 'pending', color: 'badge-warning' };
                }
              };
              const syncStatus = getSyncStatus();
              
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
                      <div className={`badge ${syncStatus.color}`}>
                        {t(`common:status.${syncStatus.label}`)}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{t('survey:fields.progress')}</span>
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
                        <span className="text-base-content/60">{t('survey:fields.status')}:</span>
                        <span className={`badge badge-sm ${survey.is_complete ? 'badge-success' : 'badge-warning'}`}>
                          {survey.is_complete ? t('survey:status.complete') : t('survey:status.in_progress')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">{t('survey:fields.created_at')}:</span>
                        <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">{t('survey:fields.updated_at')}:</span>
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
                          {t('common:actions.view')}
                        </motion.button>
                      </Link>
                      <Link to={`/surveys/${surveyIdentifier}/edit`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-ghost btn-sm"
                          title={t('common:actions.edit')}
                        >
                          <FiEdit />
                        </motion.button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(surveyIdentifier)}
                        className="btn btn-ghost btn-sm text-error"
                        title={t('common:actions.delete')}
                      >
                        <FiTrash2 />
                      </motion.button>
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
