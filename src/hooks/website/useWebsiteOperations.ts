
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
    if (!userId) {
      console.error("No user ID available");
      toast({
        title: "Error",
        description: "User ID not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!practiceInfo.name || !practiceInfo.specialty) {
      console.error("Missing required practice information");
      toast({
        title: "Error",
        description: "Practice name and specialty are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const supabaseUserId = getUUIDFromClerkID(userId);

      console.log("Creating website with template:", templateId, "for user:", supabaseUserId);
      console.log("Practice info:", practiceInfo);

      // Determine template type from templateId
      let templateType = 'general-practice';
      if (templateId.includes('specialist')) {
        templateType = 'specialist';
      } else if (templateId.includes('pediatric')) {
        templateType = 'pediatric';
      } else if (templateId.includes('clinic')) {
        templateType = 'clinic';
      }
      
      // Generate a slug from practice name
      const slug = practiceInfo.name
        ? practiceInfo.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : `practice-${Date.now()}`;

      console.log("Generated slug:", slug);
      console.log("Using template type:", templateType);

      // Create custom content based on practice info
      const customContent: WebsiteContent = {
        hero: {
          heading: `Welcome to ${practiceInfo.name}`,
          subheading: `Expert ${practiceInfo.specialty} Care`,
          ctaText: "Schedule an Appointment",
          ctaLink: "#contact"
        },
        about: {
          heading: "About Our Practice",
          content: `${practiceInfo.name} is a dedicated medical practice specializing in ${practiceInfo.specialty}. We are committed to providing high-quality, personalized healthcare to our patients.`
        },
        services: {
          heading: "Our Services",
          subheading: "Comprehensive Healthcare Solutions",
          items: [
            {
              title: "Primary Care",
              description: "Complete health assessments and preventive care"
            },
            {
              title: "Specialized Treatment",
              description: `Expert ${practiceInfo.specialty} services`
            },
            {
              title: "Patient Care",
              description: "Personalized treatment plans and follow-up care"
            }
          ]
        },
        testimonials: [
          {
            quote: "Exceptional care and professional service",
            name: "Patient Review"
          },
          {
            quote: "Highly recommended medical practice",
            name: "Patient Testimonial"
          }
        ],
        contact: {
          heading: "Contact Us",
          subheading: "Get in Touch with Our Practice",
          address: practiceInfo.address,
          phone: practiceInfo.phone,
          email: practiceInfo.email,
          hours: "Monday - Friday: 9am - 5pm"
        }
      };

      console.log("Prepared content:", customContent);
      
      // Make sure we have valid settings for this template type
      if (!defaultSettings[templateType]) {
        console.error(`No default settings found for template type: ${templateType}`);
        throw new Error(`Invalid template type: ${templateType}`);
      }
      
      console.log("Using settings template:", defaultSettings[templateType]);

      // We need to cast our strongly-typed objects to Json for Supabase
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
          updatedat: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating website:", error);
        throw error;
      }

      console.log("Website created successfully:", data);

      if (data) {
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
        
        console.log("Transformed website data:", newWebsite);
        setWebsites([...websites, newWebsite]);
        
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
