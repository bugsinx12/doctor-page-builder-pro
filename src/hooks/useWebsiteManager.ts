import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { WebsiteContent, WebsiteSettings, Template, Website } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { defaultContent, defaultSettings } from '@/pages/websiteManagerUtils';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';

export const useWebsiteManager = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isPracticeInfoSet, setIsPracticeInfoSet] = useState(false);
  const [practiceInfo, setPracticeInfo] = useState({
    name: '',
    specialty: '',
  });

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    async function fetchData() {
      try {
        setTemplates([
          {
            id: 'general-practice-1',
            name: 'Modern General Practice',
            description: 'Clean, professional design for general practitioners',
            thumbnail: '/placeholder.svg',
            category: 'general',
            features: ['Patient portal', 'Appointment booking', 'Staff profiles'],
            popular: true,
            preview: '/placeholder.svg',
            screenshots: ['/placeholder.svg', '/placeholder.svg'],
            tags: ['modern', 'clean', 'professional'],
          },
          {
            id: 'specialist-1',
            name: 'Specialist Clinic',
            description: 'Showcase your specialty with dedicated sections',
            thumbnail: '/placeholder.svg',
            category: 'specialist',
            features: ['Procedures section', 'Research highlights', 'Patient testimonials'],
            new: true,
            preview: '/placeholder.svg',
            screenshots: ['/placeholder.svg', '/placeholder.svg'],
            tags: ['specialist', 'professional', 'focused'],
          },
          {
            id: 'pediatric-1',
            name: 'Pediatric Practice',
            description: 'Warm and friendly design for pediatricians',
            thumbnail: '/placeholder.svg',
            category: 'pediatric',
            features: ['Child-friendly UI', 'Parent resources', 'Vaccination info'],
            new: true,
            preview: '/placeholder.svg',
            screenshots: ['/placeholder.svg', '/placeholder.svg'],
            tags: ['pediatric', 'friendly', 'colorful'],
          },
        ]);

        // Convert Clerk ID to Supabase UUID
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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUserId)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (profile && profile.practice_name) {
          setIsPracticeInfoSet(true);
          setPracticeInfo({
            name: profile.practice_name || '',
            specialty: profile.specialty || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your websites',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, navigate, toast]);

  const createWebsite = async (templateId: string) => {
    if (!userId) return;

    try {
      setLoading(true);

      // Convert Clerk ID to Supabase UUID
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
          content: customContent as any,
          settings: defaultSettings[templateType] as any,
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
      
      // Convert Clerk ID to Supabase UUID
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
    websites,
    templates,
    isPracticeInfoSet,
    practiceInfo,
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl
  };
};
