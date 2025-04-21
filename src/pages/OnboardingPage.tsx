import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Onboarding from '@/components/onboarding/Onboarding';
import { Shell } from '@/components/Shell';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';

const OnboardingPage = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !userId) {
        console.log("No user or userId available in OnboardingPage");
        return;
      }
      
      console.log("OnboardingPage - User data:", user.id, user.firstName, user.lastName);
      const onboardingCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
      console.log("Onboarding completed from metadata:", onboardingCompleted);
      
      if (onboardingCompleted) {
        console.log("Onboarding already completed, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        try {
          const supabaseUserId = getUUIDFromClerkID(userId);
          console.log("Checking for existing profile for user ID:", supabaseUserId);
          
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUserId)
            .maybeSingle();
            
          if (fetchError && fetchError.code !== 'PGRST116') {
            toast({
              title: 'Error',
              description: 'Could not check your profile. Please try again.',
              variant: 'destructive'
            });
          }
          
          if (!existingProfile) {
            let retryCount = 0;
            const maxRetries = 3;
            let success = false;
            
            while (retryCount < maxRetries && !success) {
              try {
                const profileData = {
                  id: supabaseUserId,
                  full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
                  avatar_url: user.imageUrl || null
                };
                
                const { data: insertData, error: insertError } = await supabase
                  .from('profiles')
                  .insert(profileData)
                  .select();
                  
                if (insertError) {
                  retryCount++;
                  if (retryCount === maxRetries) {
                    toast({
                      title: 'Profile Creation Error',
                      description: 'Could not create your profile. Some features may be limited.',
                      variant: 'destructive'
                    });
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  success = true;
                }
              } catch (error) {
                retryCount++;
              }
            }
          }

          const { data: existingSubscriber, error: subFetchError } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', supabaseUserId)
            .maybeSingle();
            
          if (subFetchError) {
            console.error('Error checking subscriber:', subFetchError);
          }
          
          if (!existingSubscriber) {
            const subscriberData = {
              user_id: supabaseUserId,
              email: user.primaryEmailAddress?.emailAddress || "",
              subscribed: false
            };
            
            const { data: insertData, error: insertError } = await supabase
              .from('subscribers')
              .insert(subscriberData)
              .select();
              
            if (insertError) {
              console.error('Error creating subscriber record:', insertError);
            }
          }
        } catch (error) {
          console.error('Unexpected error:', error);
        }
      }
      
      setLoading(false);
    };
    
    checkOnboardingStatus();
  }, [user, userId, navigate, toast]);
  
  const handleOnboardingComplete = () => {
    navigate('/dashboard', { replace: true });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600"></div>
      </div>
    );
  }
  
  return (
    <Shell>
      <Onboarding onComplete={handleOnboardingComplete} />
    </Shell>
  );
};

export default OnboardingPage;
