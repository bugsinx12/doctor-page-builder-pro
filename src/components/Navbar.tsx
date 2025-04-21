import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div>
          <Link to="/" className="font-extrabold text-2xl text-medical-700">Boost.Doctor</Link>
        </div>
        <div className="flex gap-6 items-center">
          <Link to="/about-us" className="text-gray-700 hover:text-medical-600">About Us</Link>
          <Link to="/contact" className="text-gray-700 hover:text-medical-600">Contact</Link>
          <Link to="/privacy-policy" className="text-gray-700 hover:text-medical-600">Privacy Policy</Link>
          <Link to="/terms-of-service" className="text-gray-700 hover:text-medical-600">Terms</Link>
          <Link to="/auth?tab=signup" className="bg-medical-600 text-white px-4 py-2 rounded hover:bg-medical-700 font-medium ml-2">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
