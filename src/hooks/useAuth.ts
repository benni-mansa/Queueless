import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User, AuthState } from '../types';
import { config } from '../config/env';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  // Fetch user profile and role from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch user profile to get role
        const profile = await fetchUserProfile(session.user.id);
        const userWithProfile = {
          ...session.user,
          name: profile?.name,
          phone: profile?.phone,
          role: profile?.role || 'patient',
        } as User;

        setAuthState({
          user: userWithProfile,
          session,
          loading: false,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user profile to get role
          const profile = await fetchUserProfile(session.user.id);
          const userWithProfile = {
            ...session.user,
            name: profile?.name,
            phone: profile?.phone,
            role: profile?.role || 'patient',
          } as User;

          setAuthState({
            user: userWithProfile,
            session,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string, role: 'patient' | 'doctor' | 'admin' = 'patient'): Promise<{ data: any; error: Error | null }> => {
    try {
      console.log('🚀 [SIGNUP] Starting signup process for:', { email, name, phone, role });
      console.log('🔧 [SIGNUP] Environment check - Supabase URL:', config.supabase.url ? 'Set' : 'MISSING');
      console.log('🔧 [SIGNUP] Environment check - Supabase Anon Key:', config.supabase.anonKey ? 'Set' : 'MISSING');
      
      // Create Supabase auth user with metadata
      console.log('📝 [SIGNUP] Creating Supabase auth user with metadata...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role,
          },
        },
      });
      
      if (error) {
        console.error('❌ [SIGNUP] Supabase auth signup error:', error);
        console.error('❌ [SIGNUP] Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      console.log('✅ [SIGNUP] Auth signup successful');
      console.log('🔍 [SIGNUP] Auth response data:', {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : 'No user data',
        session: data.session ? 'Session created' : 'No session'
      });

      // The database trigger will automatically create the user profile
      // No need to manually insert into the users table
      console.log('✅ [SIGNUP] User profile will be created automatically by database trigger');
      
      console.log('🎉 [SIGNUP] Signup process completed successfully');
      
      return { data, error: null };
    } catch (error) {
      console.error('💥 [SIGNUP] Signup process failed:', error);
      console.error('💥 [SIGNUP] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ data: any; error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Fetch user profile to get role
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        const userWithProfile = {
          ...data.user,
          name: profile?.name,
          phone: profile?.phone,
          role: profile?.role || 'patient',
        } as User;

        setAuthState({
          user: userWithProfile,
          session: data.session,
          loading: false,
        });
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<{ name: string; phone: string; role: string }>): Promise<{ error: Error | null }> => {
    try {
      if (!authState.user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', authState.user.id);

      if (error) throw error;

      // Update local state with proper type casting
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { 
          ...prev.user, 
          ...updates,
          role: updates.role as 'patient' | 'doctor' | 'receptionist' | 'admin' | undefined
        } : null,
      }));

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };





  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
};
