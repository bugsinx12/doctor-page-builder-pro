import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-medical-600" />
              <span className="font-bold text-xl text-medical-800">Boost.Doctor</span>
            </div>
            <p className="text-gray-600 text-sm">
              The easiest way for medical professionals to create professional online presences.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/domains" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Custom Domains
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-medical-600 text-sm transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} Boost.Doctor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
