
import { PricingPlan } from '@/data/subscriptionPlans';
import PlanFeatureList from './PlanFeatureList';

interface SubscriptionPlanCardProps {
  plan: PricingPlan;
  isSelected: boolean;
  onSelect: (planId: string) => void;
}

const SubscriptionPlanCard = ({ 
  plan, 
  isSelected, 
  onSelect 
}: SubscriptionPlanCardProps) => {
  return (
    <div 
      className={`rounded-lg border bg-card shadow-sm overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-medical-600 shadow-md' : ''}
        ${plan.popular ? 'border-medical-500' : 'border-gray-200'}
      `}
      onClick={() => onSelect(plan.id)}
    >
      {plan.popular && (
        <div className="bg-medical-500 py-1 text-center text-sm font-medium text-white">
          Most Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-card-foreground">{plan.title}</h3>
        
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
          {plan.price !== 'Free' && (
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              /month
            </span>
          )}
        </div>
        
        <p className="mt-2 text-sm text-muted-foreground">
          {plan.description}
        </p>
      </div>
      
      <div className="px-6 pb-6">
        <PlanFeatureList features={plan.features} />
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;
