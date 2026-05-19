import axiosApi from '../api/axios';

function normalizeAuthError(error, fallback, mode) {
  if (error.response?.status === 400) {
    if (mode === 'login') {
      return new Error('Email hoặc mật khẩu không đúng.');
    }
    return new Error('Email đã tồn tại hoặc dữ liệu không hợp lệ.');
  }
  if (error.response?.status === 401) {
    return new Error('Email hoặc mật khẩu không đúng.');
  }
  if (error.request) {
    return new Error('Không thể kết nối API. Hãy bật json-server-auth.');
  }
  return new Error(fallback);
}

export const authService = {
  async login(credentials) {
    try {
      const response = await axiosApi.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw normalizeAuthError(error, 'Đăng nhập thất bại.', 'login');
    }
  },

  async register(userData) {
    try {
      const { confirmPassword, ...payload } = userData;
      const response = await axiosApi.post('/register', payload);
      return response.data;
    } catch (error) {
      throw normalizeAuthError(error, 'Đăng ký thất bại.', 'register');
    }
  },
};
