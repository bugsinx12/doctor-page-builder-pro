
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Steps } from '@/components/onboarding/Steps';
import TemplateSelection from '@/components/onboarding/TemplateSelection';
import PracticeInfo from '@/components/onboarding/PracticeInfo';
import SubscriptionSelection from '@/components/onboarding/SubscriptionSelection';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { Website } from '@/types';
import { useWebsiteOperations } from '@/hooks/website/useWebsiteOperations';
import { usePracticeInfo } from '@/hooks/website/usePracticeInfo';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useUser();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const { toast } = useToast();
  const { practiceInfo, updatePracticeInfo } = usePracticeInfo();
  const [localPracticeInfo, setLocalPracticeInfo] = useState({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: '',
  });
  
  const { createWebsite, loading: creatingWebsite } = useWebsiteOperations(websites, setWebsites);

  useEffect(() => {
    // Initialize local state from loaded practice info
    if (practiceInfo) {
      setLocalPracticeInfo(practiceInfo);
    }
  }, [practiceInfo]);

  const steps = [
    { id: 'template', title: 'Select a template' },
    { id: 'practice', title: 'Practice information' },
    { id: 'subscription', title: 'Choose a plan' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePracticeInfoChange = (values: any) => {
    console.log("Practice info changed:", values);
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

  const handleComplete = async () => {
    if (!userId || !selectedTemplate) {
      toast({
        title: "Missing information",
        description: "Please select a template and complete all steps.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Double-check that practice info is saved in Supabase
      if (!localPracticeInfo.name || !localPracticeInfo.specialty) {
        toast({
          title: "Missing practice information",
          description: "Please go back and complete your practice information.",
          variant: "destructive"
        });
        setCurrentStep(1);
        return;
      }
      
      // 1. Update Clerk user metadata
      await user?.update({
        unsafeMetadata: {
          onboardingCompleted: true,
          selectedTemplate,
          practiceInfo: localPracticeInfo
        }
      });
      
      // 2. Create website using the selected template
      const newWebsite = await createWebsite(selectedTemplate, localPracticeInfo);
      
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
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <TemplateSelection 
            selectedTemplate={selectedTemplate} 
            onSelect={setSelectedTemplate} 
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <PracticeInfo 
            practiceInfo={localPracticeInfo}
            onChange={handlePracticeInfoChange}
            onNext={handlePracticeInfoNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <SubscriptionSelection 
            onComplete={handleComplete}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-6xl py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome to Boost.Doctor!
        </h1>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Let's set up your medical practice website in just a few steps.
          Follow this guide to create a professional online presence for your practice.
        </p>
        
        <Steps 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={(index) => {
            if (index <= currentStep) {
              setCurrentStep(index);
            }
          }} 
        />
        
        <div className="mt-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
