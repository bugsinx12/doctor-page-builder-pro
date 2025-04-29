
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';

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
  const { isAuthenticated, isLoading: authLoading, error: authError, refreshAuth } = useSupabaseAuth();
  
  // Combine auth errors from different sources
  const combinedAuthError = authError || websiteManagerAuthError;
  
  useEffect(() => {
    if (combinedAuthError) {
      console.error("Auth error:", combinedAuthError);
      toast({
        title: "Authentication Error",
        description: "Please ensure the Clerk-Supabase integration is correctly configured.",
        variant: "destructive"
      });
    }
  }, [combinedAuthError, toast]);
  
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
        
        {combinedAuthError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              Make sure your Clerk-Supabase Third-Party Authentication is properly configured.
              <Button 
                variant="outline" 
                className="mt-2 mr-2"
                onClick={handleRetryAuth}
              >
                Retry Authentication
              </Button>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => window.open('https://clerk.com/docs/integrations/databases/supabase', '_blank')}
              >
                View Documentation
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {!combinedAuthError && !isAuthenticated && (
          <Alert variant="default" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You are signed in with Clerk but not authenticated with Supabase. Please check your Third-Party Auth configuration.
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={handleRetryAuth}
              >
                Retry Authentication
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
