
import React from 'react';
import { Shell } from '@/components/Shell';

const AboutUs = () => {
  return (
    <Shell>
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">About Boost.Doctor</h1>
          <div className="prose prose-lg max-w-none">
            <p className="lead text-xl text-gray-600 mb-8">
              At Boost.Doctor, we're on a mission to help medical professionals establish a strong 
              online presence through beautifully designed, functional websites.
            </p>
            <h2 className="text-2xl font-semibold mt-10 mb-4">Our Story</h2>
            <p>
              Founded in 2023, Boost.Doctor was created by a team of healthcare professionals and web 
              developers who recognized a gap in the market. Medical professionals needed specialized 
              web solutions that understood the unique needs of healthcare practices.
            </p>
            <h2 className="text-2xl font-semibold mt-10 mb-4">Our Mission</h2>
            <p>
              Our mission is to empower healthcare professionals with the digital tools they need to 
              grow their practice, connect with patients, and focus on what they do best - providing 
              excellent healthcare services.
            </p>
            <h2 className="text-2xl font-semibold mt-10 mb-4">Our Team</h2>
            <p>
              Our team combines expertise in healthcare, web development, and digital marketing. 
              We understand the specific challenges and regulations facing medical websites, and 
              we build our solutions accordingly.
            </p>
            <h2 className="text-2xl font-semibold mt-10 mb-4">Why Choose Us</h2>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Templates designed specifically for medical practices</li>
              <li>HIPAA-compliant contact forms and scheduling</li>
              <li>Professional designs that build patient trust</li>
              <li>Easy-to-use platform requiring no technical knowledge</li>
              <li>Dedicated support team familiar with healthcare needs</li>
            </ul>
            <div className="mt-12 text-center">
              <p className="italic text-gray-600">
                "We believe every healthcare provider deserves a website that reflects the quality of care they provide."
              </p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default AboutUs;
