
import { TemplateGenerationProps, GeneratedTemplate } from './types';

export const generateSpecialistTemplate = (
  practiceInfo: TemplateGenerationProps
): GeneratedTemplate => {
  return {
    content: {
      hero: {
        heading: `Welcome to ${practiceInfo.name}`,
        subheading: `Specialized ${practiceInfo.specialty} Care`,
        ctaText: 'Schedule a Consultation',
        ctaLink: '#contact',
      },
      about: {
        heading: 'Expert Specialist Care',
        content: `At ${practiceInfo.name}, we provide specialized ${practiceInfo.specialty} services with the latest medical advancements and personalized care approaches.`,
      },
      services: {
        heading: 'Specialized Services',
        subheading: 'Advanced medical care tailored to your needs',
        items: [
          {
            title: 'Specialized Consultations',
            description: 'Expert evaluation and treatment planning.'
          },
          {
            title: 'Advanced Procedures',
            description: 'State-of-the-art medical procedures and treatments.'
          },
          {
            title: 'Follow-up Care',
            description: 'Comprehensive follow-up and monitoring.'
          }
        ]
      },
      testimonials: [
        {
          quote: 'Outstanding specialist care with exceptional results.',
          name: 'Sarah Johnson',
        },
        {
          quote: 'The expertise and attention to detail are remarkable.',
          name: 'Michael Brown',
        }
      ],
      contact: {
        heading: 'Schedule Your Visit',
        subheading: 'Expert care is just a call away',
        address: practiceInfo.address || '456 Specialist Center, Medtown, USA',
        phone: practiceInfo.phone || '(555) 987-6543',
        email: practiceInfo.email || 'care@specialist.com',
        hours: 'Monday - Thursday: 9am - 5pm, Friday: 9am - 3pm',
      }
    },
    settings: {
      colors: {
        primary: '#673ab7',
        secondary: '#2196f3',
        accent: '#ff9800',
      },
      fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Raleway, sans-serif',
      },
      socialLinks: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
      }
    }
  };
};
