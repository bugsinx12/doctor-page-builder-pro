
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Steps } from '@/components/onboarding/Steps';
import TemplateSelection from '@/components/onboarding/TemplateSelection';
import PracticeInfo from '@/components/onboarding/PracticeInfo';
import SubscriptionSelection from '@/components/onboarding/SubscriptionSelection';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import getUUIDFromClerkID from '@/utils/getUUIDFromClerkID';
import { Website } from '@/types';
import { useWebsiteOperations } from '@/hooks/website/useWebsiteOperations';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useUser();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [practiceInfo, setPracticeInfo] = useState({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: '',
  });
  const [websites, setWebsites] = useState<Website[]>([]);
  const { toast } = useToast();
  
  // Initialize website operations hook with the state we manage locally
  const { createWebsite, loading: creatingWebsite } = useWebsiteOperations(websites, setWebsites);

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

  const handleComplete = async () => {
    if (!userId || !selectedTemplate) {
      toast({
        title: "Missing information",
        description: "Please select a template and complete all steps.",
        variant: "destructive"
      });
      return;
    }
    
    if (!practiceInfo.name || !practiceInfo.specialty) {
      toast({
        title: "Missing information",
        description: "Please provide at least your practice name and specialty.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Starting onboarding completion with:", {
      selectedTemplate,
      practiceInfo
    });
    
    try {
      // 1. Save data to Clerk user metadata
      await user?.update({
        unsafeMetadata: {
          onboardingCompleted: true,
          selectedTemplate,
          practiceInfo
        }
      });
      
      console.log("Updated Clerk metadata");
      
      // 2. Update profile in Supabase with practice information
      const supabaseUserId = getUUIDFromClerkID(userId);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          practice_name: practiceInfo.name,
          specialty: practiceInfo.specialty,
          address: practiceInfo.address,
          phone: practiceInfo.phone,
          email: practiceInfo.email
        })
        .eq('id', supabaseUserId);
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }
      
      console.log("Updated Supabase profile");
      
      // 3. Create website in Supabase using the selected template
      await createWebsite(selectedTemplate, practiceInfo);
      
      console.log("Website created successfully");
      
      toast({
        title: "Onboarding completed!",
        description: "Your website has been created successfully.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error in onboarding completion:', error);
      toast({
        title: "Something went wrong",
        description: "Unable to save your information. Please try again.",
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
            practiceInfo={practiceInfo}
            onChange={(values) => {
              // Ensure all required fields are present
              setPracticeInfo({
                name: values.name,
                specialty: values.specialty,
                address: values.address || '',
                phone: values.phone || '',
                email: values.email || ''
              });
            }}
            onNext={handleNext}
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
            // Only allow clicking on steps that have already been visited
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
