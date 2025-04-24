
import { useState, useEffect } from 'react';
import { Template } from '@/types';
import { templates as templatesData } from '@/data/templates';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
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
    console.log("Templates loaded:", processedTemplates);
  }, []);

  return { templates };
};
