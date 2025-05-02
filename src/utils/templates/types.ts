
import { WebsiteContent, WebsiteSettings } from '@/types';

export interface TemplateGenerationProps {
  name: string;
  specialty: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface GeneratedTemplate {
  content: WebsiteContent;
  settings: WebsiteSettings;
}

export type TemplateType = 'general-practice' | 'specialist' | 'pediatric' | 'clinic';
