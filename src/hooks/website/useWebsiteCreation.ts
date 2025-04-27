
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { useToast } from '@/hooks/use-toast';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { generateTemplateContent } from '@/utils/websiteTemplates';
import type { Json } from '@/integrations/supabase/types';
import { getWebsiteError, getValidationError } from '@/utils/websiteErrors';
import { useSupabaseClient } from '@/utils/supabaseAuth';

export const useWebsiteCreation = (websites: Website[], setWebsites: (websites: Website[]) => void) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { client: supabaseClient } = useSupabaseClient();

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
    if (!userId || !supabaseClient) {
      const error = getWebsiteError(new Error("Authentication failed"));
      toast(error);
      return null;
    }

    const validationError = getValidationError(practiceInfo);
    if (validationError) {
      toast(validationError);
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
      
      const { content, settings } = generateTemplateContent(templateType, practiceInfo);
      
      const websitePayload = {
        userid: supabaseUserId,
        name: practiceInfo.name,
        slug: slug,
        templateid: templateId,
        content: content as unknown as Json,
        settings: settings as unknown as Json,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString()
      };
      
      const { data, error } = await supabaseClient
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
      const websiteError = getWebsiteError(error);
      toast(websiteError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createWebsite, loading };
};
