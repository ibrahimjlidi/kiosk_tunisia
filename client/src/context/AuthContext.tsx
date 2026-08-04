import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { User, AuthState } from '../types/auth';
import { api } from '../services/api';
import { fetchCurrentUser, refreshAccessToken, logoutUser } from '../services/authApi';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fuelstation_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Configure Axios Request Interceptor for Auth Token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('fuelstation_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest?._retry &&
          !originalRequest.url?.endsWith('/auth/login') &&
          !originalRequest.url?.endsWith('/auth/register') &&
          !originalRequest.url?.endsWith('/auth/refresh')
        ) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await refreshAccessToken();
            localStorage.setItem('fuelstation_token', refreshResponse.token);
            setToken(refreshResponse.token);
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.token}`;
            return api(originalRequest);
          } catch (_refreshError) {
            await logout();
            return Promise.reject(_refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Fetch initial profile if token exists and refresh access token when needed
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetchCurrentUser();
          setUser(res.user);
        } catch (err: any) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            try {
              const refreshResponse = await refreshAccessToken();
              localStorage.setItem('fuelstation_token', refreshResponse.token);
              setToken(refreshResponse.token);
              const userResponse = await fetchCurrentUser();
              setUser(userResponse.user);
            } catch (refreshError) {
              console.error('Session refresh failed', refreshError);
              localStorage.removeItem('fuelstation_token');
              setToken(null);
              setUser(null);
            }
          } else {
            console.error('Session expired or invalid token', err);
            localStorage.removeItem('fuelstation_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('fuelstation_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // ignore network issues during logout, still remove local state
    }

    localStorage.removeItem('fuelstation_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const refreshResponse = await refreshAccessToken();
      localStorage.setItem('fuelstation_token', refreshResponse.token);
      setToken(refreshResponse.token);
      const res = await fetchCurrentUser();
      setUser(res.user);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      } else {
        console.error('Error refreshing session', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
