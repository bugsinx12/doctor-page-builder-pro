
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Website, WebsiteContent, WebsiteSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LandingView = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);

  useEffect(() => {
    async function fetchLandingPage() {
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Transform the data to match our Website type
          const transformedData: Website = {
            id: data.id,
            userId: data.userid,
            name: data.name,
            slug: data.slug,
            templateId: data.templateid,
            customDomain: data.customdomain,
            content: data.content as unknown as WebsiteContent,
            settings: data.settings as unknown as WebsiteSettings,
            createdAt: data.createdat,
            updatedAt: data.updatedat,
            publishedAt: data.publishedat || undefined,
          };
          setWebsite(transformedData);
        } else {
          setError('Landing page not found');
        }
      } catch (err) {
        console.error('Error fetching landing page:', err);
        setError('Failed to load landing page');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchLandingPage();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          {error || 'Landing page not found'}
        </h1>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: website.settings.colors.primary }}>
              {website.content.hero.heading}
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              {website.content.hero.subheading}
            </p>
            <Button 
              className="px-8 py-3 text-lg"
              style={{ 
                backgroundColor: website.settings.colors.primary,
                borderColor: website.settings.colors.primary,
              }}
            >
              {website.content.hero.ctaText}
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: website.settings.colors.primary }}>
              {website.content.about.heading}
            </h2>
            <div className="prose prose-lg mx-auto">
              <p>{website.content.about.content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: website.settings.colors.primary }}>
              {website.content.services.heading}
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              {website.content.services.subheading}
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {website.content.services.items.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: website.settings.colors.secondary }}>
                    {service.title}
                  </h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {website.content.testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: website.settings.colors.primary }}>
                What Our Patients Say
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {website.content.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <blockquote className="italic text-gray-700 mb-4">"{testimonial.quote}"</blockquote>
                    <p className="font-semibold" style={{ color: website.settings.colors.secondary }}>
                      {testimonial.name}
                      {testimonial.title && (
                        <span className="font-normal text-gray-600"> - {testimonial.title}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: website.settings.colors.primary }}>
              {website.content.contact.heading}
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              {website.content.contact.subheading}
            </p>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: website.settings.colors.secondary }}>
                    Contact Information
                  </h3>
                  {website.content.contact.address && (
                    <p className="flex items-start mb-3">
                      <span className="font-medium mr-2">Address:</span> {website.content.contact.address}
                    </p>
                  )}
                  {website.content.contact.phone && (
                    <p className="flex items-start mb-3">
                      <span className="font-medium mr-2">Phone:</span> {website.content.contact.phone}
                    </p>
                  )}
                  {website.content.contact.email && (
                    <p className="flex items-start mb-3">
                      <span className="font-medium mr-2">Email:</span> {website.content.contact.email}
                    </p>
                  )}
                  {website.content.contact.hours && (
                    <p className="flex items-start mb-3">
                      <span className="font-medium mr-2">Hours:</span> {website.content.contact.hours}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: website.settings.colors.secondary }}>
                    Send a Message
                  </h3>
                  <form className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      />
                    </div>
                    <div>
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      />
                    </div>
                    <div>
                      <textarea 
                        placeholder="Your Message" 
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                      />
                    </div>
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: website.settings.colors.primary,
                        borderColor: website.settings.colors.primary,
                      }}
                    >
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">{website.name}</h2>
                {website.content.contact.address && (
                  <p className="text-gray-300">{website.content.contact.address}</p>
                )}
              </div>
              <div className="flex gap-4">
                {website.settings.socialLinks?.facebook && (
                  <a href={website.settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-medical-300">
                    Facebook
                  </a>
                )}
                {website.settings.socialLinks?.twitter && (
                  <a href={website.settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-medical-300">
                    Twitter
                  </a>
                )}
                {website.settings.socialLinks?.instagram && (
                  <a href={website.settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-medical-300">
                    Instagram
                  </a>
                )}
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-400">© {new Date().getFullYear()} {website.name}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
