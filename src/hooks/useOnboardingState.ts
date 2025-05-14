
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePracticeInfo } from '@/hooks/website/usePracticeInfo';
import { Website } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface PracticeInfoState {
  name: string;
  specialty: string;
  address: string;
  phone: string;
  email: string;
}

// Also export as PracticeInfo to maintain compatibility with imports
export type PracticeInfo = PracticeInfoState;

export function useOnboardingState() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const { toast } = useToast();
  const { practiceInfo, updatePracticeInfo } = usePracticeInfo();
  const [localPracticeInfo, setLocalPracticeInfo] = useState<PracticeInfoState>({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: '',
  });

  // Initialize local state from loaded practice info
  useEffect(() => {
    if (practiceInfo) {
      setLocalPracticeInfo(practiceInfo);
    }
  }, [practiceInfo]);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handlePracticeInfoChange = (values: any) => {
    setLocalPracticeInfo({
      name: values.name,
      specialty: values.specialty,
      address: values.address || '',
      phone: values.phone || '',
      email: values.email || ''
    });
  };

  const handlePracticeInfoNext = async () => {
    // Validate required fields
    if (!localPracticeInfo.name || !localPracticeInfo.specialty) {
      toast({
        title: "Missing required information",
        description: "Please provide both practice name and specialty.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Saving practice info to Supabase:", localPracticeInfo);
    
    // Save practice info to Supabase
    const success = await updatePracticeInfo(localPracticeInfo);
    if (success) {
      handleNext();
    } else {
      toast({
        title: "Failed to save practice information",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedTemplate,
    setSelectedTemplate,
    websites,
    setWebsites,
    localPracticeInfo,
    handleNext,
    handlePrevious,
    handlePracticeInfoChange,
    handlePracticeInfoNext,
    user
  };
}
