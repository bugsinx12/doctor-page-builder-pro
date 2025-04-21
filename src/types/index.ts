
// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  metadata?: UserMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface UserMetadata {
  practice?: string;
  specialty?: string;
  practiceSize?: string;
  completedOnboarding?: boolean;
}

// Subscription and plan types
export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  priceId: string;
  quantity: number;
  cancelAtPeriodEnd: boolean;
  created: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  endedAt: string | null;
  cancelAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
}

export interface Price {
  id: string;
  productId: string;
  active: boolean;
  description: string | null;
  unitAmount: number | null;
  currency: string;
  type: 'one_time' | 'recurring';
  interval: 'day' | 'week' | 'month' | 'year' | null;
  intervalCount: number | null;
  trialPeriodDays: number | null;
  metadata: Record<string, string> | null;
}

export interface Product {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  image: string | null;
  metadata: Record<string, string> | null;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'general' | 'specialist' | 'clinic' | 'pediatric' | 'dental';
  features: string[];
  popular?: boolean;
  new?: boolean;
  preview: string;
  screenshots: string[];
  tags: string[];
}

// Website/Landing page types
export interface Website {
  id: string;
  userId: string;
  name: string;
  slug: string;
  templateId: string;
  customDomain?: string;
  content: WebsiteContent;
  settings: WebsiteSettings;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface WebsiteContent {
  hero: {
    heading: string;
    subheading: string;
    ctaText: string;
    ctaLink: string;
    image?: string;
  };
  about: {
    heading: string;
    content: string;
    image?: string;
  };
  services: {
    heading: string;
    subheading: string;
    items: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  testimonials: Array<{
    quote: string;
    name: string;
    title?: string;
  }>;
  contact: {
    heading: string;
    subheading: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
  };
}

export interface WebsiteSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: string;
  favicon?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
  };
}

// Domain types
export interface Domain {
  id: string;
  userId: string;
  websiteId: string;
  name: string;
  status: 'pending' | 'active' | 'error';
  provider: 'name.com' | 'external';
  createdAt: string;
  updatedAt: string;
  error?: string;
}

// Onboarding types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}
