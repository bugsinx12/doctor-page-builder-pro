import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Stethoscope, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Stethoscope className="h-6 w-6 text-medical-600" />
          <span className="hidden font-bold text-xl text-medical-800 sm:inline-block">Boost.Doctor</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-medical-600 transition-colors">
            Pricing
          </Link>
          <Link to="/templates" className="text-sm font-medium text-gray-700 hover:text-medical-600 transition-colors">
            Templates
          </Link>
          <Link to="/features" className="text-sm font-medium text-gray-700 hover:text-medical-600 transition-colors">
            Features
          </Link>
          <div className="ml-3 flex items-center space-x-3">
            <Button variant="outline" className="rounded-md" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="rounded-md bg-medical-600 hover:bg-medical-700" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-gray-700 hover:text-medical-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-white pt-20 pb-6 px-4 md:hidden">
          <button
            className="absolute top-4 right-4 p-2 text-gray-700 hover:text-medical-600 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center space-y-4 w-full">
            <Link
              to="/pricing"
              className="w-full py-3 text-center text-lg font-medium text-gray-700 hover:text-medical-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/templates"
              className="w-full py-3 text-center text-lg font-medium text-gray-700 hover:text-medical-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Templates
            </Link>
            <Link
              to="/features"
              className="w-full py-3 text-center text-lg font-medium text-gray-700 hover:text-medical-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <div className="mt-6 flex flex-col w-full space-y-3">
              <Button variant="outline" className="w-full py-6" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button className="w-full py-6 bg-medical-600 hover:bg-medical-700" asChild>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
