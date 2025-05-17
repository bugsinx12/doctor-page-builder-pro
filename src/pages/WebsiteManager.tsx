
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteManager } from '@/hooks/useWebsiteManager';
import { useToast } from '@/hooks/use-toast';
import { Shell } from '@/components/Shell';
import WebsiteLoadingState from '@/components/website/WebsiteLoadingState';
import WebsiteAuthError from '@/components/website/WebsiteAuthError';
import WebsiteTabContent from '@/components/website/WebsiteTabContent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // Combine auth errors from different sources
  const combinedAuthError = authError || websiteManagerAuthError;
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCreateWebsite = async (templateId: string, practiceInfo: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you are logged in.",
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
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setAuthError(null);
      setIsAuthenticated(true);
      toast({
        title: "Authentication Refreshed",
        description: "Successfully reconnected to our services.",
      });
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setAuthError(error instanceof Error ? error : new Error("Failed to refresh authentication"));
      toast({
        title: "Authentication Failed",
        description: "Could not reconnect to our services. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (websiteLoading) {
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
