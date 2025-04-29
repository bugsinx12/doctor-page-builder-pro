
import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { useToast } from '@/components/ui/use-toast';

interface InitializeUserProfileProps {
  authenticated: boolean;
  loading: boolean;
}

const InitializeUserProfile = ({ authenticated, loading }: InitializeUserProfileProps) => {
  const { user } = useUser();
  const { userId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const initializeProfile = async () => {
      if (!user || !userId || !authenticated || loading) {
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
      }
    };
    
    initializeProfile();
  }, [user, userId, toast, authenticated, loading]);

  return null; // This component doesn't render anything
};

export default InitializeUserProfile;
