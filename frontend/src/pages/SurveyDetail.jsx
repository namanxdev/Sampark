import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiClock, FiCheckCircle, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  const { panchayat, user } = useAuth();
  const { isOnline } = useSync();
  const { survey, loading } = useSurvey(surveyId);
  const [activeModule, setActiveModule] = useState('basic_info');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (survey) {
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
  }, [survey]);

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
      const completionPercentage = calculateCompletion();
      const updatedData = {
        ...formData,
        completion_percentage: completionPercentage,
        is_complete: completionPercentage === 100,
        client_timestamp: new Date().toISOString(),
      };

      await surveyService.updateSurvey(surveyId, updatedData);
      
      if (isOnline) {
        toast.success('Survey saved and synced successfully!');
      } else {
        toast.success('Survey saved locally. Will sync when online.');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Conflict detected! Please resolve conflicts before saving.');
      } else {
        toast.error('Failed to save survey');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // Confirmation dialog
    const confirmMessage = isOnline 
      ? 'Are you sure you want to delete this survey? This action cannot be undone.'
      : 'You are offline. The survey will be deleted locally and removed from the server when you go online. Continue?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleting(true);
    try {
      await surveyService.deleteSurvey(surveyId);
      
      if (isOnline) {
        toast.success('Survey deleted successfully!');
      } else {
        toast.success('Survey deleted locally. Will sync deletion when online.');
      }
      
      // Navigate back to surveys list after short delay
      setTimeout(() => {
        navigate('/surveys');
      }, 500);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete survey. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!survey) return <div>Survey not found</div>;

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
            Back to Surveys
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-base-content">
                  {formData.village_name || 'Untitled Survey'}
                </h1>
                {!isOnline && (
                  <span className="badge badge-warning gap-2">
                    <span className="w-2 h-2 bg-warning rounded-full animate-pulse"></span>
                    Offline
                  </span>
                )}
              </div>
              <p className="text-base-content/60">
                {panchayat?.name} • Created {new Date(survey.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className={`btn btn-error btn-outline ${deleting ? 'loading' : ''}`}
                disabled={deleting || saving}
                title={isOnline ? 'Delete survey' : 'Delete locally (will sync when online)'}
              >
                {!deleting && <FiTrash2 className="mr-2" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={`btn btn-primary ${saving ? 'loading' : ''}`}
                disabled={saving || deleting}
                title={isOnline ? 'Save and sync' : 'Save locally (will sync when online)'}
              >
                {!saving && <FiSave className="mr-2" />}
                {saving ? 'Saving...' : 'Save Survey'}
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
                <span className="font-semibold">Overall Progress</span>
                {!isOnline && (
                  <span className="badge badge-sm badge-warning gap-1">
                    Offline Mode
                  </span>
                )}
                {survey.synced === false && (
                  <span className="badge badge-sm badge-info gap-1">
                    Unsynced Changes
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
              <div className="flex items-center text-base-content/60">
                <FiClock className="mr-1" />
                Last updated: {new Date(survey.updated_at).toLocaleString()}
              </div>
              <div className="flex items-center gap-3">
                {completionPercentage === 100 && (
                  <>
                    <div className="flex items-center text-success font-semibold">
                      <FiCheckCircle className="mr-1" />
                      Complete
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPreview(true)}
                      className="btn btn-success btn-sm gap-2"
                    >
                      <FiCheckCircle />
                      Preview & Submit
                    </motion.button>
                  </>
                )}
              </div>
            </div>
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
              <h3 className="text-lg font-bold mb-4">Survey Modules</h3>
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
                        <span className="text-sm font-medium">{module.name}</span>
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
                {SURVEY_MODULES.find(m => m.id === activeModule)?.name}
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
  
  const handleInputChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
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
      toast.error(`Please fill all required fields in ${SURVEY_MODULES.find(m => m.id === moduleId)?.name}`);
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
      toast.error('Please fill all required fields before finishing');
      return;
    }
    
    // Save and show success
    onSave();
    toast.success('🎉 Survey completed! All data saved.');
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
            📝 {filledFields} / {fields.length} fields completed
          </span>
          <span className="badge badge-success badge-lg">{moduleCompletion}%</span>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="alert alert-error">
          <div>
            <h3 className="font-bold">Please fix the following errors:</h3>
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
                <span className="label-text-alt text-base-content/50">Optional</span>
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
                <option value="">Select {field.label}</option>
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
          Previous
        </motion.button>

        <div className="text-center">
          <p className="text-sm text-base-content/60">
            Module {SURVEY_MODULES.findIndex(m => m.id === moduleId) + 1} of {SURVEY_MODULES.length}
          </p>
        </div>

        {!isLast ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="btn btn-primary gap-2"
          >
            Next
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
            Finish
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SurveyDetail;
