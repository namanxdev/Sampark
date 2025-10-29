import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import indexedDBService from '../services/indexedDBService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [panchayat, setPanchayat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userInfo = authService.getUserInfo();
    const panchayatInfo = authService.getPanchayatInfo();
    
    if (userInfo) {
      setUser(userInfo);
      setPanchayat(panchayatInfo);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user_info);
    setPanchayat(data.panchayat_info);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    
    // Clear IndexedDB on logout (optional - you can comment this out if you want data to persist)
    try {
      await indexedDBService.clearAllData();
      console.log('IndexedDB cleared on logout');
    } catch (error) {
      console.error('Failed to clear IndexedDB on logout:', error);
    }
    
    setUser(null);
    setPanchayat(null);
  };

  const value = {
    user,
    panchayat,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
