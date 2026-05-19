import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const USER_KEY = 'libraryFlowUser';

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  });
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    setIsAuthReady(true);
  }, []);

  const persistUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    persistUser(data.user);
    navigate(data.user.role === 'admin' ? '/admin' : '/books');
  };

  const register = async (userData) => {
    const data = await authService.register({
      ...userData,
      role: 'reader',
      status: 'active',
      avatar: '',
    });
    localStorage.setItem('accessToken', data.accessToken);
    persistUser(data.user);
    navigate('/books');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    persistUser(null);
    navigate('/login');
  };

  const updateProfile = async (payload) => {
    if (!user) return null;
    const updatedUser = await userService.update(user.id, payload);
    persistUser(updatedUser);
    return updatedUser;
  };

  return {
    user,
    isAuthenticated: Boolean(user && localStorage.getItem('accessToken')),
    isAuthReady,
    login,
    register,
    logout,
    updateProfile,
  };
}
