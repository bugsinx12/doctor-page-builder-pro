
import React from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
}

export const onboardingSteps: OnboardingStep[] = [
  { id: 'template', title: 'Select a template' },
  { id: 'practice', title: 'Practice information' },
  { id: 'subscription', title: 'Choose a plan' },
];

export const getStepContent = (
  currentStep: number, 
  props: any
) => {
  const { 
    selectedTemplate,
    setSelectedTemplate,
    handleNext,
    handlePrevious,
    localPracticeInfo,
    handlePracticeInfoChange,
    handlePracticeInfoNext,
    handleComplete
  } = props;

  switch (currentStep) {
    case 0:
      return (
        <props.TemplateSelection 
          selectedTemplate={selectedTemplate} 
          onSelect={setSelectedTemplate} 
          onNext={handleNext}
        />
      );
    case 1:
      return (
        <props.PracticeInfo 
          practiceInfo={localPracticeInfo}
          onChange={handlePracticeInfoChange}
          onNext={handlePracticeInfoNext}
          onPrevious={handlePrevious}
        />
      );
    case 2:
      return (
        <props.SubscriptionSelection 
          onComplete={handleComplete}
          onPrevious={handlePrevious}
        />
      );
    default:
      return null;
  }
};
