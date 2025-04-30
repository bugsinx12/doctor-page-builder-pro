
import { Check } from 'lucide-react';
import { PlanFeature } from '@/data/subscriptionPlans';

interface PlanFeatureListProps {
  features: PlanFeature[];
}

const PlanFeatureList = ({ features }: PlanFeatureListProps) => {
  return (
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <div className={`mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
            ${feature.included ? "bg-medical-50 text-medical-600" : "bg-gray-50 text-gray-400"}
          `}>
            <Check className="h-3.5 w-3.5" />
          </div>
          <span className={`text-sm
            ${feature.included ? "text-gray-700" : "text-gray-400 line-through"}
          `}>
            {feature.text}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default PlanFeatureList;
