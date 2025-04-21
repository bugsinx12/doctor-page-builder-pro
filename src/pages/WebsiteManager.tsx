
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { WebsiteContent, WebsiteSettings, Template, Website } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WebsiteTemplateCard from './WebsiteTemplateCard';
import WebsiteCard from './WebsiteCard';
import { defaultContent, defaultSettings } from './websiteManagerUtils';

interface WebsiteData {
  id: string;
  name: string;
  slug: string;
  templateId: string;
  content: WebsiteContent;
  settings: WebsiteSettings;
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const WebsiteManager = () => {
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

        const { data: websitesData, error: websitesError } = await supabase
          .from('websites')
          .select('*')
          .eq('userid', userId);

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
          .eq('id', userId)
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
          userid: userId,
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

      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId)
        .eq('userid', userId);

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

  const handleTabChange = (value: string) => {
    const tabTrigger = document.querySelector(`[data-state="inactive"][value="${value}"]`);
    if (tabTrigger instanceof HTMLButtonElement) {
      tabTrigger.click();
    }
  };

  const renderTemplateCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <WebsiteTemplateCard
          key={template.id}
          template={template}
          practiceInfo={practiceInfo}
          onCreate={createWebsite}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Website Manager</h1>

      <Tabs defaultValue={websites.length > 0 ? "my-websites" : "templates"}>
        <TabsList className="mb-6">
          <TabsTrigger value="my-websites">My Websites</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-websites">
          {websites.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">No websites yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't created any websites yet. Choose a template to get started.
              </p>
              <Button onClick={() => {
                const tabTrigger = document.querySelector('[data-state="inactive"][value="templates"]');
                if (tabTrigger instanceof HTMLButtonElement) tabTrigger.click();
              }}>
                Browse Templates
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map(website => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  templateName={templates.find(t => t.id === website.templateId)?.name || website.templateId}
                  onCopyUrl={copyLandingPageUrl}
                  onDelete={deleteWebsite}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          {!isPracticeInfoSet ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Set up your practice info</h3>
              <p className="text-gray-600 mb-6">
                Please complete your practice information before creating a website.
              </p>
              <Button asChild>
                <Link to="/dashboard">Update Profile</Link>
              </Button>
            </div>
          ) : (
            renderTemplateCards()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteManager;
