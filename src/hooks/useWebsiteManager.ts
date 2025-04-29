
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useTemplates } from './website/useTemplates';
import { useWebsiteOperations } from './website/useWebsiteOperations';
import { usePracticeInfo } from './website/usePracticeInfo';
import { useClerkSupabaseAuth } from '@/hooks/useClerkSupabaseAuth';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type WebsiteRow = Database['public']['Tables']['websites']['Row'];

export const useWebsiteManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const { templates, loading: templatesLoading } = useTemplates();
  const { isPracticeInfoSet, practiceInfo } = usePracticeInfo();
  const { loading: operationsLoading, createWebsite, deleteWebsite, copyLandingPageUrl } = useWebsiteOperations(websites, setWebsites);
  const { isAuthenticated, isLoading: authLoading, error: authError, userId } = useClerkSupabaseAuth();

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    const fetchWebsites = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated) {
          console.error("Not authenticated with Supabase");
          return;
        }

        console.log("Fetching websites for user:", userId);

        const { data: websitesData, error: websitesError } = await supabase
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
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchWebsites();
    }
  }, [userId, navigate, isAuthenticated, authLoading]);

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
