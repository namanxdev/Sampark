import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiClock, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { useSurvey } from '../hooks/useSurveys';
import { surveyService } from '../services/surveyService';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { SURVEY_MODULES } from '../utils/constants';
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

  const calculateCompletion = () => {
    const modules = SURVEY_MODULES.length;
    let completed = 0;
    SURVEY_MODULES.forEach(module => {
      if (formData[module.id] && Object.keys(formData[module.id]).length > 0) {
        completed++;
      }
    });
    return Math.round((completed / modules) * 100);
  };

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
              className="progress progress-primary w-full h-4" 
              value={completionPercentage} 
              max="100"
            ></progress>
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="flex items-center text-base-content/60">
                <FiClock className="mr-1" />
                Last updated: {new Date(survey.updated_at).toLocaleString()}
              </div>
              {completionPercentage === 100 && (
                <div className="flex items-center text-success font-semibold">
                  <FiCheckCircle className="mr-1" />
                  Complete
                </div>
              )}
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
              />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Dynamic form component for each module
const ModuleForm = ({ moduleId, data, onChange }) => {
  const handleInputChange = (field, value) => {
    // For number inputs, validate min/max constraints
    if (field.type === 'number' && value !== '') {
      const numValue = Number(value);
      
      // Check if value exceeds maximum
      if (field.max !== undefined && numValue > field.max) {
        toast.error(`Maximum value for ${field.label} is ${field.max}`, {
          position: 'top-center'
        });
        return; // Don't update the value
      }
      
      // Check if value is below minimum
      if (field.min !== undefined && numValue < field.min) {
        toast.error(`Minimum value for ${field.label} is ${field.min}`, {
          position: 'top-center'
        });
        return; // Don't update the value
      }
    }
    
    onChange({
      ...data,
      [field.name]: value
    });
  };

  // Generic form fields - customize based on your actual survey structure
  const fields = getFieldsForModule(moduleId);

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.name} className="form-control">
          <label className="label">
            <span className="label-text font-medium">{field.label}</span>
            {field.required && <span className="text-error">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              className="textarea textarea-bordered h-24"
              value={data[field.name] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={field.placeholder}
            />
          ) : field.type === 'select' ? (
            <select
              className="select select-bordered"
              value={data[field.name] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
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
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Helper function to define fields for each module
const getFieldsForModule = (moduleId) => {
  const fieldSets = {
    basic_info: [
      { name: 'population', label: 'Population', type: 'number', placeholder: 'Enter total population', required: true, min: 1, max: 99999, step: 1 },
      { name: 'households', label: 'Number of Households', type: 'number', placeholder: 'Enter number of households', required: true, min: 1, max: 9999, step: 1 },
      { name: 'literacy_rate', label: 'Literacy Rate (%)', type: 'number', placeholder: 'Enter literacy rate', required: false, min: 0, max: 100, step: 0.1 },
      { name: 'primary_occupation', label: 'Primary Occupation', type: 'select', options: ['Agriculture', 'Business', 'Service', 'Labor', 'Other'], required: false },
    ],
    infrastructure: [
      { name: 'roads', label: 'Road Conditions', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'], required: true },
      { name: 'schools', label: 'Number of Schools', type: 'number', placeholder: 'Enter number of schools', required: true, min: 0, max: 200, step: 1 },
      { name: 'hospitals', label: 'Number of Health Centers', type: 'number', placeholder: 'Enter number of health centers', required: true, min: 0, max: 50, step: 1 },
      { name: 'community_centers', label: 'Community Centers', type: 'number', placeholder: 'Enter number of community centers', required: false, min: 0, max: 100, step: 1 },
    ],
    sanitation: [
      { name: 'toilets', label: 'Household Toilets Coverage (%)', type: 'number', placeholder: 'Enter percentage', required: true, min: 0, max: 100, step: 1 },
      { name: 'drainage', label: 'Drainage System', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'], required: true },
      { name: 'water_supply', label: 'Water Supply Status', type: 'select', options: ['24x7', 'Scheduled', 'Limited', 'Insufficient'], required: true },
    ],
    connectivity: [
      { name: 'mobile_network', label: 'Mobile Network Coverage', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'], required: true },
      { name: 'internet', label: 'Internet Availability', type: 'select', options: ['Broadband', '4G', '3G', '2G', 'None'], required: true },
      { name: 'transport', label: 'Public Transport', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'], required: true },
    ],
    land_forest: [
      { name: 'agricultural_land', label: 'Agricultural Land (acres)', type: 'number', placeholder: 'Enter area in acres', required: true, min: 0, max: 50000, step: 1 },
      { name: 'forest_area', label: 'Forest Area (acres)', type: 'number', placeholder: 'Enter area in acres', required: false, min: 0, max: 100000, step: 1 },
      { name: 'irrigation', label: 'Irrigation Facilities', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'], required: true },
    ],
    electricity: [
      { name: 'coverage', label: 'Electricity Coverage (%)', type: 'number', placeholder: 'Enter percentage', required: true, min: 0, max: 100, step: 1 },
      { name: 'supply_hours', label: 'Average Supply Hours/Day', type: 'number', placeholder: 'Enter hours', required: true, min: 0, max: 24, step: 0.5 },
      { name: 'street_lights', label: 'Street Light Coverage', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'], required: false },
    ],
    waste_management: [
      { name: 'collection_system', label: 'Waste Collection System', type: 'select', options: ['Daily', 'Weekly', 'Bi-weekly', 'None'], required: true },
      { name: 'segregation', label: 'Waste Segregation Practice', type: 'select', options: ['Yes', 'No', 'Partial'], required: true },
      { name: 'disposal_method', label: 'Disposal Method', type: 'select', options: ['Composting', 'Landfill', 'Burning', 'Other'], required: true },
    ],
  };

  return fieldSets[moduleId] || [];
};

export default SurveyDetail;
