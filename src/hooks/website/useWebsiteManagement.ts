
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Website } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';

export const useWebsiteManagement = (websites: Website[], setWebsites: (websites: Website[]) => void) => {
  const { userId, getToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const deleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      if (!userId) {
        throw new Error("Authentication required");
      }
      
      const supabaseUserId = getUUIDFromClerkID(userId);
      
      // Get JWT token from Clerk for Supabase
      const token = await getToken({ template: "supabase" });
      
      if (!token) {
        throw new Error("Failed to get authentication token");
      }
      
      // Set the JWT on the Supabase client
      const { error: authError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      });
      
      if (authError) {
        throw authError;
      }

      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId)
        .eq('userid', supabaseUserId);

      if (error) throw error;

      setWebsites(websites.filter(website => website.id !== websiteId));
      toast({
        title: 'Website deleted',
        description: 'Your website has been successfully deleted',
      });
    } catch (error) {
      console.error('Error deleting website:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete website',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLandingPageUrl = (websiteId: string) => {
    const url = `${window.location.origin}/landings/${websiteId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL copied',
      description: 'Landing page URL has been copied to clipboard',
    });
  };

  return {
    loading,
    deleteWebsite,
    copyLandingPageUrl,
  };
};
