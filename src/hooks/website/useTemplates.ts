
import { useState, useEffect } from 'react';
import { Template } from '@/types';
import { templates as templatesData } from '@/data/templates';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      console.log("Loading templates from data:", templatesData);
      
      // Initialize templates with proper thumbnails
      const processedTemplates = templatesData.map(template => ({
        ...template,
        thumbnail: template.thumbnail === '/placeholder.svg' ? '/doctor-hero.svg' : template.thumbnail,
        preview: template.preview === '/placeholder.svg' ? '/doctor-hero.svg' : template.preview,
        screenshots: template.screenshots.map(screenshot => 
          screenshot === '/placeholder.svg' ? '/doctor-hero.svg' : screenshot
        )
      }));
      
      setTemplates(processedTemplates);
      console.log("Templates processed successfully:", processedTemplates);
    } catch (error) {
      console.error("Error processing templates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { templates, loading };
};
