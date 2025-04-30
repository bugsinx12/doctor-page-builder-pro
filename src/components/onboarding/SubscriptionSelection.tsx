
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { pricingPlans } from '@/data/subscriptionPlans';
import SubscriptionPlanCard from './SubscriptionPlanCard';
import { useSubscriptionCheckout } from '@/hooks/useSubscriptionCheckout';

interface SubscriptionSelectionProps {
  onComplete: () => void;
  onPrevious: () => void;
}

const SubscriptionSelection = ({ 
  onComplete, 
  onPrevious 
}: SubscriptionSelectionProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const { handlePlanSelection, isLoading } = useSubscriptionCheckout();

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    const result = await handlePlanSelection(selectedPlan);
    
    if (result?.success) {
      if (result.checkout && result.url) {
        // Complete onboarding first so user can use the app even if checkout is canceled
        onComplete();
        // Then redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        onComplete();
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Choose Your Plan</h2>
      <p className="text-gray-600 mb-8">
        Select the plan that fits your practice's needs. You can change or cancel anytime.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {pricingPlans.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            selectedPlan === 'free' ? 'Start Free Plan' : 'Continue to Payment'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSelection;
