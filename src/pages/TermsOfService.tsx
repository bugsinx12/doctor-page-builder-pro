
import React from 'react';
import { Shell } from '@/components/Shell';

const TermsOfService = () => {
  return (
    <Shell>
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: April 21, 2025</p>
          
          <div className="prose prose-lg max-w-none">
            <p>
              Please read these Terms of Service ("Terms") carefully before using Boost.Doctor's website and services.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>
              Boost.Doctor provides a platform for medical professionals to create and manage websites for their practices. Our services include website templates, domain registration, hosting, and related features.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              To access certain features of our service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Subscription and Payments</h2>
            <p>
              Some of our services require payment of fees. By subscribing to a paid service, you agree to pay all fees in accordance with the pricing and payment terms presented to you. Subscription fees are non-refundable except as required by law or as specifically permitted in these Terms.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. User Content</h2>
            <p>
              You retain ownership of any content you upload to our services. By uploading content, you grant us a non-exclusive license to use, reproduce, and display such content in connection with providing our services to you.
            </p>
            <p>
              You are solely responsible for the content you publish on your website. You agree not to upload any content that:
            </p>
            <ul className="list-disc pl-6 mt-4 mb-4 space-y-2">
              <li>Violates any applicable law or regulation</li>
              <li>Infringes on the intellectual property rights of others</li>
              <li>Contains false, misleading, or deceptive claims</li>
              <li>Violates medical ethics or professional standards</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Compliance with Healthcare Laws</h2>
            <p>
              As a medical professional, you are responsible for ensuring that your website complies with all applicable healthcare laws and regulations, including but not limited to HIPAA, medical advertising restrictions, and professional licensing requirements.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Boost.Doctor shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend your account and access to our services at any time, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on our website and updating the "Last updated" date.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at legal@boost.doctor.
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default TermsOfService;
