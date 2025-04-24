
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';

export const usePracticeInfo = () => {
  const { userId } = useAuth();
  const [isPracticeInfoSet, setIsPracticeInfoSet] = useState(false);
  const [practiceInfo, setPracticeInfo] = useState({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!userId) return;

    const fetchPracticeInfo = async () => {
      try {
        const supabaseUserId = getUUIDFromClerkID(userId);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUserId)
          .maybeSingle();

        if (error) throw error;
        
        if (profile && profile.practice_name) {
          setIsPracticeInfoSet(true);
          setPracticeInfo({
            name: profile.practice_name || '',
            specialty: profile.specialty || '',
            address: profile.address || '',
            phone: profile.phone || '',
            email: profile.email || '',
          });
        }
      } catch (error) {
        console.error('Error fetching practice info:', error);
      }
    };

    fetchPracticeInfo();
  }, [userId]);

  return { isPracticeInfoSet, practiceInfo };
};
