import api from './api';

export const authService = {
  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { access_token, user_info, panchayat_info } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_info', JSON.stringify(user_info));
    if (panchayat_info) {
      localStorage.setItem('panchayat_info', JSON.stringify(panchayat_info));
    }

    return response.data;
  },

  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async logout() {
    await api.post('/api/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('panchayat_info');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getUserInfo() {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  getPanchayatInfo() {
    const panchayatInfo = localStorage.getItem('panchayat_info');
    return panchayatInfo ? JSON.parse(panchayatInfo) : null;
  },
};
