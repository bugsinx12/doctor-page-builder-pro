
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Template data - in a real app, this would come from an API
const templates = [
  {
    id: 'general-practice-1',
    name: 'Modern General Practice',
    description: 'Clean, professional design for general practitioners',
    category: 'general',
    popular: true,
  },
  {
    id: 'general-practice-2',
    name: 'Classic General Practice',
    description: 'Traditional layout with a focus on patient information',
    category: 'general',
  },
  {
    id: 'specialist-1',
    name: 'Specialist Clinic',
    description: 'Showcase your specialty with dedicated sections',
    category: 'specialist',
    new: true,
  },
  {
    id: 'specialist-2',
    name: 'Medical Specialist',
    description: 'Highlight your expertise with a modern design',
    category: 'specialist',
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
  {
    id: 'dental-1',
    name: 'Dental Practice',
    description: 'Showcase your dental services with visual elements',
    category: 'dental',
  },
  {
    id: 'dental-2',
    name: 'Modern Dental',
    description: 'Contemporary design for dental professionals',
    category: 'dental',
  },
];

const TemplatesPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gray-50 py-12 md:py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                Browse our medical templates
              </h1>
              <p className="text-lg text-gray-600">
                Choose from our collection of professionally designed templates,
                specifically created for medical professionals
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveCategory}>
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="all">All Templates</TabsTrigger>
                  <TabsTrigger value="general">General Practice</TabsTrigger>
                  <TabsTrigger value="specialist">Specialist</TabsTrigger>
                  <TabsTrigger value="clinic">Clinic</TabsTrigger>
                  <TabsTrigger value="pediatric">Pediatric</TabsTrigger>
                  <TabsTrigger value="dental">Dental</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="general" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specialist" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="clinic" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pediatric" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="dental" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

// Template card component
interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    popular?: boolean;
    new?: boolean;
  };
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <Card className="overflow-hidden border transition-all hover:shadow-md">
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
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="flex-1" asChild>
            <Link to={`/signup?template=${template.id}`}>Use Template</Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/templates/${template.id}`}>Preview</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatesPage;
