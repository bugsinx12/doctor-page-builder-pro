
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { useTemplates } from './website/useTemplates';
import { useWebsiteOperations } from './website/useWebsiteOperations';
import { usePracticeInfo } from './website/usePracticeInfo';

export const useWebsiteManager = () => {
  const { userId, getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const { templates, loading: templatesLoading } = useTemplates();
  const { isPracticeInfoSet, practiceInfo } = usePracticeInfo();
  const { loading: operationsLoading, createWebsite, deleteWebsite, copyLandingPageUrl } = useWebsiteOperations(websites, setWebsites);

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    const fetchWebsites = async () => {
      try {
        setLoading(true);
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

        console.log("Fetching websites for user:", supabaseUserId);

        const { data: websitesData, error: websitesError } = await supabase
          .from('websites')
          .select('*')
          .eq('userid', supabaseUserId);

        if (websitesError) {
          console.error('Error fetching websites:', websitesError);
          throw websitesError;
        }
        
        console.log("Websites data from API:", websitesData);
        
        if (websitesData && websitesData.length > 0) {
          const transformedWebsites: Website[] = websitesData.map(item => ({
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

    fetchWebsites();
  }, [userId, navigate, getToken]);

  return {
    loading: loading || operationsLoading || templatesLoading,
    websites,
    templates,
    isPracticeInfoSet,
    practiceInfo,
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl,
  };
};
