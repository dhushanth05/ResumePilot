"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";

import { login as loginApi, logout as logoutApi, register as registerApi } from "@/services/auth";
import type { LoginPayload, RegisterPayload } from "@/types/auth";

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT token to get user info
  const decodeToken = (token: string): AuthUser | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return {
        id: decoded.sub || decoded.id,
        fullName: decoded.fullName || decoded.name || 'User',
        email: decoded.email || 'user@example.com'
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const storedToken = window.localStorage.getItem("access_token");
    const storedUser = window.localStorage.getItem("user_data");
    
    if (storedToken) {
      setToken(storedToken);
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          const decodedUser = decodeToken(storedToken);
          setUser(decodedUser);
        }
      } else {
        const decodedUser = decodeToken(storedToken);
        setUser(decodedUser);
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const response = await loginApi(payload);
      
      // Using the correct TokenResponse interface
      const authToken = response.access_token;
      const userData = { 
        id: '1', 
        fullName: payload.email.split('@')[0], 
        email: payload.email 
      };
      
      if (authToken) {
        setToken(authToken);
        setUser(userData);
        
        // Persist in localStorage
        window.localStorage.setItem("access_token", authToken);
        window.localStorage.setItem("user_data", JSON.stringify(userData));
      }
      
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await registerApi(payload);
      // After registration, auto-login
      await login({ email: payload.email, password: payload.password });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("user_data");
    
    router.push("/login");
  };

  const setIsAuthenticated = (authenticated: boolean) => {
    // This is used internally for initialization
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

