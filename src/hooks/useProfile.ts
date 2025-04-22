
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "./useSupabaseAuth";

export const useProfile = () => {
  const { user } = useUser();
  const { supabaseUserId, isLoading: authLoading } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{
    practice_name: string | null;
    specialty: string | null;
    avatar_url: string | null;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!supabaseUserId || !user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching profile for user ID:", supabaseUserId);
        
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUserId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingProfile) {
          console.log("Found existing profile:", existingProfile);
          // Profile exists, check if it needs updating
          const needsUpdate = 
            existingProfile.full_name !== `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            existingProfile.avatar_url !== user.imageUrl;
          
          if (needsUpdate) {
            console.log("Updating existing profile");
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update({
                full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
                avatar_url: user.imageUrl || null,
              })
              .eq("id", supabaseUserId)
              .select()
              .single();
              
            if (updateError) throw updateError;
            setProfile(updatedProfile);
          } else {
            // Use existing profile as is
            setProfile(existingProfile);
          }
        } else {
          console.log("No profile found, creating new profile");
          // Profile doesn't exist, create it
          const profileData = {
            id: supabaseUserId,
            full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
            avatar_url: user.imageUrl || null,
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
  }, [supabaseUserId, user, toast]);

  return { profile, isLoading: isLoading || authLoading };
};
