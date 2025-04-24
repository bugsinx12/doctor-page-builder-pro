
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useWebsiteManager } from '@/hooks/useWebsiteManager';
import NoWebsites from '@/components/website/NoWebsites';
import NoPracticeInfo from '@/components/website/NoPracticeInfo';
import TemplatesGrid from '@/components/website/TemplatesGrid';
import WebsitesGrid from '@/components/website/WebsitesGrid';

const WebsiteManager = () => {
  const {
    loading,
    websites,
    templates,
    isPracticeInfoSet,
    practiceInfo,
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl
  } = useWebsiteManager();

  const handleTabChange = (value: string) => {
    const tabTrigger = document.querySelector(`[data-state="inactive"][value="${value}"]`);
    if (tabTrigger instanceof HTMLButtonElement) {
      tabTrigger.click();
    }
  };

  // Ensure practiceInfo has all required fields with defaults if needed
  const completePracticeInfo = {
    name: practiceInfo.name,
    specialty: practiceInfo.specialty,
    address: practiceInfo.address || 'Address not provided',
    phone: practiceInfo.phone || 'Phone not provided',
    email: practiceInfo.email || 'Email not provided'
  };

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
              onCreate={createWebsite}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteManager;
