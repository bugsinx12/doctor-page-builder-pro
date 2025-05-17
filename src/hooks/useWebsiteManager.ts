
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useTemplates } from './website/useTemplates';
import { useWebsiteOperations } from './website/useWebsiteOperations';
import { usePracticeInfo } from './website/usePracticeInfo';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import type { Database } from "@/integrations/supabase/types";

type WebsiteRow = Database['public']['Tables']['websites']['Row'];

export const useWebsiteManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const { templates, loading: templatesLoading } = useTemplates();
  const { isPracticeInfoSet, practiceInfo } = usePracticeInfo();
  const { loading: operationsLoading, createWebsite, deleteWebsite, copyLandingPageUrl } = useWebsiteOperations(websites, setWebsites);
  const { userId, isLoading: authLoading, isAuthenticated, error: authError } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !userId) {
      navigate('/auth');
      return;
    }

    const fetchWebsites = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated) {
          console.warn("WebsiteManager: Not authenticated with Supabase, cannot fetch websites.");
          return;
        }

        console.log("Fetching websites for user:", userId);

        // Use the supabase client from the hook to fetch websites
        const { data: websitesData, error: websitesError } = await usePracticeInfo.client
          .from('websites')
          .select('*')
          .eq('userid', userId);

        if (websitesError) {
          console.error('Error fetching websites:', websitesError);
          throw websitesError;
        }
        
        console.log("Websites data from API:", websitesData);
        
        if (websitesData && websitesData.length > 0) {
          const transformedWebsites: Website[] = websitesData.map((item: WebsiteRow) => ({
            id: item.id,
            userId: item.userid,
            name: item.name,
            slug: item.slug,
            templateId: item.templateid,
            customDomain: item.customdomain || undefined,
            content: item.content as unknown as WebsiteContent,
            settings: item.settings as unknown as WebsiteSettings,
            createdAt: item.createdat,
            updatedAt: item.updatedat,
            publishedAt: item.publishedat || undefined,
          }));
          
          console.log("Processed websites:", transformedWebsites);
          setWebsites(transformedWebsites);
        } else {
          console.log("No websites found for user");
          setWebsites([]);
        }
      } catch (error) {
        console.error('Error fetching websites:', error);
        toast({
          title: "Error loading websites",
          description: "Could not load your websites. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !authLoading && userId) {
      fetchWebsites();
    }
  }, [userId, navigate, isAuthenticated, authLoading, toast]);

  return {
    loading: loading || operationsLoading || templatesLoading || authLoading,
    websites,
    templates,
    isPracticeInfoSet,
    practiceInfo,
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl,
    authError
  };
};
