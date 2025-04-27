
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useWebsiteManager } from '@/hooks/useWebsiteManager';
import NoWebsites from '@/components/website/NoWebsites';
import NoPracticeInfo from '@/components/website/NoPracticeInfo';
import TemplatesGrid from '@/components/website/TemplatesGrid';
import WebsitesGrid from '@/components/website/WebsitesGrid';
import { useToast } from '@/hooks/use-toast';
import { Shell } from '@/components/Shell';
import { useSupabaseAuth } from '@/utils/supabaseAuth';

const WebsiteManager = () => {
  const {
    loading: websiteLoading,
    websites,
    templates,
    isPracticeInfoSet,
    practiceInfo,
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl
  } = useWebsiteManager();
  
  const [activeTab, setActiveTab] = useState("my-websites");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, error: authError } = useSupabaseAuth();
  
  useEffect(() => {
    if (authError) {
      toast({
        title: "Authentication Error",
        description: authError.message,
        variant: "destructive"
      });
    }
  }, [authError, toast]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCreateWebsite = async (templateId: string, practiceInfo: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you are logged in to create a website.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const website = await createWebsite(templateId, practiceInfo);
      if (website) {
        setActiveTab("my-websites");
        toast({
          title: "Success",
          description: "Website created successfully! You can view it now.",
        });
      }
    } catch (error) {
      console.error("Error creating website:", error);
      toast({
        title: "Error",
        description: "Failed to create website. Please try again.",
        variant: "destructive"
      });
    }
  };

  const completePracticeInfo = {
    name: practiceInfo?.name || '',
    specialty: practiceInfo?.specialty || '',
    address: practiceInfo?.address || 'Address not provided',
    phone: practiceInfo?.phone || 'Phone not provided',
    email: practiceInfo?.email || 'Email not provided'
  };

  const loading = websiteLoading || authLoading;

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
        </div>
      </Shell>
    );
  }

  const hasWebsites = websites && websites.length > 0;

  return (
    <Shell>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Website Manager</h1>

        <Tabs defaultValue={hasWebsites ? "my-websites" : "templates"} value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="my-websites">My Websites</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="my-websites">
            {!hasWebsites ? (
              <NoWebsites 
                onBrowseTemplates={() => handleTabChange('templates')} 
              />
            ) : (
              <WebsitesGrid
                websites={websites}
                templates={templates}
                onCopyUrl={copyLandingPageUrl}
                onDelete={deleteWebsite}
              />
            )}
          </TabsContent>

          <TabsContent value="templates">
            {!isPracticeInfoSet ? (
              <NoPracticeInfo />
            ) : (
              <TemplatesGrid
                templates={templates}
                practiceInfo={completePracticeInfo}
                onCreate={handleCreateWebsite}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
};

export default WebsiteManager;
