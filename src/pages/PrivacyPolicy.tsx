
import React from "react";
import { Shell } from "@/components/Shell";

const PrivacyPolicy = () => (
  <Shell>
    <div className="container py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
        <div className="prose max-w-none">
          <p>Your privacy matters to us. This policy outlines how we use and protect your information.</p>
          <h2>Information We Collect</h2>
          <ul>
            <li>Personal details you provide when signing up</li>
            <li>Usage data and cookies for analytics and support</li>
          </ul>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our service</li>
            <li>For security and support</li>
            <li>For communication regarding your account and updates</li>
          </ul>
          <h2>Your Rights</h2>
          <ul>
            <li>You may update or delete your data at any time</li>
            <li>Contact us for any questions about your privacy rights</li>
          </ul>
          <p>Contact us at <a href="mailto:support@boost.doctor">support@boost.doctor</a> for privacy questions.</p>
        </div>
      </div>
    </div>
  </Shell>
);

export default PrivacyPolicy;
