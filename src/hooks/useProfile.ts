
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
        
        // Check if profile exists using the user's Clerk ID directly
        // Supabase RLS will use the JWT 'sub' claim which matches the Clerk ID
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
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
          console.log("No profile found, creating new profile with ID:", userId);
          
          // Profile doesn't exist, create it with the user's Clerk ID as the ID
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
