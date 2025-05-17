
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PracticeInfoState } from '@/hooks/useOnboardingState';
import { useWebsiteOperations } from '@/hooks/website/useWebsiteOperations';
import { Website } from '@/types';

interface OnboardingCompletionProps {
  userId: string | null;
  selectedTemplate: string | null;
  practiceInfo: PracticeInfoState;
  websites: Website[];
  setWebsites: React.Dispatch<React.SetStateAction<Website[]>>;
  onComplete: () => void;
}

const OnboardingCompletion = ({
  userId,
  selectedTemplate,
  practiceInfo,
  websites,
  setWebsites,
  onComplete
}: OnboardingCompletionProps) => {
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const { createWebsite } = useWebsiteOperations(websites, setWebsites);

  const handleComplete = async () => {
    if (!userId || !selectedTemplate) {
      toast({
        title: "Missing information",
        description: "Please select a template and complete all steps.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCompleting(true);
    
    try {
      // Double-check that practice info is saved in Supabase
      if (!practiceInfo.name || !practiceInfo.specialty) {
        toast({
          title: "Missing practice information",
          description: "Please go back and complete your practice information.",
          variant: "destructive"
        });
        return;
      }
      
      // 1. Create website using the selected template
      const newWebsite = await createWebsite(selectedTemplate, practiceInfo);
      
      if (newWebsite) {
        toast({
          title: "Onboarding completed!",
          description: "Your profile and website have been created successfully.",
        });
        onComplete();
      } else {
        throw new Error("Website creation failed");
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast({
        title: "Something went wrong",
        description: "Unable to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return { handleComplete, isCompleting };
};

export default OnboardingCompletion;
