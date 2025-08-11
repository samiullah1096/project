import { useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user } = await getCurrentUser();
      
      if (user) {
        // Check user role from user metadata or profile
        const isAdmin = user.user_metadata?.role === 'admin' || user.email === 'admin@toolsuitepro.com';
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          isAdmin,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const isAdmin = session.user.user_metadata?.role === 'admin' || 
                          session.user.email === 'admin@toolsuitepro.com';
          setAuthState({
            user: session.user,
            isLoading: false,
            isAuthenticated: true,
            isAdmin,
          });
          
          // Auto-redirect admin users
          if (isAdmin && window.location.pathname !== '/admin') {
            setTimeout(() => {
              window.location.href = '/admin';
            }, 100);
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await signIn(email, password);
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('Login failed');
    }

    return data.user;
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    const { data, error } = await signUp(email, password, { username });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user) {
      throw new Error('Registration failed');
    }

    return data.user;
  };

  const logout = async () => {
    const { error } = await signOut();
    
    if (error) {
      console.error('Logout error:', error);
    }
    
    // Redirect to home after logout
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const updateProfile = async (updates: any): Promise<User> => {
    if (!authState.user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Profile update failed');
    }

    return data.user;
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };
}