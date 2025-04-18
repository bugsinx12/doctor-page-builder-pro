
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Template data (similar to what we have in Templates.tsx)
const templates = [
  {
    id: 'general-practice-1',
    name: 'Modern General Practice',
    description: 'Clean, professional design for general practitioners',
    category: 'general',
    popular: true,
  },
  {
    id: 'specialist-1',
    name: 'Specialist Clinic',
    description: 'Showcase your specialty with dedicated sections',
    category: 'specialist',
    new: true,
  },
  {
    id: 'clinic-1',
    name: 'Modern Clinic',
    description: 'Multi-doctor practice with team sections',
    category: 'clinic',
    popular: true,
  },
  {
    id: 'pediatric-1',
    name: 'Pediatric Practice',
    description: 'Warm and friendly design for pediatricians',
    category: 'pediatric',
    new: true,
  },
];

interface TemplateSelectionProps {
  selectedTemplate: string | null;
  onSelect: (templateId: string) => void;
  onNext: () => void;
}

const TemplateSelection = ({ 
  selectedTemplate, 
  onSelect, 
  onNext 
}: TemplateSelectionProps) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Choose a Template</h2>
      <p className="text-gray-600 mb-6">
        Select a template that best fits your medical practice. You can customize it later.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer border overflow-hidden transition-all hover:shadow-md
              ${selectedTemplate === template.id ? 'ring-2 ring-medical-600 shadow-lg' : ''}
            `}
            onClick={() => onSelect(template.id)}
          >
            <div className="aspect-[3/2] relative bg-gray-100">
              <img
                src="/placeholder.svg"
                alt={template.name}
                className="w-full h-full object-cover"
              />
              {template.popular && (
                <Badge className="absolute top-3 right-3 bg-medical-600">Popular</Badge>
              )}
              {template.new && (
                <Badge className="absolute top-3 right-3 bg-green-600">New</Badge>
              )}
              {selectedTemplate === template.id && (
                <div className="absolute inset-0 bg-medical-600 bg-opacity-20 flex items-center justify-center">
                  <Badge className="bg-medical-600 px-3 py-1 text-lg">Selected</Badge>
                </div>
              )}
            </div>
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm">{template.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end mt-6">
        <Button 
          disabled={!selectedTemplate}
          onClick={onNext}
          className="px-6"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default TemplateSelection;
