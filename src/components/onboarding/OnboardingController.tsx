
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingControllerProps {
  authenticated: boolean;
  children: React.ReactNode;
}

const OnboardingController = ({ authenticated, children }: OnboardingControllerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    if (!authenticated || !user) return;
    
    const checkOnboardingStatus = async () => {
      try {
        // Fetch user profile to check onboarding status
        const { data, error } = await supabase
          .from('profiles')
          .select('practice_name, specialty')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error checking onboarding status:", error);
          return;
        }
        
        // If profile has practice_name and specialty, consider onboarding completed
        if (data && data.practice_name && data.specialty) {
          setIsRedirecting(true);
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate, authenticated]);
  
  if (isRedirecting) {
    return null;
  }
  
  return <>{children}</>;
};

export default OnboardingController;
