import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const USER_KEY = 'libraryFlowUser';

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

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
    const safeUser = sanitizeUser(nextUser);
    setUser(safeUser);
    if (safeUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
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
    persistUser(data.user);
    navigate('/books');
  };

  const logout = () => {
    persistUser(null);
    navigate('/login');
  };

  const updateProfile = async (payload) => {
    if (!user) return null;
    const updatedUser = await userService.update(user.id, payload);
    persistUser(updatedUser);
    return sanitizeUser(updatedUser);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isAuthReady,
    login,
    register,
    logout,
    updateProfile,
  };
}
