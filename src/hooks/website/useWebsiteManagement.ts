
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Website } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { useSupabaseClient } from '@/utils/supabaseAuth';

export const useWebsiteManagement = (websites: Website[], setWebsites: (websites: Website[]) => void) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { client: supabaseClient } = useSupabaseClient();

  const deleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      if (!userId || !supabaseClient) {
        throw new Error("Authentication required");
      }
      
      const supabaseUserId = getUUIDFromClerkID(userId);

      const { error } = await supabaseClient
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
