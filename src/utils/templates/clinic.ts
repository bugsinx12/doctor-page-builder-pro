
import { TemplateGenerationProps, GeneratedTemplate } from './types';

export const generateClinicTemplate = (
  practiceInfo: TemplateGenerationProps
): GeneratedTemplate => {
  return {
    content: {
      hero: {
        heading: `Welcome to ${practiceInfo.name}`,
        subheading: 'Comprehensive Medical Care',
        ctaText: 'Schedule a Visit',
        ctaLink: '#contact',
      },
      about: {
        heading: 'About Our Clinic',
        content: `${practiceInfo.name} is a modern medical facility offering a wide range of ${practiceInfo.specialty} services with a team of experienced healthcare professionals.`,
      },
      services: {
        heading: 'Our Medical Services',
        subheading: 'Quality care for the whole family',
        items: [
          {
            title: 'General Medicine',
            description: 'Comprehensive medical care for all ages.'
          },
          {
            title: 'Specialized Care',
            description: 'Expert care in various medical specialties.'
          },
          {
            title: 'Diagnostic Services',
            description: 'Advanced diagnostic and laboratory services.'
          }
        ]
      },
      testimonials: [
        {
          quote: 'Excellent medical care with a professional and caring staff.',
          name: 'Robert Lee',
        },
        {
          quote: 'The clinic provides great service and modern facilities.',
          name: 'Emily Chen',
        }
      ],
      contact: {
        heading: 'Visit Our Clinic',
        subheading: 'Your health is our priority',
        address: practiceInfo.address || '321 Medical Center Dr, Clinicville, USA',
        phone: practiceInfo.phone || '(555) 345-6789',
        email: practiceInfo.email || 'info@clinic.com',
        hours: 'Monday - Friday: 8am - 6pm, Saturday: 9am - 2pm',
      }
    },
    settings: {
      colors: {
        primary: '#3f51b5',
        secondary: '#009688',
        accent: '#ff5722',
      },
      fonts: {
        heading: 'Lato, sans-serif',
        body: 'Roboto, sans-serif',
      },
      socialLinks: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
      }
    }
  };
};
