import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { WebsiteContent, WebsiteSettings, Template, Website } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Copy, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const defaultContent: Record<string, WebsiteContent> = {
  'general-practice': {
    hero: {
      heading: 'Welcome to Our Medical Practice',
      subheading: 'Providing quality healthcare for you and your family',
      ctaText: 'Book an Appointment',
      ctaLink: '#contact',
    },
    about: {
      heading: 'About Our Practice',
      content: 'We are dedicated to providing comprehensive healthcare services with a focus on patient comfort and wellbeing. Our team of experienced doctors and staff are committed to delivering personalized care to meet your specific needs.',
    },
    services: {
      heading: 'Our Services',
      subheading: 'Quality healthcare for all your needs',
      items: [
        {
          title: 'Primary Care',
          description: 'Comprehensive primary care services for patients of all ages.'
        },
        {
          title: 'Preventive Care',
          description: 'Regular check-ups and screenings to maintain your health.'
        },
        {
          title: 'Chronic Disease Management',
          description: 'Ongoing care and management for chronic conditions.'
        }
      ]
    },
    testimonials: [
      {
        quote: 'The doctors and staff provide exceptional care. I always feel well taken care of.',
        name: 'Jane Smith',
      },
      {
        quote: 'Professional, caring, and efficient. Highly recommend this practice.',
        name: 'John Doe',
      }
    ],
    contact: {
      heading: 'Contact Us',
      subheading: 'We\'re here to help with any questions or concerns',
      address: '123 Medical Blvd, Anytown, USA',
      phone: '(555) 123-4567',
      email: 'info@medicalpractice.com',
      hours: 'Monday - Friday: 8am - 5pm',
    }
  },
  'specialist': {
    hero: {
      heading: 'Specialized Care for Your Needs',
      subheading: 'Expert specialists providing advanced medical care',
      ctaText: 'Request a Consultation',
      ctaLink: '#contact',
    },
    about: {
      heading: 'About Our Specialty Practice',
      content: 'Our specialty practice brings together highly trained specialists who are experts in their field. We use the latest technology and techniques to provide exceptional care tailored to your specific medical needs.',
    },
    services: {
      heading: 'Specialized Services',
      subheading: 'Advanced care for complex conditions',
      items: [
        {
          title: 'Diagnostic Services',
          description: 'Comprehensive testing and advanced diagnostics.'
        },
        {
          title: 'Specialized Treatments',
          description: 'Cutting-edge treatments for specific conditions.'
        },
        {
          title: 'Follow-up Care',
          description: 'Ongoing care and management after procedures.'
        }
      ]
    },
    testimonials: [
      {
        quote: 'The expertise at this practice is outstanding. My condition improved significantly after treatment.',
        name: 'Sarah Johnson',
        title: 'Patient'
      },
      {
        quote: 'The specialists here provided a level of care I couldn\'t find elsewhere.',
        name: 'Michael Brown',
        title: 'Patient'
      }
    ],
    contact: {
      heading: 'Schedule a Consultation',
      subheading: 'Take the first step toward specialized care',
      address: '456 Specialty Ave, Medtown, USA',
      phone: '(555) 987-6543',
      email: 'appointments@specialistcare.com',
      hours: 'Monday - Thursday: 9am - 6pm, Friday: 9am - 4pm',
    }
  },
  'pediatric': {
    hero: {
      heading: 'Caring for Your Child\'s Health',
      subheading: 'Compassionate pediatric care in a child-friendly environment',
      ctaText: 'Schedule a Visit',
      ctaLink: '#contact',
    },
    about: {
      heading: 'About Our Pediatric Practice',
      content: 'Our pediatric practice is dedicated to providing comprehensive healthcare for children from birth through adolescence. We create a warm, welcoming environment where children feel comfortable and parents feel confident in the care their children receive.',
    },
    services: {
      heading: 'Pediatric Services',
      subheading: 'Complete healthcare for your growing child',
      items: [
        {
          title: 'Well-Child Visits',
          description: 'Regular check-ups to monitor growth and development.'
        },
        {
          title: 'Immunizations',
          description: 'Up-to-date vaccinations following recommended schedules.'
        },
        {
          title: 'Behavioral Health',
          description: 'Support for developmental and behavioral concerns.'
        }
      ]
    },
    testimonials: [
      {
        quote: 'The doctors are so patient with my children and take time to address all our concerns.',
        name: 'Amanda Wilson',
        title: 'Parent'
      },
      {
        quote: 'My kids actually look forward to their doctor visits here!',
        name: 'David Thompson',
        title: 'Parent'
      }
    ],
    contact: {
      heading: 'Contact Our Office',
      subheading: 'We\'re here for your family',
      address: '789 Children\'s Way, Kidsville, USA',
      phone: '(555) 234-5678',
      email: 'care@pediatricpractice.com',
      hours: 'Monday - Friday: 8am - 5pm, Saturday: 9am - 12pm',
    }
  }
};

const defaultSettings: Record<string, WebsiteSettings> = {
  'general-practice': {
    colors: {
      primary: '#4a90e2',
      secondary: '#5cb85c',
      accent: '#f0ad4e',
    },
    fonts: {
      heading: 'Roboto, sans-serif',
      body: 'Open Sans, sans-serif',
    },
    socialLinks: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    }
  },
  'specialist': {
    colors: {
      primary: '#673ab7',
      secondary: '#2196f3',
      accent: '#ff9800',
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Raleway, sans-serif',
    },
    socialLinks: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
    }
  },
  'pediatric': {
    colors: {
      primary: '#ff7043',
      secondary: '#4caf50',
      accent: '#2196f3',
    },
    fonts: {
      heading: 'Nunito, sans-serif',
      body: 'Poppins, sans-serif',
    },
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
    }
  }
};

interface WebsiteData {
  id: string;
  name: string;
  slug: string;
  templateId: string;
  content: WebsiteContent;
  settings: WebsiteSettings;
  customDomain?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const WebsiteManager = () => {
  const { userId, getToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isPracticeInfoSet, setIsPracticeInfoSet] = useState(false);
  const [practiceInfo, setPracticeInfo] = useState({
    name: '',
    specialty: '',
  });

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    async function fetchData() {
      try {
        setTemplates([
          {
            id: 'general-practice-1',
            name: 'Modern General Practice',
            description: 'Clean, professional design for general practitioners',
            thumbnail: '/placeholder.svg',
            category: 'general',
            features: ['Patient portal', 'Appointment booking', 'Staff profiles'],
            popular: true,
          },
          {
            id: 'specialist-1',
            name: 'Specialist Clinic',
            description: 'Showcase your specialty with dedicated sections',
            thumbnail: '/placeholder.svg',
            category: 'specialist',
            features: ['Procedures section', 'Research highlights', 'Patient testimonials'],
            new: true,
          },
          {
            id: 'pediatric-1',
            name: 'Pediatric Practice',
            description: 'Warm and friendly design for pediatricians',
            thumbnail: '/placeholder.svg',
            category: 'pediatric',
            features: ['Child-friendly UI', 'Parent resources', 'Vaccination info'],
            new: true,
          },
        ]);

        const { data: websitesData, error: websitesError } = await supabase
          .from('websites')
          .select('*')
          .eq('userid', userId);

        if (websitesError) throw websitesError;
        
        if (websitesData) {
          const transformedWebsites: Website[] = websitesData.map(item => ({
            id: item.id,
            userId: item.userid,
            name: item.name,
            slug: item.slug,
            templateId: item.templateid,
            customDomain: item.customdomain || undefined,
            content: item.content as unknown as WebsiteContent,
            settings: item.settings as unknown as WebsiteSettings,
            createdAt: item.createdat,
            updatedAt: item.updatedat,
            publishedAt: item.publishedat || undefined,
          }));
          
          setWebsites(transformedWebsites);
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (profile && profile.practice_name) {
          setIsPracticeInfoSet(true);
          setPracticeInfo({
            name: profile.practice_name || '',
            specialty: profile.specialty || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your websites',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, navigate, toast]);

  const createWebsite = async (templateId: string) => {
    if (!userId) return;

    try {
      setLoading(true);

      let templateType = 'general-practice';
      if (templateId.includes('specialist')) {
        templateType = 'specialist';
      } else if (templateId.includes('pediatric')) {
        templateType = 'pediatric';
      }
      
      const slug = practiceInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const customContent = { ...defaultContent[templateType] };
      customContent.hero.heading = `Welcome to ${practiceInfo.name}`;
      if (practiceInfo.specialty) {
        customContent.hero.subheading = `Specialized ${practiceInfo.specialty} care for our patients`;
      }

      const { data, error } = await supabase
        .from('websites')
        .insert({
          userid: userId,
          name: practiceInfo.name,
          slug: slug,
          templateid: templateId,
          content: customContent as any,
          settings: defaultSettings[templateType] as any,
          createdat: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
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
        
        setWebsites([...websites, transformedData]);
        toast({
          title: 'Success!',
          description: 'Your website has been created',
        });
      }
    } catch (error) {
      console.error('Error creating website:', error);
      toast({
        title: 'Error',
        description: 'Failed to create website',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteWebsite = async (websiteId: string) => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', websiteId)
        .eq('userid', userId);

      if (error) throw error;

      setWebsites(websites.filter(website => website.id !== websiteId));
      toast({
        title: 'Website deleted',
        description: 'Your website has been successfully deleted',
      });
    } catch (error) {
      console.error('Error deleting website:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete website',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLandingPageUrl = (websiteId: string) => {
    const url = `${window.location.origin}/landings/${websiteId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL copied',
      description: 'Landing page URL has been copied to clipboard',
    });
  };

  const handleTabChange = (value: string) => {
    const tabTrigger = document.querySelector(`[data-state="inactive"][value="${value}"]`);
    if (tabTrigger instanceof HTMLButtonElement) {
      tabTrigger.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Website Manager</h1>

      <Tabs defaultValue={websites.length > 0 ? "my-websites" : "templates"}>
        <TabsList className="mb-6">
          <TabsTrigger value="my-websites">My Websites</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-websites">
          {websites.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">No websites yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't created any websites yet. Choose a template to get started.
              </p>
              <Button onClick={() => {
                const tabTrigger = document.querySelector('[data-state="inactive"][value="templates"]');
                if (tabTrigger instanceof HTMLButtonElement) {
                  tabTrigger.click();
                }
              }}>
                Browse Templates
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map(website => (
                <Card key={website.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle>{website.name}</CardTitle>
                    <CardDescription>
                      Created: {new Date(website.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <div className="aspect-video bg-gray-100 px-6">
                    <img
                      src="/placeholder.svg"
                      alt={website.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Template: {templates.find(t => t.id === website.templateId)?.name || website.templateId}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => copyLandingPageUrl(website.id)}
                      >
                        <Copy className="h-4 w-4" /> Copy URL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        asChild
                      >
                        <Link to={`/landings/${website.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" /> View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      disabled
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => deleteWebsite(website.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          {!isPracticeInfoSet ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Set up your practice info</h3>
              <p className="text-gray-600 mb-6">
                Please complete your practice information before creating a website.
              </p>
              <Button asChild>
                <Link to="/dashboard">Update Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    {template.popular && (
                      <div className="absolute top-2 right-2 bg-medical-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Popular
                      </div>
                    )}
                    {template.new && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                        New
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {template.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">Use this template</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create website with this template?</DialogTitle>
                          <DialogDescription>
                            This will create a new website using {template.name} template with your practice information.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="mb-4"><span className="font-medium">Practice name:</span> {practiceInfo.name}</p>
                          {practiceInfo.specialty && (
                            <p className="mb-4"><span className="font-medium">Specialty:</span> {practiceInfo.specialty}</p>
                          )}
                        </div>
                        <div className="flex justify-end gap-4">
                          <Button variant="outline" onClick={() => {
                            const closeButton = document.querySelector('[data-state="open"] [role="dialog"] button.close');
                            if (closeButton instanceof HTMLButtonElement) {
                              closeButton.click();
                            }
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={() => {
                            createWebsite(template.id);
                            const closeButton = document.querySelector('[data-state="open"] [role="dialog"] button.close');
                            if (closeButton instanceof HTMLButtonElement) {
                              closeButton.click();
                            }
                          }}>
                            Create Website
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteManager;
