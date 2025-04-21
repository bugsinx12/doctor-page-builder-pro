
import React from "react";
import { Shell } from "@/components/Shell";

const Contact = () => (
  <Shell>
    <div className="container py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Contact Us</h1>
        <p className="mb-8 text-gray-600">
          Have a question or want to get in touch? Fill out the form below and we’ll get back to you soon!
        </p>
        <form className="grid gap-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">Name</label>
            <input id="name" name="name" type="text" required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-medical-600 focus:border-medical-600"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-medical-600 focus:border-medical-600"/>
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 mb-1">Message</label>
            <textarea id="message" name="message" required className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-medical-600 focus:border-medical-600" rows={4} />
          </div>
          <button type="submit" className="bg-medical-600 text-white font-medium rounded px-6 py-2 hover:bg-medical-700 transition">Send</button>
        </form>
      </div>
    </div>
  </Shell>
);

export default Contact;
