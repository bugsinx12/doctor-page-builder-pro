
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  // In a real app, you would fetch the specific template data based on the ID
  // For now, we'll show a simple placeholder with the template ID
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Template: {id}</h1>
            <div className="aspect-video bg-gray-100 rounded-lg mb-8">
              <img 
                src="/placeholder.svg" 
                alt={`Template ${id}`} 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <div className="prose max-w-none mb-8">
              <p>
                This is a detailed view of the template. In a real application, this would show
                more information about the template, its features, and perhaps a live preview.
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button asChild>
                <Link to={`/signup?template=${id}`}>{t('templates.useTemplate')}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/templates">{t('templates.backToTemplates')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TemplateDetail;
