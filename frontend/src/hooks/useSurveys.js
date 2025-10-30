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

    // Refetch when online/offline status changes
    const handleOnline = () => {
      console.log('Online detected, refetching surveys...');
      fetchSurveys();
    };

    const handleOffline = () => {
      console.log('Offline detected, refetching surveys from IndexedDB...');
      fetchSurveys();
    };

    // Refetch when sync completes
    const handleSyncCompleted = () => {
      console.log('Sync completed, refetching surveys...');
      fetchSurveys();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('syncCompleted', handleSyncCompleted);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncCompleted', handleSyncCompleted);
    };
  }, [panchayatId]);

  return { surveys, loading, error, refetch: fetchSurveys };
};

export const useSurvey = (surveyId) => {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (surveyId) {
      fetchSurvey();

      // Refetch when online/offline status changes
      const handleOnline = () => {
        console.log('Online detected, refetching survey...');
        fetchSurvey();
      };

      const handleOffline = () => {
        console.log('Offline detected, refetching survey from IndexedDB...');
        fetchSurvey();
      };

      // Refetch when sync completes
      const handleSyncCompleted = () => {
        console.log('Sync completed, refetching survey...');
        fetchSurvey();
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('syncCompleted', handleSyncCompleted);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('syncCompleted', handleSyncCompleted);
      };
    }
  }, [surveyId]);

  return { survey, loading, error, refetch: fetchSurvey };
};
