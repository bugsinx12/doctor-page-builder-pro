
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth and set up listener for auth changes
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user just confirmed email, show a welcome toast
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          toast({
            title: 'Welcome back!',
            description: `You've successfully signed in as ${session.user.email}`,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Clear auth state from localStorage
  const cleanupAuthState = () => {
    try {
      // Remove any supabase-related items
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      console.log("Cleared Supabase auth state from local storage");
    } catch (error) {
      console.error("Error clearing Supabase auth state:", error);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // Clear any existing auth state first
      cleanupAuthState();
      
      // Try to sign out if there's an existing session
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: 'Sign-in Error',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      toast({
        title: 'Sign-in Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { error: error instanceof Error ? error : new Error('Unknown error during sign in') };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      // Clear any existing auth state first
      cleanupAuthState();
      
      // Get the current URL for proper redirect
      const currentOrigin = window.location.origin;
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${currentOrigin}/auth`
        }
      });
      
      if (error) {
        toast({
          title: 'Sign-up Error',
          description: error.message,
          variant: 'destructive',
        });
        return { error, data: null };
      }
      
      // If email confirmation is required, show a message
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: 'Verification Email Sent',
          description: 'Please check your email to verify your account.',
        });
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Error during sign up:', error);
      toast({
        title: 'Sign-up Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { 
        error: error instanceof Error ? error : new Error('Unknown error during sign up'),
        data: null
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: 'Sign-out Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      // Get the current URL for proper redirect
      const currentOrigin = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${currentOrigin}/auth?reset=true`,
      });
      
      if (error) {
        toast({
          title: 'Password Reset Error',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for a password reset link.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error during password reset:', error);
      toast({
        title: 'Password Reset Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { error: error instanceof Error ? error : new Error('Unknown error during password reset') };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast({
          title: 'Update Password Error',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Update Password Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { error: error instanceof Error ? error : new Error('Unknown error updating password') };
    }
  };

  const contextValue = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user } = useAuth();
  return { user };
};
