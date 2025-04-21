
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Onboarding from '@/components/onboarding/Onboarding';
import { Shell } from '@/components/Shell';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUUIDFromClerkID } from '@/utils/auth-utils';

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
      
      // Check if user has already completed onboarding in metadata
      const onboardingCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
      console.log("Onboarding completed from metadata:", onboardingCompleted);
      
      if (onboardingCompleted) {
        // If onboarding is already completed, redirect to dashboard
        console.log("Onboarding already completed, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        try {
          // Convert Clerk ID to Supabase UUID
          const supabaseUserId = getUUIDFromClerkID(userId);
          console.log("Checking for existing profile for user ID:", supabaseUserId);
          
          // Try to create a profile record if it doesn't exist
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUserId)
            .maybeSingle();
            
          console.log("Profile check result:", existingProfile, fetchError);
            
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
                const profileData = {
                  id: supabaseUserId,
                  full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
                  avatar_url: user.imageUrl || null
                };
                
                console.log("Profile data to insert:", profileData);
                
                const { data: insertData, error: insertError } = await supabase
                  .from('profiles')
                  .insert(profileData)
                  .select();
                  
                console.log("Insert result:", insertData, insertError);
                  
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
            .eq('user_id', supabaseUserId)
            .maybeSingle();
            
          console.log("Subscriber check result:", existingSubscriber, subFetchError);
            
          if (subFetchError) {
            console.error('Error checking subscriber:', subFetchError);
          }
          
          // If no subscriber record exists, create one
          if (!existingSubscriber) {
            console.log("Creating subscriber record");
            const subscriberData = {
              user_id: supabaseUserId,
              email: user.primaryEmailAddress?.emailAddress || "",
              subscribed: false
            };
            
            console.log("Subscriber data to insert:", subscriberData);
            
            const { data: insertData, error: insertError } = await supabase
              .from('subscribers')
              .insert(subscriberData)
              .select();
              
            console.log("Subscriber insert result:", insertData, insertError);
              
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
