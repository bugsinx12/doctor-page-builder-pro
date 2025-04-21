
import { useState } from 'react';
import { Template } from '@/types';

export const useTemplates = () => {
  const [templates] = useState<Template[]>([
    {
      id: 'general-practice-1',
      name: 'Modern General Practice',
      description: 'Clean, professional design for general practitioners',
      thumbnail: '/placeholder.svg',
      category: 'general',
      features: ['Patient portal', 'Appointment booking', 'Staff profiles'],
      popular: true,
      preview: '/placeholder.svg',
      screenshots: ['/placeholder.svg', '/placeholder.svg'],
      tags: ['modern', 'clean', 'professional'],
    },
    {
      id: 'specialist-1',
      name: 'Specialist Clinic',
      description: 'Showcase your specialty with dedicated sections',
      thumbnail: '/placeholder.svg',
      category: 'specialist',
      features: ['Procedures section', 'Research highlights', 'Patient testimonials'],
      new: true,
      preview: '/placeholder.svg',
      screenshots: ['/placeholder.svg', '/placeholder.svg'],
      tags: ['specialist', 'professional', 'focused'],
    },
    {
      id: 'pediatric-1',
      name: 'Pediatric Practice',
      description: 'Warm and friendly design for pediatricians',
      thumbnail: '/placeholder.svg',
      category: 'pediatric',
      features: ['Child-friendly UI', 'Parent resources', 'Vaccination info'],
      new: true,
      preview: '/placeholder.svg',
      screenshots: ['/placeholder.svg', '/placeholder.svg'],
      tags: ['pediatric', 'friendly', 'colorful'],
    },
  ]);

  return { templates };
};
