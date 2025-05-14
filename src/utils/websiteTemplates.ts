
import { PracticeInfo } from '@/hooks/useOnboardingState';
import { WebsiteContent, WebsiteSettings } from '@/types';
import { generateTemplateContent } from '@/pages/websiteManagerUtils';

// Re-export the generateTemplateContent function
export { generateTemplateContent };

// Define available templates
export const availableTemplates = [
  {
    id: 'general',
    name: 'General Practice',
    description: 'A clean, professional template for general medical practices.',
    thumbnail: '/templates/general-thumbnail.jpg',
    preview: '/templates/general-preview.jpg',
  },
  {
    id: 'specialist',
    name: 'Specialist',
    description: 'Designed for medical specialists showcasing advanced services.',
    thumbnail: '/templates/specialist-thumbnail.jpg',
    preview: '/templates/specialist-preview.jpg',
  },
  {
    id: 'pediatric',
    name: 'Pediatric',
    description: 'Friendly and colorful design for pediatric practices.',
    thumbnail: '/templates/pediatric-thumbnail.jpg',
    preview: '/templates/pediatric-preview.jpg',
  },
  {
    id: 'dental',
    name: 'Dental',
    description: 'Professional template for dental practices and clinics.',
    thumbnail: '/templates/dental-thumbnail.jpg',
    preview: '/templates/dental-preview.jpg',
  }
];
