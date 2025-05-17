
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id as string)
          .single();
          
        if (error) {
          throw error;
        }
        
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) return { success: false, error: new Error('User not authenticated') };
      
      const updateData: ProfileUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id as string);
        
      if (error) {
        throw error;
      }
      
      // Refresh profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id as string)
        .single();
        
      setProfile(data);
      return { success: true, error: null };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { 
        success: false, 
        error: err instanceof Error ? err : new Error('Failed to update profile')
      };
    }
  };
  
  return {
    profile,
    loading,
    error,
    updateProfile
  };
}
