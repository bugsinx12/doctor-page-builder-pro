
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useClerkSupabaseAuth } from "@/hooks/useClerkSupabaseAuth";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const useProfile = () => {
  const { user } = useUser();
  const { userId, isAuthenticated, isLoading: authLoading } = useClerkSupabaseAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !user || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching profile for user with Clerk ID:", userId);
        
        // RLS will filter profiles by the user's JWT 'sub' claim
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .maybeSingle();

        if (fetchError) throw fetchError;

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
            };
            
            // RLS will ensure we can only update our own profile
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update(updateData)
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
          console.log("No profile found, creating new profile with ID:", userId);
          
          // Create profile with ID matching the Clerk userId
          // Let RLS handle user_id via JWT
          const profileData: ProfileInsert = {
            id: userId,
            full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
            avatar_url: user.imageUrl || null,
            email: user.primaryEmailAddress?.emailAddress || null,
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
        toast({
          title: "Profile Error",
          description: "Could not load or create your profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user, toast, isAuthenticated]);

  return { profile, isLoading: isLoading || authLoading };
};
