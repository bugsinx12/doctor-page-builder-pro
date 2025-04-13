
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="section-padding hero-gradient text-white">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to launch your medical practice website?
          </h2>
          <p className="text-lg text-blue-50 mb-8">
            Join thousands of medical professionals who have created beautiful websites with DocPages.
            Get started in minutes with no technical knowledge required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-medical-700 hover:bg-blue-50" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-medical-700/20" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-blue-100">
            No credit card required • Set up in minutes • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
