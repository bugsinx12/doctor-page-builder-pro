
import { WebsiteContent, WebsiteSettings } from '@/types';

export const generateTemplateContent = (
  templateId: string,
  practiceInfo: {
    name: string;
    specialty: string;
    address?: string;
    phone?: string;
    email?: string;
  }
): { content: WebsiteContent; settings: WebsiteSettings } => {
  // Map templateId to template type
  let templateType: 'general-practice' | 'specialist' | 'pediatric' | 'clinic' = 'general-practice';
  
  // Determine the template type based on the ID
  if (templateId.includes('specialist')) {
    templateType = 'specialist';
  } else if (templateId.includes('pediatric')) {
    templateType = 'pediatric';
  } else if (templateId.includes('clinic')) {
    templateType = 'clinic';
  }
  
  // Base templates
  const templates = {
    'general-practice': {
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
    },
    'specialist': {
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
    },
    'pediatric': {
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
    },
    'clinic': {
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
    }
  };

  return templates[templateType];
};
