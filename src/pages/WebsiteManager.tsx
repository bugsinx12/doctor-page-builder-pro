
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteManager } from '@/hooks/useWebsiteManager';
import { useToast } from '@/hooks/use-toast';
import { Shell } from '@/components/Shell';
import { useClerkSupabaseAuth } from '@/hooks/useClerkSupabaseAuth';
import WebsiteLoadingState from '@/components/website/WebsiteLoadingState';
import WebsiteAuthError from '@/components/website/WebsiteAuthError';
import WebsiteTabContent from '@/components/website/WebsiteTabContent';

const WebsiteManager = () => {
  const {
    loading: websiteLoading,
    websites,
    templates,
    isPracticeInfoSet,
    practiceInfo,
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl,
    authError: websiteManagerAuthError
  } = useWebsiteManager();
  
  const [activeTab, setActiveTab] = useState("my-websites");
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, error: authError, refreshAuth } = useClerkSupabaseAuth();
  
  // Combine auth errors from different sources
  const combinedAuthError = authError || websiteManagerAuthError;
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCreateWebsite = async (templateId: string, practiceInfo: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you are logged in with Clerk and the Supabase integration is working correctly.",
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

  const handleRetryAuth = async () => {
    await refreshAuth();
    toast({
      title: "Authentication Refreshed",
      description: "Attempting to reconnect with Supabase...",
    });
  };

  const loading = websiteLoading || authLoading;

  if (loading) {
    return <WebsiteLoadingState />;
  }

  return (
    <Shell>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Website Manager</h1>
        
        <WebsiteAuthError 
          error={combinedAuthError}
          onRetryAuth={handleRetryAuth}
          isAuthenticated={isAuthenticated}
        />
        
        <Tabs defaultValue={websites && websites.length > 0 ? "my-websites" : "templates"} value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="my-websites">My Websites</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <WebsiteTabContent 
            activeTab={activeTab}
            websites={websites}
            templates={templates}
            isPracticeInfoSet={isPracticeInfoSet}
            practiceInfo={completePracticeInfo}
            onBrowseTemplates={() => handleTabChange('templates')}
            onCopyUrl={copyLandingPageUrl}
            onDelete={deleteWebsite}
            onCreate={handleCreateWebsite}
          />
        </Tabs>
      </div>
    </Shell>
  );
};

export default WebsiteManager;
