import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { email: string; name: string; role: string; profilePicture: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, role: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: { email: string; name: string; role: string; profilePicture: string }) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      console.log('Loaded token and user from localStorage', { storedToken, storedUser });
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting login with', { email, password });
    try {
      const response = await fetch('http://localhost:5000/api/profile/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Login response', { status: response.status, data: responseData });

      if (!responseData.token || !responseData.profile) {
        throw new Error('Invalid login response: missing token or profile');
      }

      setToken(responseData.token);
      setUser(responseData.profile);
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.profile));
      console.log('Login successful, redirecting to dashboard');
    } catch (error) {
      console.error('Login error:', error.message || error);
      throw new Error(error.message || 'Failed to fetch backend');
    }
  };

  const signup = async (name: string, role: string, email: string, password: string) => {
    console.log('Attempting signup with', { name, role, email, password });
    try {
      const response = await fetch('http://localhost:5000/api/profile/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, role, email, password }),
      });

      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Signup failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Signup response', { status: response.status, data: responseData });

      if (!responseData.token || !responseData.profile) {
        throw new Error('Invalid signup response: missing token or profile');
      }

      setToken(responseData.token);
      setUser(responseData.profile);
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.profile));
      console.log('Signup successful, redirecting to dashboard');
    } catch (error) {
      console.error('Signup error:', error.message || error);
      throw new Error(error.message || 'Failed to fetch backend');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logged out');
  };

  const updateUser = (updatedUser: { email: string; name: string; role: string; profilePicture: string }) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('User updated in context:', updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};