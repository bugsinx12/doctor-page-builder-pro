
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { defaultContent, defaultSettings } from '@/pages/websiteManagerUtils';
import { Json } from '@/integrations/supabase/types';

export const useWebsiteOperations = (websites: Website[], setWebsites: (websites: Website[]) => void) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createWebsite = async (templateId: string, practiceInfo: { name: string; specialty: string }) => {
    if (!userId) return;

    try {
      setLoading(true);
      const supabaseUserId = getUUIDFromClerkID(userId);

      let templateType = 'general-practice';
      if (templateId.includes('specialist')) {
        templateType = 'specialist';
      } else if (templateId.includes('pediatric')) {
        templateType = 'pediatric';
      }
      
      const slug = practiceInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const customContent = { ...defaultContent[templateType] };
      customContent.hero.heading = `Welcome to ${practiceInfo.name}`;
      if (practiceInfo.specialty) {
        customContent.hero.subheading = `Specialized ${practiceInfo.specialty} care for our patients`;
      }

      const { data, error } = await supabase
        .from('websites')
        .insert({
          userid: supabaseUserId,
          name: practiceInfo.name,
          slug: slug,
          templateid: templateId,
          content: customContent as unknown as Json,
          settings: defaultSettings[templateType] as unknown as Json,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const transformedData: Website = {
          id: data.id,
          userId: data.userid,
          name: data.name,
          slug: data.slug,
          templateId: data.templateid,
          customDomain: data.customdomain,
          content: data.content as unknown as WebsiteContent,
          settings: data.settings as unknown as WebsiteSettings,
          createdAt: data.createdat,
          updatedAt: data.updatedat,
          publishedAt: data.publishedat || undefined,
        };
        
        setWebsites([...websites, transformedData]);
        toast({
          title: 'Success!',
          description: 'Your website has been created',
        });
      }
    } catch (error) {
      console.error('Error creating website:', error);
      toast({
        title: 'Error',
        description: 'Failed to create website',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const supabaseUserId = getUUIDFromClerkID(userId!);

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
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl,
  };
};
