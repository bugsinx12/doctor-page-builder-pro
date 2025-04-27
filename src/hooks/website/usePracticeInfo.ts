
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';

export const usePracticeInfo = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [practiceInfo, setPracticeInfo] = useState({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [isPracticeInfoSet, setIsPracticeInfoSet] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchPracticeInfo = async () => {
      try {
        setLoading(true);
        const supabaseUserId = getUUIDFromClerkID(userId);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('practice_name, specialty, address, phone, email')
          .eq('id', supabaseUserId)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is expected for new users
          console.error('Error fetching practice info:', error);
          throw error;
        }
        
        if (profile) {
          const profileData = {
            name: profile.practice_name || '',
            specialty: profile.specialty || '',
            address: profile.address || '',
            phone: profile.phone || '',
            email: profile.email || ''
          };
          
          setPracticeInfo(profileData);
          
          // Consider practice info set if at least practice name and specialty are provided
          const hasRequiredInfo = Boolean(
            profile.practice_name && 
            profile.specialty
          );
          
          setIsPracticeInfoSet(hasRequiredInfo);
        }
      } catch (error) {
        console.error('Error fetching practice info:', error);
        toast({
          title: 'Error',
          description: 'Failed to load practice information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeInfo();
  }, [userId, toast]);

  const updatePracticeInfo = async (newInfo: {
    name: string;
    specialty: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update practice information",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setLoading(true);
      const supabaseUserId = getUUIDFromClerkID(userId);
      
      console.log('Updating practice info to Supabase:', {
        practice_name: newInfo.name,
        specialty: newInfo.specialty,
        address: newInfo.address || null,
        phone: newInfo.phone || null,
        email: newInfo.email || null
      });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          practice_name: newInfo.name,
          specialty: newInfo.specialty,
          address: newInfo.address || null,
          phone: newInfo.phone || null,
          email: newInfo.email || null
        })
        .eq('id', supabaseUserId);
        
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      // Update local state
      setPracticeInfo({
        name: newInfo.name,
        specialty: newInfo.specialty,
        address: newInfo.address || '',
        phone: newInfo.phone || '',
        email: newInfo.email || ''
      });
      
      setIsPracticeInfoSet(Boolean(newInfo.name && newInfo.specialty));
      
      toast({
        title: "Practice information updated",
        description: "Your practice information has been saved successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating practice info:', error);
      toast({
        title: 'Error',
        description: 'Failed to update practice information',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    practiceInfo,
    isPracticeInfoSet,
    loading,
    updatePracticeInfo
  };
};
