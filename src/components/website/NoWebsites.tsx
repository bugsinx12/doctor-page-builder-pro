
import React from 'react';
import { Button } from '@/components/ui/button';

interface NoWebsitesProps {
  onBrowseTemplates: () => void;
}

const NoWebsites = ({ onBrowseTemplates }: NoWebsitesProps) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-semibold mb-2">No websites yet</h3>
      <p className="text-gray-600 mb-6">
        You haven't created any websites yet. Choose a template to get started.
      </p>
      <Button onClick={onBrowseTemplates}>
        Browse Templates
      </Button>
    </div>
  );
};

export default NoWebsites;
