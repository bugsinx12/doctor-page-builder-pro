
import React from 'react';
import { Website, Template } from '@/types';
import WebsiteCard from '@/pages/WebsiteCard';

interface WebsitesGridProps {
  websites: Website[];
  templates: Template[];
  onCopyUrl: (websiteId: string) => void;
  onDelete: (websiteId: string) => void;
}

const WebsitesGrid = ({ websites, templates, onCopyUrl, onDelete }: WebsitesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {websites.map(website => (
        <WebsiteCard
          key={website.id}
          website={website}
          templateName={templates.find(t => t.id === website.templateId)?.name || website.templateId}
          onCopyUrl={onCopyUrl}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default WebsitesGrid;
