
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import doctorHeroImage from '../../assets/doctor-hero.svg';

const HeroSection = () => {
  return (
    <div className="hero-gradient text-white overflow-hidden">
      <div className="container py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight">
              Beautiful websites for medical professionals
            </h1>
            <p className="text-lg sm:text-xl text-blue-50">
              Launch your professional online presence in minutes with pre-built templates 
              designed specifically for doctors and medical practices.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-white text-medical-700 hover:bg-blue-50" asChild>
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
              {/* Removed "View Templates" button */}
            </div>
            <p className="text-sm text-blue-100">
              No credit card required • Set up in minutes • Cancel anytime
            </p>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-medical-600/80 to-transparent rounded-lg transform -rotate-3"></div>
            <img
              src="/placeholder.svg"
              alt="Doctor website preview"
              className="relative z-10 rounded-lg shadow-xl transform rotate-2 border-4 border-white/90"
            />
          </div>
        </div>
      </div>
      
      {/* Wave SVG */}
      <div className="relative h-16 bg-medical-600">
        <svg className="absolute bottom-0 w-full h-16 text-white" preserveAspectRatio="none" viewBox="0 0 1440 54">
          <path
            fill="currentColor"
            d="M0,0 C240,54 480,54 720,54 C960,54 1200,54 1440,54 L1440,0 L0,0 Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
