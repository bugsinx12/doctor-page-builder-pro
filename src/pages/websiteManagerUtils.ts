// Utilities and defaults for WebsiteManager

import { WebsiteContent, WebsiteSettings } from '@/types';

export const defaultContent: Record<string, WebsiteContent> = {
  'general-practice': {
    hero: {
      heading: 'Welcome to Our Medical Practice',
      subheading: 'Providing quality healthcare for you and your family',
      ctaText: 'Book an Appointment',
      ctaLink: '#contact',
    },
    about: {
      heading: 'About Our Practice',
      content: 'We are dedicated to providing comprehensive healthcare services with a focus on patient comfort and wellbeing. Our team of experienced doctors and staff are committed to delivering personalized care to meet your specific needs.',
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
      address: '123 Medical Blvd, Anytown, USA',
      phone: '(555) 123-4567',
      email: 'info@medicalpractice.com',
      hours: 'Monday - Friday: 8am - 5pm',
    }
  },
  'specialist': {
    hero: {
      heading: 'Specialized Care for Your Needs',
      subheading: 'Expert specialists providing advanced medical care',
      ctaText: 'Request a Consultation',
      ctaLink: '#contact',
    },
    about: {
      heading: 'About Our Specialty Practice',
      content: 'Our specialty practice brings together highly trained specialists who are experts in their field. We use the latest technology and techniques to provide exceptional care tailored to your specific medical needs.',
    },
    services: {
      heading: 'Specialized Services',
      subheading: 'Advanced care for complex conditions',
      items: [
        {
          title: 'Diagnostic Services',
          description: 'Comprehensive testing and advanced diagnostics.'
        },
        {
          title: 'Specialized Treatments',
          description: 'Cutting-edge treatments for specific conditions.'
        },
        {
          title: 'Follow-up Care',
          description: 'Ongoing care and management after procedures.'
        }
      ]
    },
    testimonials: [
      {
        quote: 'The expertise at this practice is outstanding. My condition improved significantly after treatment.',
        name: 'Sarah Johnson',
        title: 'Patient'
      },
      {
        quote: 'The specialists here provided a level of care I couldn\'t find elsewhere.',
        name: 'Michael Brown',
        title: 'Patient'
      }
    ],
    contact: {
      heading: 'Schedule a Consultation',
      subheading: 'Take the first step toward specialized care',
      address: '456 Specialty Ave, Medtown, USA',
      phone: '(555) 987-6543',
      email: 'appointments@specialistcare.com',
      hours: 'Monday - Thursday: 9am - 6pm, Friday: 9am - 4pm',
    }
  },
  'pediatric': {
    hero: {
      heading: 'Caring for Your Child\'s Health',
      subheading: 'Compassionate pediatric care in a child-friendly environment',
      ctaText: 'Schedule a Visit',
      ctaLink: '#contact',
    },
    about: {
      heading: 'About Our Pediatric Practice',
      content: 'Our pediatric practice is dedicated to providing comprehensive healthcare for children from birth through adolescence. We create a warm, welcoming environment where children feel comfortable and parents feel confident in the care their children receive.',
    },
    services: {
      heading: 'Pediatric Services',
      subheading: 'Complete healthcare for your growing child',
      items: [
        {
          title: 'Well-Child Visits',
          description: 'Regular check-ups to monitor growth and development.'
        },
        {
          title: 'Immunizations',
          description: 'Up-to-date vaccinations following recommended schedules.'
        },
        {
          title: 'Behavioral Health',
          description: 'Support for developmental and behavioral concerns.'
        }
      ]
    },
    testimonials: [
      {
        quote: 'The doctors are so patient with my children and take time to address all our concerns.',
        name: 'Amanda Wilson',
        title: 'Parent'
      },
      {
        quote: 'My kids actually look forward to their doctor visits here!',
        name: 'David Thompson',
        title: 'Parent'
      }
    ],
    contact: {
      heading: 'Contact Our Office',
      subheading: 'We\'re here for your family',
      address: '789 Children\'s Way, Kidsville, USA',
      phone: '(555) 234-5678',
      email: 'care@pediatricpractice.com',
      hours: 'Monday - Friday: 8am - 5pm, Saturday: 9am - 12pm',
    }
  }
};

export const defaultSettings: Record<string, WebsiteSettings> = {
  'general-practice': {
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
  },
  'specialist': {
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
  },
  'pediatric': {
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
