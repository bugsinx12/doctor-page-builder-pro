
import { WebsiteContent, WebsiteSettings } from '@/types';
import { TemplateGenerationProps, TemplateType } from './templates/types';
import { generateGeneralPracticeTemplate } from './templates/generalPractice';
import { generateSpecialistTemplate } from './templates/specialist';
import { generatePediatricTemplate } from './templates/pediatric';
import { generateClinicTemplate } from './templates/clinic';

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
  // Determine the template type based on the ID
  let templateType: TemplateType = 'general-practice';
  
  if (templateId.includes('specialist')) {
    templateType = 'specialist';
  } else if (templateId.includes('pediatric')) {
    templateType = 'pediatric';
  } else if (templateId.includes('clinic')) {
    templateType = 'clinic';
  }
  
  // Generate the template based on the determined type
  switch (templateType) {
    case 'specialist':
      return generateSpecialistTemplate(practiceInfo);
    case 'pediatric':
      return generatePediatricTemplate(practiceInfo);
    case 'clinic':
      return generateClinicTemplate(practiceInfo);
    case 'general-practice':
    default:
      return generateGeneralPracticeTemplate(practiceInfo);
  }
};
