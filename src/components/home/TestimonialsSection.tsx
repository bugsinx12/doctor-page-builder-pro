
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I launched my medical practice website in just one afternoon. The templates are beautiful and the process was incredibly intuitive.",
    name: "Dr. Sarah Johnson",
    title: "Family Medicine, Chicago"
  },
  {
    quote: "As a busy surgeon, I don't have time to learn web design. DocPages made it so easy to create a professional online presence for my practice.",
    name: "Dr. Michael Chen",
    title: "Orthopedic Surgeon, Boston"
  },
  {
    quote: "The custom domain integration is seamless. My patients can easily find my practice online now. Worth every penny!",
    name: "Dr. Emily Rodriguez",
    title: "Pediatrician, Miami"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-medical-50">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by medical professionals
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what doctors are saying about their experience with our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white border-0 shadow-sm">
              <CardContent className="p-6 flex flex-col h-full">
                <Quote className="h-10 w-10 text-medical-200 mb-4" />
                <p className="text-gray-700 flex-grow italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
