
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
          .single();
          
        if (error) throw error;
        
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
          
          console.log('Practice info check:', {
            profileData,
            hasRequiredInfo,
            practice_name: profile.practice_name,
            specialty: profile.specialty
          });
          
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

  return {
    practiceInfo,
    isPracticeInfoSet,
    loading
  };
};
