import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const templates = [
  {
    id: 'general-practice',
    name: 'General Practice',
    description: 'Perfect for family doctors and general practitioners',
    category: 'general',
    popular: true,
  },
  {
    id: 'specialist',
    name: 'Specialist',
    description: 'Designed for medical specialists with customizable sections',
    category: 'specialist',
    new: true,
  },
  {
    id: 'pediatric',
    name: 'Pediatrics',
    description: 'Warm and friendly design for pediatric practices',
    category: 'pediatric',
  }
];

const TemplatesSection = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Templates designed for doctors
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose from a variety of professionally designed templates 
            specifically created for medical professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden border transition-all hover:shadow-md">
              <div className="aspect-[3/2] relative bg-gray-100">
                {/* For the demo, using placeholder.svg */}
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
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={`/auth?tab=signup&template=${template.id}`}>Use Template</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
