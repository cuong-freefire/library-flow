import axiosApi from '../api/axios';

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeAuthError(error, fallback) {
  if (error.request) {
    return new Error('Không thể kết nối API. Hãy bật json-server.');
  }
  return new Error(fallback);
}

export const authService = {
  async login(credentials) {
    try {
      const email = normalizeEmail(credentials.email);
      const response = await axiosApi.get('/users');
      const user = response.data.find((item) => normalizeEmail(item.email) === email);

      if (!user || user.password !== credentials.password) {
        throw new Error('Email hoặc mật khẩu không đúng.');
      }
      if (user.status === 'locked') {
        throw new Error('Tài khoản đang bị khóa.');
      }

      return { user: sanitizeUser(user) };
    } catch (error) {
      if (['Email hoặc mật khẩu không đúng.', 'Tài khoản đang bị khóa.'].includes(error.message)) {
        throw error;
      }
      throw normalizeAuthError(error, 'Đăng nhập thất bại.');
    }
  },

  async register(userData) {
    try {
      const { confirmPassword, ...payload } = userData;
      const email = normalizeEmail(payload.email);
      const existingResponse = await axiosApi.get('/users');

      if (existingResponse.data.some((user) => normalizeEmail(user.email) === email)) {
        throw new Error('Email đã tồn tại.');
      }

      const response = await axiosApi.post('/users', {
        ...payload,
        name: payload.name.trim(),
        email,
        phone: payload.phone?.trim() || '',
      });
      return { user: sanitizeUser(response.data) };
    } catch (error) {
      if (error.message === 'Email đã tồn tại.') {
        throw error;
      }
      throw normalizeAuthError(error, 'Đăng ký thất bại.');
    }
  },
};
