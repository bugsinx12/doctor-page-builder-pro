
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
        setLoading(false);
        return;
      }
      
      console.log("OnboardingPage - User data:", user.id, user.firstName, user.lastName);
      const onboardingCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
      console.log("Onboarding completed from metadata:", onboardingCompleted);
      
      if (onboardingCompleted) {
        console.log("Onboarding already completed, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
        return;
      }
      
      try {
        // Initialize profile in Supabase (if needed)
        const supabaseUserId = getUUIDFromClerkID(userId);
        console.log("Checking for existing profile for user ID:", supabaseUserId);
        
        // Check if profile exists and create if needed
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUserId)
          .maybeSingle();
          
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error checking profile:", fetchError);
        }
        
        if (!existingProfile) {
          console.log("Creating new profile for user");
          const profileData = {
            id: supabaseUserId,
            full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            avatar_url: user.imageUrl || null
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
          } else {
            console.log("Profile created successfully");
          }
        } else {
          console.log("Existing profile found");
        }

        // Check if subscriber record exists and create if needed
        const { data: existingSubscriber, error: subFetchError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', supabaseUserId)
          .maybeSingle();
          
        if (subFetchError) {
          console.error('Error checking subscriber:', subFetchError);
        }
        
        if (!existingSubscriber) {
          console.log("Creating new subscriber record");
          const subscriberData = {
            user_id: supabaseUserId,
            email: user.primaryEmailAddress?.emailAddress || "",
            subscribed: false
          };
          
          const { error: insertError } = await supabase
            .from('subscribers')
            .insert(subscriberData);
            
          if (insertError) {
            console.error('Error creating subscriber record:', insertError);
          } else {
            console.log("Subscriber record created successfully");
          }
        } else {
          console.log("Existing subscriber record found");
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
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
