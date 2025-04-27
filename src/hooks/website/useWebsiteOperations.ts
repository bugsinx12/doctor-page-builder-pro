
import { Website } from '@/types';
import { useWebsiteCreation } from './useWebsiteCreation';
import { useWebsiteManagement } from './useWebsiteManagement';

export const useWebsiteOperations = (websites: Website[], setWebsites: (websites: Website[]) => void) => {
  const { createWebsite, loading: creationLoading } = useWebsiteCreation(websites, setWebsites);
  const { deleteWebsite, copyLandingPageUrl, loading: managementLoading } = useWebsiteManagement(websites, setWebsites);

  return {
    loading: creationLoading || managementLoading,
    createWebsite,
    deleteWebsite,
    copyLandingPageUrl,
  };
};
