
import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface InitializeUserProfileProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId?: string | null;
}

const InitializeUserProfile = ({ isAuthenticated, isLoading, userId }: InitializeUserProfileProps) => {
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const initializeProfile = async () => {
      if (!user || !userId || !isAuthenticated || isLoading) {
        return;
      }
      
      try {
        // Initialize profile in Supabase (if needed)
        // Check if profile already exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
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
            id: userId,
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
          .eq('user_id', userId)
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
            user_id: userId,
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
  }, [user, userId, toast, isAuthenticated, isLoading]);

  return null; // This component doesn't render anything
};

export default InitializeUserProfile;
