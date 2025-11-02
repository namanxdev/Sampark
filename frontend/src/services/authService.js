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
    try {
      // Try to call logout endpoint, but don't block if it fails
      await api.post('/api/auth/logout').catch(err => {
        console.warn('Logout API call failed, continuing with local cleanup:', err);
      });
    } finally {
      // Always clear local storage, even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('panchayat_info');
    }
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

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/api/auth/change-password', null, {
      params: {
        current_password: currentPassword,
        new_password: newPassword
      }
    });
    return response.data;
  },
};
