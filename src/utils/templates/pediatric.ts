
import { TemplateGenerationProps, GeneratedTemplate } from './types';

export const generatePediatricTemplate = (
  practiceInfo: TemplateGenerationProps
): GeneratedTemplate => {
  return {
    content: {
      hero: {
        heading: `Welcome to ${practiceInfo.name}`,
        subheading: `Caring for Your Child's Health`,
        ctaText: 'Book an Appointment',
        ctaLink: '#contact',
      },
      about: {
        heading: 'Child-Focused Care',
        content: `${practiceInfo.name} provides comprehensive pediatric care in a warm, welcoming environment where children feel comfortable and parents feel confident.`,
      },
      services: {
        heading: 'Our Pediatric Services',
        subheading: 'Complete healthcare for your growing child',
        items: [
          {
            title: 'Well-Child Visits',
            description: 'Regular check-ups to monitor growth and development.'
          },
          {
            title: 'Vaccinations',
            description: 'Up-to-date immunizations following recommended schedules.'
          },
          {
            title: 'Behavioral Health',
            description: 'Support for developmental and behavioral concerns.'
          }
        ]
      },
      testimonials: [
        {
          quote: 'Such a caring team that makes my children feel comfortable.',
          name: 'Amanda Wilson',
        },
        {
          quote: 'The best pediatric care we could ask for.',
          name: 'David Thompson',
        }
      ],
      contact: {
        heading: 'Contact Our Office',
        subheading: 'We\'re here for your family',
        address: practiceInfo.address || '789 Children\'s Way, Kidsville, USA',
        phone: practiceInfo.phone || '(555) 234-5678',
        email: practiceInfo.email || 'care@pediatric.com',
        hours: 'Monday - Friday: 8am - 5pm, Saturday: 9am - 12pm',
      }
    },
    settings: {
      colors: {
        primary: '#ff7043',
        secondary: '#4caf50',
        accent: '#2196f3',
      },
      fonts: {
        heading: 'Nunito, sans-serif',
        body: 'Poppins, sans-serif',
      },
      socialLinks: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
      }
    }
  };
};
