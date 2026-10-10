import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const data = await api(path, { method: 'POST', body });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    loading,
    login: (b) => authenticate('/auth/login', b),
    register: (b) => authenticate('/auth/register', b),
    logout: () => {
      localStorage.removeItem('token');
      setUser(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
