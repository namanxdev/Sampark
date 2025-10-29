import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { surveyService } from '../services/surveyService';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const NewSurvey = () => {
  const navigate = useNavigate();
  const { panchayat } = useAuth();
  const [villageName, setVillageName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const surveyData = {
        survey_id: `SURVEY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        panchayat_id: panchayat?.panchayat_id,
        village_name: villageName,
        basic_info: {},
        infrastructure: {},
        sanitation: {},
        connectivity: {},
        land_forest: {},
        electricity: {},
        waste_management: {},
        completion_percentage: 0,
        is_complete: false,
        client_timestamp: new Date().toISOString(),
      };

      const result = await surveyService.createSurvey(surveyData);
      toast.success('Survey created successfully!');
      navigate(`/surveys/${result.survey_id}`);
    } catch (error) {
      toast.error('Failed to create survey');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/surveys')}
            className="btn btn-ghost mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Back to Surveys
          </button>

          <Card>
            <h1 className="text-3xl font-bold text-base-content mb-6">
              Create New Survey
            </h1>

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Panchayat Info */}
              <div className="bg-base-200 p-4 rounded-lg">
                <p className="text-sm text-base-content/60 mb-1">Panchayat</p>
                <p className="font-semibold text-lg">
                  {panchayat?.name || 'Not assigned'}
                </p>
                {panchayat && (
                  <p className="text-sm text-base-content/60">
                    {panchayat.district}, {panchayat.state}
                  </p>
                )}
              </div>

              {/* Village Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-lg">Village Name</span>
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter village name"
                  className="input input-bordered input-lg"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">
                    This is the primary identifier for this survey
                  </span>
                </label>
              </div>

              {/* Info Box */}
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-sm">
                  After creating the survey, you'll be able to fill out various modules including 
                  basic information, infrastructure, sanitation, connectivity, and more.
                </span>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`btn btn-primary btn-lg w-full ${loading ? 'loading' : ''}`}
                disabled={loading || !villageName.trim()}
              >
                {!loading && <FiSave className="mr-2" />}
                {loading ? 'Creating Survey...' : 'Create Survey'}
              </motion.button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NewSurvey;
