
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Onboarding from '@/components/onboarding/Onboarding';
import { Shell } from '@/components/Shell';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '@/utils/supabaseAuth';
import { Button } from '@/components/ui/button';
import { useClerkSupabaseAuth } from '@/hooks/useClerkSupabaseAuth';

const OnboardingPage = () => {
  const { user } = useUser();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authVerified, setAuthVerified] = useState(false);
  const { authenticated, loading: authLoading, error: authError } = useClerkSupabaseAuth();
  
  // First, check Clerk-Supabase JWT authentication
  useEffect(() => {
    if (!authLoading) {
      setAuthVerified(authenticated);
      
      if (!authenticated && authError) {
        toast({
          title: "Authentication Error",
          description: "Please ensure your Clerk JWT template for Supabase is configured with the correct signing key.",
          variant: "destructive",
        });
      }
    }
  }, [authLoading, authenticated, authError, toast]);
  
  // Once authentication is verified, check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !userId || !authVerified) {
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
          toast({
            title: "Profile Error",
            description: "Could not check your profile information.",
            variant: "destructive",
          });
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
            toast({
              title: "Profile Error",
              description: "Could not create your profile.",
              variant: "destructive",
            });
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
          toast({
            title: "Subscription Error",
            description: "Could not check your subscription status.",
            variant: "destructive",
          });
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
            toast({
              title: "Subscription Error",
              description: "Could not create your subscription record.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user, userId, navigate, toast, authVerified]);
  
  const handleOnboardingComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleRetryAuth = () => {
    window.location.reload();
  };
  
  // Authentication error screen
  if (!authLoading && !authenticated && authError) {
    return (
      <Shell>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h2>
              <p className="text-gray-600 mb-6">
                We couldn't connect securely to our database. Please ensure your Clerk JWT template for Supabase is configured with the correct signing key.
              </p>
              <Button onClick={handleRetryAuth}>
                Retry Connection
              </Button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }
  
  // Loading screen
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-medical-600" />
      </div>
    );
  }
  
  // Only render onboarding if authentication is verified
  if (authVerified) {
    return (
      <Shell>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Shell>
    );
  }
  
  // Fallback for other authentication issues
  return (
    <Shell>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access this page.
            </p>
            <Button onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default OnboardingPage;
