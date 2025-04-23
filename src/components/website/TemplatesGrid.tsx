
import React from 'react';
import { Template } from '@/types';
import WebsiteTemplateCard from '@/pages/WebsiteTemplateCard';

interface TemplatesGridProps {
  templates: Template[];
  practiceInfo: {
    name: string;
    specialty: string;
    address: string;
    phone: string;
    email: string;
  };
  onCreate: (templateId: string, practiceInfo: TemplatesGridProps['practiceInfo']) => Promise<void>;
}

const TemplatesGrid = ({ templates, practiceInfo, onCreate }: TemplatesGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <WebsiteTemplateCard
          key={template.id}
          template={template}
          practiceInfo={practiceInfo}
          onCreate={onCreate}
        />
      ))}
    </div>
  );
};

export default TemplatesGrid;
