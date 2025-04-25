
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
  if (!websites || websites.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">No websites yet</h3>
        <p className="text-gray-600 mb-6">
          You haven't created any websites yet. Choose a template to get started.
        </p>
      </div>
    );
  }
  
  console.log("Rendering websites:", websites);
  console.log("Available templates:", templates);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {websites.map(website => {
        const template = templates.find(t => t.id === website.templateId);
        console.log(`Website ${website.id} matched with template:`, template);
        
        return (
          <WebsiteCard
            key={website.id}
            website={website}
            templateName={template?.name || website.templateId}
            onCopyUrl={onCopyUrl}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default WebsitesGrid;
