
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface InitializeUserProfileProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null | undefined;
}

// This component verifies/initializes the user profile in Supabase after Clerk auth
const InitializeUserProfile: React.FC<InitializeUserProfileProps> = ({ 
  isAuthenticated, 
  isLoading,
  userId 
}) => {
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Don't proceed if not authenticated, still loading, or if we don't have a userId
    if (!isAuthenticated || isLoading || !userId || processing || profileInitialized) {
      return;
    }

    const initProfile = async () => {
      try {
        setProcessing(true);
        console.log("Initializing user profile for Clerk ID:", userId);
        
        // Check if profile exists - use the string ID from Clerk directly
        const { data: existingProfile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking profile:", error);
          toast({
            title: "Profile Error",
            description: "Could not check if profile exists. Please reload the page.",
            variant: "destructive",
          });
          return;
        }

        // If profile doesn't exist, create it using the Clerk ID directly
        if (!existingProfile) {
          console.log("Creating new profile for Clerk user:", userId);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast({
              title: "Profile Error",
              description: "Could not create your profile. Please try again.",
              variant: "destructive",
            });
            return;
          } else {
            console.log("Profile created successfully");
            toast({
              title: "Profile Created",
              description: "Your profile is ready. Let's complete the onboarding process.",
            });
          }
        } else {
          console.log("Profile already exists for user:", userId);
        }

        setProfileInitialized(true);
      } catch (error) {
        console.error("Error initializing profile:", error);
        toast({
          title: "Profile Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
      }
    };

    initProfile();
  }, [isAuthenticated, isLoading, userId, toast, processing, profileInitialized]);

  // This component doesn't render anything visible
  return null;
};

export default InitializeUserProfile;
