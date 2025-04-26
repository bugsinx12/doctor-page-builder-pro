
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { defaultContent, defaultSettings } from '@/pages/websiteManagerUtils';

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
  ): Promise<Website | null> => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "User ID not available. Please log in and try again.",
        variant: "destructive",
      });
      return null;
    }

    if (!practiceInfo.name || !practiceInfo.specialty) {
      toast({
        title: "Incomplete Information",
        description: "Practice name and specialty are required.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      const supabaseUserId = getUUIDFromClerkID(userId);

      const templateType = templateId.includes('specialist') ? 'specialist'
        : templateId.includes('pediatric') ? 'pediatric'
        : templateId.includes('clinic') ? 'clinic'
        : 'general-practice';
      
      const slug = practiceInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `practice-${Date.now()}`;
      
      // Fix 1: Properly call the function with the appropriate type
      // Use the template type to access the corresponding content template
      const contentTemplate = defaultContent[templateType as keyof typeof defaultContent];
      
      // Populate the content template with practice info
      const websiteContent: WebsiteContent = {
        hero: {
          ...contentTemplate.hero,
        },
        about: {
          ...contentTemplate.about,
        },
        services: {
          ...contentTemplate.services,
        },
        testimonials: [...contentTemplate.testimonials],
        contact: {
          ...contentTemplate.contact,
          address: practiceInfo.address,
          phone: practiceInfo.phone,
          email: practiceInfo.email,
        }
      };

      const { data, error } = await supabase
        .from('websites')
        .insert({
          userid: supabaseUserId,
          name: practiceInfo.name,
          slug: slug,
          templateid: templateId,
          content: websiteContent as any,
          settings: defaultSettings[templateType as keyof typeof defaultSettings] as any,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating website:', error);
        toast({
          title: "Website Creation Failed",
          description: error.message || "Unable to create website. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Fix 2 & 3: Properly cast the JSON data from Supabase to the correct types
      const newWebsite: Website = {
        id: data.id,
        userId: data.userid,
        name: data.name,
        slug: data.slug,
        templateId: data.templateid,
        content: data.content as WebsiteContent,
        settings: data.settings as WebsiteSettings,
        createdAt: data.createdat,
        updatedAt: data.updatedat,
      };
      
      setWebsites([...websites, newWebsite]);
      
      toast({
        title: 'Website Created!',
        description: `Your ${practiceInfo.specialty} practice website is ready.`,
      });

      return newWebsite;
    } catch (error) {
      console.error('Unexpected error creating website:', error);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return null;
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
