
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
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUserId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!existingProfile) {
          const profileData = {
            id: supabaseUserId,
            full_name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
            avatar_url: user.imageUrl || null,
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert(profileData);

          if (insertError) throw insertError;

          // Get the newly created profile
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", supabaseUserId)
            .maybeSingle();

          if (newProfile) setProfile(newProfile);
        } else {
          setProfile(existingProfile);
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
