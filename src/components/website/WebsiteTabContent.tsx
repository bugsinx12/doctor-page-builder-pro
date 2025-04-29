
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import NoWebsites from '@/components/website/NoWebsites';
import NoPracticeInfo from '@/components/website/NoPracticeInfo';
import TemplatesGrid from '@/components/website/TemplatesGrid';
import WebsitesGrid from '@/components/website/WebsitesGrid';
import { Website, Template } from '@/types';

interface WebsiteTabContentProps {
  activeTab: string;
  websites: Website[];
  templates: Template[];
  isPracticeInfoSet: boolean;
  practiceInfo: {
    name: string;
    specialty: string;
    address: string;
    phone: string;
    email: string;
  };
  onBrowseTemplates: () => void;
  onCopyUrl: (websiteId: string) => void;
  onDelete: (websiteId: string) => void;
  onCreate: (templateId: string, practiceInfo: any) => Promise<void>;
}

const WebsiteTabContent: React.FC<WebsiteTabContentProps> = ({
  activeTab,
  websites,
  templates,
  isPracticeInfoSet,
  practiceInfo,
  onBrowseTemplates,
  onCopyUrl,
  onDelete,
  onCreate,
}) => {
  const hasWebsites = websites && websites.length > 0;

  return (
    <>
      <TabsContent value="my-websites">
        {!hasWebsites ? (
          <NoWebsites onBrowseTemplates={onBrowseTemplates} />
        ) : (
          <WebsitesGrid
            websites={websites}
            templates={templates}
            onCopyUrl={onCopyUrl}
            onDelete={onDelete}
          />
        )}
      </TabsContent>

      <TabsContent value="templates">
        {!isPracticeInfoSet ? (
          <NoPracticeInfo />
        ) : (
          <TemplatesGrid
            templates={templates}
            practiceInfo={practiceInfo}
            onCreate={onCreate}
          />
        )}
      </TabsContent>
    </>
  );
};

export default WebsiteTabContent;
