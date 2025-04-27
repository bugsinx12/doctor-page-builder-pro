
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { defaultContent, defaultSettings } from '@/pages/websiteManagerUtils';
import type { Json } from '@/integrations/supabase/types';

export const useWebsiteCreation = (websites: Website[], setWebsites: (websites: Website[]) => void) => {
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
      
      const contentTemplate = defaultContent[templateType as keyof typeof defaultContent];
      
      const websiteContent: WebsiteContent = {
        hero: {
          ...contentTemplate.hero,
          heading: `Welcome to ${practiceInfo.name}`,
          subheading: `Expert ${practiceInfo.specialty} Care`
        },
        about: {
          ...contentTemplate.about,
          content: `${practiceInfo.name} specializes in providing high-quality ${practiceInfo.specialty} services to our community.`
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
          heading: `Contact ${practiceInfo.name}`,
          subheading: 'We are here to help'
        }
      };

      const websitePayload = {
        userid: supabaseUserId,
        name: practiceInfo.name,
        slug: slug,
        templateid: templateId,
        content: websiteContent as unknown as Json,
        settings: defaultSettings[templateType as keyof typeof defaultSettings] as unknown as Json,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString()
      };

      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) throw new Error("Authentication failed. Please log in again.");
      
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw new Error("Authentication failed. Could not create a session.");
        
        const { data: verifyData } = await supabase.auth.getSession();
        if (!verifyData.session) throw new Error("Failed to create authenticated session.");
      }

      const { data, error } = await supabase
        .from('websites')
        .insert(websitePayload)
        .select()
        .single();

      if (error) throw error;

      const newWebsite: Website = {
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
      
      setWebsites([...websites, newWebsite]);
      
      toast({
        title: 'Website Created!',
        description: `Your ${practiceInfo.specialty} practice website is ready.`,
      });

      return newWebsite;
    } catch (error) {
      console.error('Error creating website:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create website',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createWebsite, loading };
};
