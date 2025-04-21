
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Onboarding from '@/components/onboarding/Onboarding';
import { Shell } from '@/components/Shell';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const OnboardingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      // Check if user has already completed onboarding in metadata
      const onboardingCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
      
      if (onboardingCompleted) {
        // If onboarding is already completed, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        try {
          console.log("Checking for existing profile for user ID:", user.id);
          
          // Try to create a profile record if it doesn't exist
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
            
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking profile:', fetchError);
            toast({
              title: 'Error',
              description: 'Could not check your profile. Please try again.',
              variant: 'destructive'
            });
          }
          
          // If profile doesn't exist, create one with retry
          if (!existingProfile) {
            console.log("No existing profile found, creating one");
            // Set up retry logic
            let retryCount = 0;
            const maxRetries = 3;
            let success = false;
            
            while (retryCount < maxRetries && !success) {
              try {
                console.log(`Attempt ${retryCount + 1} to create profile`);
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: user.id,
                    full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
                    avatar_url: user.imageUrl || null
                  });
                  
                if (insertError) {
                  console.error(`Attempt ${retryCount + 1}: Error creating profile:`, insertError);
                  retryCount++;
                  if (retryCount === maxRetries) {
                    toast({
                      title: 'Profile Creation Error',
                      description: 'Could not create your profile. Some features may be limited.',
                      variant: 'destructive'
                    });
                  }
                  // Wait a bit before retrying
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  console.log("Profile created successfully");
                  success = true;
                }
              } catch (error) {
                console.error(`Attempt ${retryCount + 1}: Unexpected error:`, error);
                retryCount++;
              }
            }
          } else {
            console.log("Existing profile found:", existingProfile);
          }
          
          // Also check for subscriber record
          const { data: existingSubscriber, error: subFetchError } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (subFetchError) {
            console.error('Error checking subscriber:', subFetchError);
          }
          
          // If no subscriber record exists, create one
          if (!existingSubscriber) {
            console.log("Creating subscriber record");
            const { error: insertError } = await supabase
              .from('subscribers')
              .insert({
                user_id: user.id,
                email: user.primaryEmailAddress?.emailAddress || "",
                subscribed: false
              });
              
            if (insertError) {
              console.error('Error creating subscriber record:', insertError);
            } else {
              console.log("Subscriber record created successfully");
            }
          } else {
            console.log("Existing subscriber found:", existingSubscriber);
          }
        } catch (error) {
          console.error('Unexpected error:', error);
        }
      }
      
      setLoading(false);
    };
    
    checkOnboardingStatus();
  }, [user, navigate, toast]);
  
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
