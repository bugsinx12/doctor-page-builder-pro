
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useSupabaseClient } from "@/utils/useSupabaseClient";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const useProfile = () => {
  const { user } = useUser();
  const { isAuthenticated, isLoading: authLoading, userId } = useSupabaseAuth();
  const { client: supabase, isLoading: clientLoading } = useSupabaseClient();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !user || !isAuthenticated || !supabase) {
      // If not authenticated or user data isn't loaded, don't fetch profile
      setProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        console.log("Fetching profile for Clerk ID:", userId);
        
        // Use the Clerk ID directly as the profile ID
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          throw fetchError;
        }

        if (existingProfile) {
          console.log("Found existing profile:", existingProfile);
          
          // Check if profile needs updating
          const needsUpdate = 
            existingProfile.full_name !== `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            existingProfile.avatar_url !== user.imageUrl ||
            existingProfile.email !== user.primaryEmailAddress?.emailAddress;
          
          if (needsUpdate) {
            console.log("Updating existing profile");
            const updateData: ProfileUpdate = {
              full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
              avatar_url: user.imageUrl || null,
              email: user.primaryEmailAddress?.emailAddress || null,
              updated_at: new Date().toISOString()
            };
            
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update(updateData)
              .eq("id", userId)
              .select()
              .single();
              
            if (updateError) throw updateError;
            
            if (updatedProfile) {
              setProfile(updatedProfile);
            } else {
              setProfile(existingProfile);
            }
          } else {
            // Use existing profile as is
            setProfile(existingProfile);
          }
        } else {
          console.log("No profile found, creating new profile with Clerk ID:", userId);
          
          // Create profile with ID matching the Clerk userId
          const profileData: ProfileInsert = {
            id: userId,
            full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
            avatar_url: user.imageUrl || null,
            email: user.primaryEmailAddress?.emailAddress || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(profileData)
            .select()
            .single();

          if (insertError) {
            console.error("Error creating profile:", insertError);
            throw insertError;
          }
          
          console.log("Created new profile:", newProfile);
          if (newProfile) setProfile(newProfile);
        }
      } catch (error) {
        console.error("Error in profile operations:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
        toast({
          title: "Profile Error",
          description: "Could not load or create your profile.",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user, toast, isAuthenticated, supabase]);

  // Combine loading states
  const isLoading = authLoading || clientLoading || profileLoading;

  return {
    profile,
    isLoading,
    error
  };
};
