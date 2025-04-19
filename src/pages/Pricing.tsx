import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingCard from '@/components/pricing/PricingCard';

const pricingPlans = [
  {
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
    buttonText: 'Start for free',
    buttonLink: '/signup',
  },
  {
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
    buttonText: 'Subscribe',
    buttonLink: '/signup?plan=pro',
    popular: true,
    planId: 'pro' as const,
  },
  {
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
    buttonText: 'Subscribe',
    buttonLink: '/signup?plan=enterprise',
    planId: 'enterprise' as const,
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="section-padding">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Choose the plan that's right for your medical practice
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={index} {...plan} />
              ))}
            </div>

            <div className="mt-16 max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Can I cancel my subscription anytime?</h3>
                  <p className="text-gray-600">
                    Yes, you can cancel your subscription at any time. If you cancel, your service will remain active until the end of your billing period.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">How does the custom domain feature work?</h3>
                  <p className="text-gray-600">
                    With paid plans, you can connect your existing domain or purchase a new one directly through our platform. We'll handle all the technical setup for you.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Can I upgrade my plan later?</h3>
                  <p className="text-gray-600">
                    Absolutely! You can upgrade your plan at any time. The new pricing will be prorated for the remainder of your billing period.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
