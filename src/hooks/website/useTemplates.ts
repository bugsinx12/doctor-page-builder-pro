
import { useState } from 'react';
import { Template } from '@/types';
import { templates } from '@/data/templates';

export const useTemplates = () => {
  // Use the templates from the data file instead of hardcoding them
  const [templatesList] = useState<Template[]>(templates);

  return { templates: templatesList };
};
