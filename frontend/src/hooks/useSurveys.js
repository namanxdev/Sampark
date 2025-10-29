import { useState, useEffect } from 'react';
import { surveyService } from '../services/surveyService';
import toast from 'react-hot-toast';

export const useSurveys = (panchayatId = null) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const params = panchayatId ? { panchayat_id: panchayatId } : {};
      const data = await surveyService.getSurveys(params);
      setSurveys(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [panchayatId]);

  return { surveys, loading, error, refetch: fetchSurveys };
};

export const useSurvey = (surveyId) => {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const data = await surveyService.getSurveyById(surveyId);
        setSurvey(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to fetch survey');
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchSurvey();
    }
  }, [surveyId]);

  return { survey, loading, error };
};
