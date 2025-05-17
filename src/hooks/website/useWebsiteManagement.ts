
import { useState } from 'react';
import { Website } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedSupabase } from '@/hooks/useAuthenticatedSupabase';
import { useAuth } from '@/contexts/AuthContext';

export const useWebsiteManagement = (websites: Website[], setWebsites: (websites: Website[]) => void) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { client: supabaseClient, isAuthenticated } = useAuthenticatedSupabase();

  const deleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      if (!userId || !supabaseClient) {
        throw new Error("Authentication required");
      }
      
      // Query by id directly since we use RLS
      const { error } = await supabaseClient
        .from('websites')
        .delete()
        .eq('id', websiteId);

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
