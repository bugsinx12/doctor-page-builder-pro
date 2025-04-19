
import React from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText: string;
  buttonLink?: string;
  frequency?: string;
  planId?: 'pro' | 'enterprise';
  isCurrentPlan?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  features,
  popular = false,
  buttonText,
  planId,
  frequency = 'month',
  isCurrentPlan = false
}) => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      navigate('/auth');
      return;
    }

    if (!planId || price === 'Free') {
      navigate('/dashboard');
      return;
    }
    
    // Don't do anything if this is already the current plan
    if (isCurrentPlan) {
      navigate('/dashboard');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Could not process subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={cn(
        "rounded-lg border bg-card shadow-sm overflow-hidden",
        popular && "border-medical-500 shadow-md",
        isCurrentPlan && "ring-2 ring-green-500 shadow-md"
      )}
    >
      {popular && (
        <div className="bg-medical-500 py-1 text-center text-sm font-medium text-white">
          Most Popular
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="bg-green-500 py-1 text-center text-sm font-medium text-white">
          Your Current Plan
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-card-foreground">{title}</h3>
        
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          {price !== 'Free' && (
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              /{frequency}
            </span>
          )}
        </div>
        
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        
        <Button 
          className={cn(
            "mt-6 w-full",
            popular ? "bg-medical-600 hover:bg-medical-700" : "",
            isCurrentPlan ? "bg-green-600 hover:bg-green-700" : ""
          )}
          variant={popular || isCurrentPlan ? "default" : "outline"}
          onClick={handleSubscribe}
          disabled={isLoading || isCurrentPlan}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            buttonText
          )}
        </Button>
      </div>
      
      <div className="px-6 pb-6 pt-2">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className={cn(
                "mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                feature.included ? "bg-medical-50 text-medical-600" : "bg-gray-50 text-gray-400"
              )}>
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className={cn(
                "text-sm",
                feature.included ? "text-gray-700" : "text-gray-400 line-through"
              )}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingCard;
