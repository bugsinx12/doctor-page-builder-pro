
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Onboarding from '@/components/onboarding/Onboarding';
import { Shell } from '@/components/Shell';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { Loader2 } from 'lucide-react';

const OnboardingPage = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !userId) {
        setLoading(false);
        return;
      }
      
      const onboardingCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
      
      if (onboardingCompleted) {
        navigate('/dashboard', { replace: true });
        return;
      }
      
      try {
        // Initialize profile in Supabase (if needed)
        const supabaseUserId = getUUIDFromClerkID(userId);
        
        // Check if profile already exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUserId)
          .maybeSingle();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error checking profile:", profileError);
        }
        
        // Only create profile if it doesn't exist
        if (!existingProfile) {
          const profileData = {
            id: supabaseUserId,
            full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
            avatar_url: user.imageUrl || null,
            // Initialize practice fields as null so they can be updated later
            practice_name: null,
            specialty: null,
            address: null,
            phone: null,
            email: user.primaryEmailAddress?.emailAddress || null
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
          }
        }

        // Check if subscriber record exists
        const { data: existingSubscriber, error: subError } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', supabaseUserId)
          .maybeSingle();
          
        if (subError && subError.code !== 'PGRST116') {
          console.error('Error checking subscriber:', subError);
        }
        
        // Only create subscriber if it doesn't exist
        if (!existingSubscriber) {
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
          }
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
        <Loader2 className="h-12 w-12 animate-spin text-medical-600" />
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
