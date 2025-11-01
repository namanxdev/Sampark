import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiClock, FiCheckCircle, FiTrash2, FiChevronLeft, FiChevronRight, FiCloud, FiCloudOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useSurvey } from '../hooks/useSurveys';
import { surveyService } from '../services/surveyService';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { SURVEY_MODULES } from '../utils/constants';
import { getModuleFields } from '../utils/moduleFields';
import { calculateOverallCompletion, validateModule, calculateModuleCompletion, getCompletionStats } from '../utils/formValidation';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SurveyDetail = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['survey', 'common']);
  const { panchayat, user } = useAuth();
  const { isOnline } = useSync();
  const { survey, loading } = useSurvey(surveyId);
  const [activeModule, setActiveModule] = useState('basic_info');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef(null);
  const formDataRef = useRef(formData);

  // Keep formDataRef in sync with formData
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Load survey data (including drafts) on mount
  useEffect(() => {
    if (survey) {
      const loadData = async () => {
        // Try to load draft first
        const draft = await surveyService.loadDraft(surveyId);
        
        if (draft && draft.last_auto_save) {
          // Use draft if it exists and has auto-save timestamp
          console.log('📂 Restoring draft from:', new Date(draft.last_auto_save).toLocaleString());
          setFormData({
            village_name: draft.village_name || '',
            basic_info: draft.basic_info || {},
            infrastructure: draft.infrastructure || {},
            sanitation: draft.sanitation || {},
            connectivity: draft.connectivity || {},
            land_forest: draft.land_forest || {},
            electricity: draft.electricity || {},
            waste_management: draft.waste_management || {},
          });
          setLastAutoSave(draft.last_auto_save);
          toast.success('Draft restored from auto-save', { icon: '📂' });
        } else {
          // Use survey data
          setFormData({
            village_name: survey.village_name || '',
            basic_info: survey.basic_info || {},
            infrastructure: survey.infrastructure || {},
            sanitation: survey.sanitation || {},
            connectivity: survey.connectivity || {},
            land_forest: survey.land_forest || {},
            electricity: survey.electricity || {},
            waste_management: survey.waste_management || {},
          });
        }
      };
      
      loadData();
    }
  }, [survey, surveyId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const startAutoSave = () => {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }

      // Set up new auto-save timer (30 seconds)
      autoSaveTimerRef.current = setInterval(async () => {
        if (!surveyId) return;
        
        try {
          setAutoSaving(true);
          const result = await surveyService.autoSaveDraft(surveyId, formDataRef.current);
          
          if (result.success) {
            setLastAutoSave(result.timestamp);
            console.log('✅ Auto-save completed at:', new Date(result.timestamp).toLocaleString());
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }, 30000); // 30 seconds

      console.log('⏱️ Auto-save timer started (30s interval)');
    };

    // Start auto-save when component mounts
    startAutoSave();

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        console.log('⏱️ Auto-save timer cleared');
      }
    };
  }, [surveyId]);

  const handleModuleDataChange = (moduleId, data) => {
    setFormData(prev => ({
      ...prev,
      [moduleId]: data
    }));
  };

  // ✅ FIXED: Use proper field-based calculation
  const calculateCompletion = () => {
    return calculateOverallCompletion(formData);
  };

  // Get completion stats for display
  const completionStats = getCompletionStats(formData);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await surveyService.manualSave(surveyId, formData);
      
      if (result.synced) {
        toast.success(t('survey:detail.saved_synced'), { icon: '☁️' });
      } else {
        toast.success(t('survey:detail.saved_local'), { icon: '💾' });
      }
      
      // Update last save time
      setLastAutoSave(new Date().toISOString());
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(t('survey:detail.conflict_error'));
      } else {
        toast.error(t('survey:detail.save_error'));
      }
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // Confirmation dialog
    const confirmMessage = isOnline 
      ? t('survey:detail.delete_confirm')
      : t('survey:detail.delete_offline_confirm');
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    try {
      await surveyService.deleteSurvey(surveyId);
      
      if (isOnline) {
        toast.success(t('survey:detail.deleted_success'));
      } else {
        toast.success(t('survey:detail.deleted_local'));
      }
      
      // Navigate back to surveys list after short delay
      setTimeout(() => {
        navigate('/surveys');
      }, 500);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('survey:detail.delete_error'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!survey) return <div>{t('survey:detail.not_found')}</div>;

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/surveys')}
            className="btn btn-ghost mb-4"
          >
            <FiArrowLeft className="mr-2" />
            {t('survey:detail.back_to_surveys')}
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-base-content">
                  {formData.village_name || t('survey:detail.untitled_survey')}
                </h1>
                {!isOnline && (
                  <span className="badge badge-warning gap-2">
                    <FiCloudOff className="w-3 h-3" />
                    {t('survey:detail.offline')}
                  </span>
                )}
                {isOnline && (
                  <span className="badge badge-success gap-2">
                    <FiCloud className="w-3 h-3" />
                    {t('survey:detail.online')}
                  </span>
                )}
                {autoSaving && (
                  <span className="badge badge-info gap-2">
                    <span className="loading loading-spinner loading-xs"></span>
                    {t('survey:detail.auto_saving')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-base-content/60">
                <span>{panchayat?.name} • {t('survey:detail.created')} {new Date(survey.created_at).toLocaleDateString()}</span>
                {lastAutoSave && (
                  <span className="text-sm flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {t('survey:detail.last_saved')}: {new Date(lastAutoSave).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className={`btn btn-error btn-outline ${deleting ? 'loading' : ''}`}
                disabled={deleting || saving}
                title={isOnline ? t('survey:actions.delete_survey') : t('survey:detail.save_local')}
              >
                {!deleting && <FiTrash2 className="mr-2" />}
                {deleting ? t('survey:detail.deleting') : t('survey:detail.delete')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={`btn btn-primary ${saving ? 'loading' : ''}`}
                disabled={saving || deleting}
                title={isOnline ? t('survey:detail.save_sync') : t('survey:detail.save_local')}
              >
                {!saving && <FiSave className="mr-2" />}
                {saving ? t('survey:detail.saving') : t('survey:detail.save_survey')}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{t('survey:detail.overall_progress')}</span>
                {!isOnline && (
                  <span className="badge badge-sm badge-warning gap-1">
                    <FiCloudOff className="w-3 h-3" />
                    {t('survey:detail.offline_mode')}
                  </span>
                )}
                {survey.synced === false && (
                  <span className="badge badge-sm badge-info gap-1">
                    {t('survey:detail.unsynced_changes')}
                  </span>
                )}
                {survey.is_draft && (
                  <span className="badge badge-sm badge-accent gap-1">
                    {t('survey:detail.draft')}
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
            </div>
            <progress 
              className="progress progress-success w-full h-4" 
              value={completionPercentage} 
              max="100"
            ></progress>
            <div className="text-xs text-base-content/60 mt-2">
              {completionStats.filledFields} / {completionStats.totalFields} fields completed
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-base-content/60">
                  <FiClock className="mr-1" />
                  {t('survey:detail.last_updated')}: {new Date(survey.updated_at).toLocaleString()}
                </div>
                {lastAutoSave && (
                  <div className="flex items-center text-info gap-1">
                    💾 {t('survey:detail.auto_saved')}: {new Date(lastAutoSave).toLocaleTimeString()}
                  </div>
                )}
              </div>
              {completionPercentage === 100 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-success font-semibold">
                    <FiCheckCircle className="mr-1" />
                    {t('common:status.complete')}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPreview(true)}
                    className="btn btn-success btn-sm gap-2"
                  >
                    <FiCheckCircle />
                    {t('survey:detail.preview_submit')}
                  </motion.button>
                </div>
              )}
            </div>
            {!isOnline && (
              <div className="alert alert-warning mt-4">
                <FiCloudOff />
                <span className="text-sm">
                  {t('survey:detail.offline_message')}
                </span>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Survey Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Module Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h3 className="text-lg font-bold mb-4">{t('survey:detail.survey_modules')}</h3>
              <div className="space-y-2">
                {SURVEY_MODULES.map((module) => {
                  const isComplete = formData[module.id] && Object.keys(formData[module.id]).length > 0;
                  return (
                    <motion.button
                      key={module.id}
                      whileHover={{ x: 5 }}
                      onClick={() => setActiveModule(module.id)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-colors
                        ${activeModule === module.id 
                          ? 'bg-primary text-white' 
                          : 'bg-base-200 hover:bg-base-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t(`survey:modules.${module.id}`)}</span>
                        {isComplete && (
                          <FiCheckCircle className={activeModule === module.id ? 'text-white' : 'text-success'} />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Module Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card>
              <h2 className="text-2xl font-bold mb-6">
                {t(`survey:modules.${activeModule}`)}
              </h2>
              <ModuleForm
                moduleId={activeModule}
                data={formData[activeModule] || {}}
                onChange={(data) => handleModuleDataChange(activeModule, data)}
                onNext={() => {
                  const currentIndex = SURVEY_MODULES.findIndex(m => m.id === activeModule);
                  if (currentIndex < SURVEY_MODULES.length - 1) {
                    setActiveModule(SURVEY_MODULES[currentIndex + 1].id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                onPrevious={() => {
                  const currentIndex = SURVEY_MODULES.findIndex(m => m.id === activeModule);
                  if (currentIndex > 0) {
                    setActiveModule(SURVEY_MODULES[currentIndex - 1].id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                isFirst={SURVEY_MODULES[0].id === activeModule}
                isLast={SURVEY_MODULES[SURVEY_MODULES.length - 1].id === activeModule}
                allFormData={formData}
                onSave={handleSave}
              />
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          formData={formData}
          onClose={() => setShowPreview(false)}
          onSubmit={async () => {
            await handleSave();
            toast.success('🎉 Survey submitted successfully!');
            setShowPreview(false);
            navigate('/surveys');
          }}
          surveyId={surveyId}
        />
      )}
    </div>
  );
};

<<<<<<< HEAD
// ✅ NEW: Preview Modal Component
const PreviewModal = ({ formData, onClose, onSubmit, surveyId }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      toast.error('Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-base-100 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-base-content">Survey Preview</h2>
            <p className="text-sm text-base-content/60 mt-1">
              Review all information before final submission
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {SURVEY_MODULES.map((module) => {
              const moduleData = formData[module.id] || {};
              const fields = getModuleFields(module.id);
              const filledFields = fields.filter(f => {
                const value = moduleData[f.name];
                return value !== undefined && value !== null && value !== '';
              });

              if (filledFields.length === 0) return null;

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-base-200 rounded-lg p-4"
                >
                  <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <span className="text-2xl">{module.icon}</span>
                    {module.name}
                    <span className="badge badge-success badge-sm ml-2">
                      {filledFields.length} / {fields.length} fields
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filledFields.map((field) => {
                      const value = moduleData[field.name];
                      return (
                        <div key={field.name} className="bg-base-100 rounded p-3">
                          <p className="text-xs font-semibold text-base-content/60 uppercase mb-1">
                            {field.label}
                          </p>
                          <p className="text-base font-medium text-base-content">
                            {value || '-'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-base-300 flex items-center justify-between bg-base-200">
          <div className="text-sm text-base-content/60">
            <FiCheckCircle className="inline mr-1 text-success" />
            All required fields completed
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="btn btn-outline"
              disabled={submitting}
            >
              Back to Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinalSubmit}
              className={`btn btn-success gap-2 ${submitting ? 'loading' : ''}`}
              disabled={submitting}
            >
              {!submitting && <FiCheckCircle />}
              {submitting ? 'Submitting...' : 'Submit Survey'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ✅ UPDATED: Enhanced Module Form with Navigation and Validation
const ModuleForm = ({ moduleId, data, onChange, onNext, onPrevious, isFirst, isLast, allFormData, onSave }) => {
  const [validationErrors, setValidationErrors] = useState([]);
=======
// Dynamic form component for each module
const ModuleForm = ({ moduleId, data, onChange }) => {
  const { t } = useTranslation(['survey', 'common']);
>>>>>>> main
  
  const handleInputChange = (field, value) => {
    // For number inputs, validate min/max constraints
    if (field.type === 'number' && value !== '') {
      const numValue = Number(value);
      
      // Check if value exceeds maximum
      if (field.max !== undefined && numValue > field.max) {
        toast.error(t('survey:validation.max_value', { label: field.label, max: field.max }), {
          position: 'top-center'
        });
        return; // Don't update the value
      }
      
      // Check if value is below minimum
      if (field.min !== undefined && numValue < field.min) {
        toast.error(t('survey:validation.min_value', { label: field.label, min: field.min }), {
          position: 'top-center'
        });
        return; // Don't update the value
      }
    }
    
    onChange({
      ...data,
      [field.name]: value
    });
    // Clear validation errors when user types
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleNext = () => {
    // Validate current module
    const validation = validateModule(moduleId, data);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error(t('survey:detail.fill_required_fields'));
      return;
    }
    
    // Auto-save before navigation
    onSave();
    
    // Clear errors and navigate
    setValidationErrors([]);
    onNext();
  };

  const handlePrevious = () => {
    // Auto-save before navigation (optional for previous)
    onSave();
    setValidationErrors([]);
    onPrevious();
  };

  const handleFinish = () => {
    // Validate current module
    const validation = validateModule(moduleId, data);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error(t('survey:detail.fill_required_before_finish'));
      return;
    }
    
    // Save and show success
    onSave();
    toast.success(t('survey:detail.survey_completed'));
  };

  // Get fields from the centralized configuration
  const fields = getModuleFields(moduleId);
  
  // Calculate module completion
  const moduleCompletion = calculateModuleCompletion(moduleId, data);
  
  // Only count valid fields that are defined in our configuration
  const validFieldNames = fields.map(f => f.name);
  const filledFields = validFieldNames.filter(fieldName => {
    const value = data[fieldName];
    return value !== '' && value !== null && value !== undefined;
  }).length;

  return (
    <div className="space-y-6">
      {/* Module Progress Indicator */}
      <div className="alert alert-info">
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">
            📝 {filledFields} / {fields.length} {t('survey:detail.fields_completed')}
          </span>
          <span className="badge badge-success badge-lg">{moduleCompletion}%</span>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="alert alert-error">
          <div>
            <h3 className="font-bold">{t('survey:detail.fix_errors')}:</h3>
            <ul className="list-disc list-inside mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                {field.label}
                {field.required && <span className="text-error ml-1">*</span>}
              </span>
              {!field.required && (
                <span className="label-text-alt text-base-content/50">{t('survey:form.optional')}</span>
              )}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                className="textarea textarea-bordered h-24"
                value={data[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
              />
            ) : field.type === 'select' ? (
              <select
                className="select select-bordered"
                value={data[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
              >
                <option value="">{t('survey:detail.select')} {field.label}</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                className="input input-bordered"
                value={data[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="divider"></div>
      <div className="flex justify-between items-center pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrevious}
          disabled={isFirst}
          className="btn btn-outline gap-2"
        >
          <FiChevronLeft />
          {t('survey:detail.previous')}
        </motion.button>

        <div className="text-center">
          <p className="text-sm text-base-content/60">
            {t('survey:detail.module')} {SURVEY_MODULES.findIndex(m => m.id === moduleId) + 1} {t('survey:detail.of')} {SURVEY_MODULES.length}
          </p>
        </div>

        {!isLast ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="btn btn-primary gap-2"
          >
            {t('survey:detail.next')}
            <FiChevronRight />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinish}
            className="btn btn-success gap-2"
          >
            <FiCheckCircle />
            {t('survey:detail.finish')}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SurveyDetail;
