import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on page refresh
  useEffect(() => {
    async function checkSession() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const { data } = await api.get('/users/profile', { signal: controller.signal });
        setUser(data.user);
        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('Failed to fetch user profile:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  function login(userData) {
    setUser(userData);
  }

  function logout() {
    setUser(null);
  }

  // useMemo helps Vite's Fast Refresh distinguish between 
  // the component logic and the data being passed down.
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}