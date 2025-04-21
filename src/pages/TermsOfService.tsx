
import React from "react";
import { Shell } from "@/components/Shell";

const TermsOfService = () => (
  <Shell>
    <div className="container py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms of Service</h1>
        <div className="prose max-w-none">
          <p>
            By using Boost.Doctor, you agree to these terms and conditions. Please read them carefully.
          </p>
          <h2>Use of Service</h2>
          <ul>
            <li>You must be 18 years or older to use this service.</li>
            <li>Do not use our platform for unlawful or prohibited activities.</li>
          </ul>
          <h2>Intellectual Property</h2>
          <ul>
            <li>All website content and templates are the intellectual property of Boost.Doctor.</li>
            <li>You may not copy, modify, or distribute these resources without permission.</li>
          </ul>
          <h2>Termination</h2>
          <ul>
            <li>We reserve the right to terminate accounts that violate our policies or harm others.</li>
          </ul>
          <p>Contact us at <a href="mailto:support@boost.doctor">support@boost.doctor</a> if you have questions about these terms.</p>
        </div>
      </div>
    </div>
  </Shell>
);

export default TermsOfService;
