
import React from 'react';
import { ArrowUpRight, Brush, Globe, CreditCard, Clock, Award, Users } from 'lucide-react';

const features = [
  {
    title: 'Professional Templates',
    description: 'Choose from dozens of templates specifically designed for medical professionals.',
    icon: Brush,
  },
  {
    title: 'Custom Domains',
    description: 'Connect your own domain or purchase one directly through our platform.',
    icon: Globe,
  },
  {
    title: 'Easy Payments',
    description: 'Secure subscription management with flexible payment options.',
    icon: CreditCard,
  },
  {
    title: 'Fast Setup',
    description: 'Launch your website in minutes with our step-by-step onboarding process.',
    icon: Clock,
  },
  {
    title: 'SEO Optimized',
    description: 'Every website is optimized to help patients find you online.',
    icon: Award,
  },
  {
    title: 'Patient Friendly',
    description: 'Built with accessibility and user experience in mind for all patients.',
    icon: Users,
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for your medical practice
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our platform gives medical professionals the tools they need to establish
            a strong online presence without any technical knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-medical-100 rounded-lg text-medical-600 flex items-center justify-center mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/features"
            className="inline-flex items-center text-medical-600 font-medium hover:text-medical-700"
          >
            See all features
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
