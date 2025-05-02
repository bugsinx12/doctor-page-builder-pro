
import { TemplateGenerationProps, GeneratedTemplate } from './types';

export const generateGeneralPracticeTemplate = (
  practiceInfo: TemplateGenerationProps
): GeneratedTemplate => {
  return {
    content: {
      hero: {
        heading: `Welcome to ${practiceInfo.name}`,
        subheading: `Expert ${practiceInfo.specialty} Care`,
        ctaText: 'Book an Appointment',
        ctaLink: '#contact',
      },
      about: {
        heading: 'About Our Practice',
        content: `${practiceInfo.name} specializes in providing comprehensive ${practiceInfo.specialty} services with a focus on patient comfort and wellbeing.`,
      },
      services: {
        heading: 'Our Services',
        subheading: 'Quality healthcare for all your needs',
        items: [
          {
            title: 'Primary Care',
            description: 'Comprehensive primary care services for patients of all ages.'
          },
          {
            title: 'Preventive Care',
            description: 'Regular check-ups and screenings to maintain your health.'
          },
          {
            title: 'Chronic Disease Management',
            description: 'Ongoing care and management for chronic conditions.'
          }
        ]
      },
      testimonials: [
        {
          quote: 'The doctors and staff provide exceptional care. I always feel well taken care of.',
          name: 'Jane Smith',
        },
        {
          quote: 'Professional, caring, and efficient. Highly recommend this practice.',
          name: 'John Doe',
        }
      ],
      contact: {
        heading: 'Contact Us',
        subheading: 'We\'re here to help with any questions or concerns',
        address: practiceInfo.address || '123 Medical Blvd, Anytown, USA',
        phone: practiceInfo.phone || '(555) 123-4567',
        email: practiceInfo.email || 'info@medicalpractice.com',
        hours: 'Monday - Friday: 8am - 5pm',
      }
    },
    settings: {
      colors: {
        primary: '#4a90e2',
        secondary: '#5cb85c',
        accent: '#f0ad4e',
      },
      fonts: {
        heading: 'Roboto, sans-serif',
        body: 'Open Sans, sans-serif',
      },
      socialLinks: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
      }
    }
  };
};
