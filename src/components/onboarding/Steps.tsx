
import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export const Steps: React.FC<StepsProps> = ({ 
  steps, 
  currentStep,
  onStepClick
}) => {
  return (
    <div className="relative">
      <div className="overflow-hidden mb-2">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div 
                className={`flex items-center ${onStepClick ? 'cursor-pointer' : ''}`}
                onClick={() => onStepClick?.(index)}
              >
                <div 
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                    ${index < currentStep 
                      ? 'bg-medical-600 text-white' 
                      : index === currentStep 
                        ? 'border-2 border-medical-600 text-medical-600' 
                        : 'border-2 border-gray-300 text-gray-300'
                    }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-2 text-sm font-medium 
                  ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}">
                  {step.title}
                </div>
              </div>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-grow mx-2 sm:mx-4 h-0.5 relative">
                  <div className="absolute inset-0 bg-gray-200"></div>
                  {index < currentStep && (
                    <div className="absolute inset-0 bg-medical-600" style={{ width: '100%' }}></div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
