
import React from 'react';
import { Shell } from '@/components/Shell';

const PrivacyPolicy = () => {
  return (
    <Shell>
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: April 21, 2025</p>
          
          <div className="prose prose-lg max-w-none">
            <p>
              At Boost.Doctor, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal information when you use our services.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, subscribe to our service, or contact our support team. This may include:
            </p>
            <ul className="list-disc pl-6 mt-4 mb-4 space-y-2">
              <li>Contact information (name, email address, phone number)</li>
              <li>Billing information (credit card details, billing address)</li>
              <li>Account credentials (username, password)</li>
              <li>Professional information (practice name, specialty, professional license)</li>
              <li>Content you upload to your website (text, images, videos)</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p>
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-4 mb-4 space-y-2">
              <li>Providing, maintaining, and improving our services</li>
              <li>Processing transactions and managing your account</li>
              <li>Sending you technical notices, updates, and support messages</li>
              <li>Responding to your comments and questions</li>
              <li>Protecting our services and users from fraudulent or illegal activity</li>
              <li>Understanding how you use our services to enhance user experience</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Information Sharing</h2>
            <p>
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-4 mb-4 space-y-2">
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations</li>
              <li>In connection with a merger, sale, or acquisition</li>
              <li>With your consent or at your direction</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 mt-4 mb-4 space-y-2">
              <li>Accessing, correcting, or deleting your personal information</li>
              <li>Restricting or objecting to our use of your personal information</li>
              <li>Portability of your personal information</li>
              <li>Withdrawing consent where processing is based on consent</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@boost.doctor.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default PrivacyPolicy;
