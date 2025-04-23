
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
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const { templates } = useTemplates();
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

        const { data: websitesData, error: websitesError } = await supabase
          .from('websites')
          .select('*')
          .eq('userid', supabaseUserId);

        if (websitesError) throw websitesError;
        
        if (websitesData) {
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
          
          setWebsites(transformedWebsites);
        }
      } catch (error) {
        console.error('Error fetching websites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, [userId, navigate]);

  return {
    loading: loading || operationsLoading,
    websites,
    templates,
    isPracticeInfoSet,
    practiceInfo,
    // Pass the complete practiceInfo object to createWebsite
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl,
  };
};
