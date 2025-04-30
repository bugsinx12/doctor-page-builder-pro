
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Steps } from '@/components/onboarding/Steps';
import TemplateSelection from '@/components/onboarding/TemplateSelection';
import PracticeInfo from '@/components/onboarding/PracticeInfo';
import SubscriptionSelection from '@/components/onboarding/SubscriptionSelection';
import { onboardingSteps, getStepContent } from '@/components/onboarding/OnboardingSteps';
import { useWebsiteOperations } from '@/hooks/website/useWebsiteOperations';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import OnboardingCompletion from '@/components/onboarding/OnboardingCompletion';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { userId } = useAuth();
  const {
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
  } = useOnboardingState();
  
  // Initialize website operations hook
  const { createWebsite } = useWebsiteOperations(websites, setWebsites);

  // Get completion handler
  const { handleComplete, isCompleting } = OnboardingCompletion({
    userId,
    selectedTemplate,
    practiceInfo: localPracticeInfo,
    websites,
    setWebsites,
    onComplete
  });

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
          steps={onboardingSteps} 
          currentStep={currentStep} 
          onStepClick={(index) => {
            if (index <= currentStep) {
              setCurrentStep(index);
            }
          }} 
        />
        
        <div className="mt-8">
          {getStepContent(currentStep, {
            selectedTemplate,
            setSelectedTemplate,
            handleNext,
            handlePrevious,
            localPracticeInfo,
            handlePracticeInfoChange,
            handlePracticeInfoNext,
            handleComplete,
            TemplateSelection,
            PracticeInfo,
            SubscriptionSelection,
          })}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
