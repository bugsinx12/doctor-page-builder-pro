
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

  const createWebsite = async (
    templateId: string, 
    practiceInfo: { 
      name: string; 
      specialty: string; 
      address: string; 
      phone: string; 
      email: string 
    }
  ): Promise<void> => {
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
        customContent.hero.subheading = `Expert ${practiceInfo.specialty} Care`;
      }

      customContent.contact = {
        heading: 'Contact Us',
        subheading: 'Get in Touch with Our Practice',
        address: practiceInfo.address,
        phone: practiceInfo.phone,
        email: practiceInfo.email,
        hours: 'Monday - Friday: 9am - 5pm'
      };

      customContent.about.content = `${practiceInfo.name} is a dedicated medical practice specializing in ${practiceInfo.specialty}. 
        We are committed to providing high-quality, personalized healthcare to our patients.`;

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
          content: data.content as unknown as WebsiteContent,
          settings: data.settings as unknown as WebsiteSettings,
          createdAt: data.createdat,
          updatedAt: data.updatedat,
        };
        
        setWebsites([...websites, transformedData]);
        
        toast({
          title: 'Website Created!',
          description: `Your ${practiceInfo.specialty} practice website is ready.`,
        });
      }
    } catch (error) {
      console.error('Error creating website:', error);
      toast({
        title: 'Error',
        description: 'Failed to create website. Please try again.',
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
