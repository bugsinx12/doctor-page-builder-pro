import { PracticeInfo } from '@/hooks/useOnboardingState';
import { WebsiteContent, WebsiteSettings } from '@/types';

/**
 * Generates template content for a website based on practice information
 */
export const generateTemplateContent = (templateId: string, practiceInfo: PracticeInfo): { 
  content: WebsiteContent; 
  settings: WebsiteSettings;
} => {
  // Default colors based on template
  const colors = {
    primary: templateId === 'pediatric' ? '#4DB6AC' : templateId === 'dental' ? '#2196F3' : '#1976D2',
    secondary: templateId === 'pediatric' ? '#81C784' : templateId === 'dental' ? '#90CAF9' : '#64B5F6',
    accent: templateId === 'pediatric' ? '#FFB74D' : templateId === 'dental' ? '#E3F2FD' : '#BBDEFB',
  };

  // Create content based on practice information
  const content: WebsiteContent = {
    hero: {
      heading: `Welcome to ${practiceInfo.name}`,
      subheading: `Professional ${practiceInfo.specialty} Care`,
      ctaText: 'Book an Appointment',
      ctaLink: '/contact',
    },
    about: {
      heading: 'About Our Practice',
      content: `At ${practiceInfo.name}, we are dedicated to providing the highest quality ${practiceInfo.specialty.toLowerCase()} care. Our experienced team of professionals is committed to your health and well-being.`,
    },
    services: {
      heading: 'Our Services',
      subheading: 'Comprehensive Care for All Your Needs',
      items: [
        {
          title: `${practiceInfo.specialty} Consultations`,
          description: 'Thorough evaluations to address your health concerns.',
        },
        {
          title: 'Preventive Care',
          description: 'Regular check-ups to maintain optimal health.',
        },
        {
          title: 'Specialized Treatments',
          description: 'Advanced techniques to address specific conditions.',
        },
      ],
    },
    testimonials: [
      {
        quote: 'Excellent care and professional staff. Highly recommended!',
        name: 'Jane D.',
      },
      {
        quote: 'The doctors here are knowledgeable and take time to listen to my concerns.',
        name: 'Robert S.',
      },
    ],
    contact: {
      heading: 'Contact Us',
      subheading: 'We\'re Here to Help',
      address: practiceInfo.address || 'Please update your address information',
      phone: practiceInfo.phone || 'Please update your phone information',
      email: practiceInfo.email || 'Please update your email information',
    },
  };

  // Create settings based on template
  const settings: WebsiteSettings = {
    colors,
    fonts: {
      heading: 'Poppins',
      body: 'Open Sans',
    },
    socialLinks: {}
  };

  return { content, settings };
};

/**
 * Validates practice information
 */
export const getValidationError = (practiceInfo: PracticeInfo) => {
  if (!practiceInfo.name || practiceInfo.name.trim() === '') {
    return {
      title: 'Missing practice name',
      description: 'Please enter your practice name',
      variant: 'destructive' as const,
    };
  }

  if (!practiceInfo.specialty || practiceInfo.specialty.trim() === '') {
    return {
      title: 'Missing specialty',
      description: 'Please enter your medical specialty',
      variant: 'destructive' as const,
    };
  }

  return null;
};

/**
 * Formats website creation errors
 */
export const getWebsiteError = (error: unknown) => {
  console.error('Website error:', error);
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return {
    title: 'Website Creation Failed',
    description: message,
    variant: 'destructive' as const,
  };
};
