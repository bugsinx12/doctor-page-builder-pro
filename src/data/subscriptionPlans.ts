
export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

// Pricing plan data
export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    title: 'Free',
    price: 'Free',
    description: 'For individuals just getting started',
    features: [
      { text: '1 website', included: true },
      { text: 'Basic templates', included: true },
      { text: 'DocPages subdomain', included: true },
      { text: 'SSL Certificate', included: true },
      { text: 'Limited customization', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Premium templates', included: false },
      { text: 'Analytics', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '$19',
    description: 'Perfect for established practices',
    features: [
      { text: '1 website', included: true },
      { text: 'Basic templates', included: true },
      { text: 'DocPages subdomain', included: true },
      { text: 'SSL Certificate', included: true },
      { text: 'Full customization', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Analytics', included: true },
      { text: 'Priority support', included: false },
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    price: '$49',
    description: 'For larger medical practices',
    features: [
      { text: 'Up to 5 websites', included: true },
      { text: 'All templates', included: true },
      { text: 'DocPages subdomain', included: true },
      { text: 'SSL Certificate', included: true },
      { text: 'Full customization', included: true },
      { text: 'Custom domains', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];
