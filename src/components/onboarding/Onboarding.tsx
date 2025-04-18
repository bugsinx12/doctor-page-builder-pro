
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Check, ChevronRight } from 'lucide-react';
import { Steps } from '@/components/onboarding/Steps';
import TemplateSelection from '@/components/onboarding/TemplateSelection';
import PracticeInfo from '@/components/onboarding/PracticeInfo';
import SubscriptionSelection from '@/components/onboarding/SubscriptionSelection';
import { useToast } from '@/components/ui/use-toast';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [practiceInfo, setPracticeInfo] = useState({
    name: '',
    specialty: '',
    address: '',
    phone: '',
    email: '',
  });
  const { toast } = useToast();

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
    try {
      // Save data to Clerk user metadata
      await user?.update({
        publicMetadata: {
          onboardingCompleted: true,
          selectedTemplate,
          practiceInfo
        }
      });
      
      toast({
        title: "Onboarding completed!",
        description: "Your website is being set up.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Error updating user metadata:', error);
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
            onChange={setPracticeInfo}
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
