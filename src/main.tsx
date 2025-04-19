
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = "pk_test_ZnVua3ktbGFicmFkb3ItOTEuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Create a simple client-side routing function for Clerk redirects
const routing = {
  // Function called anytime the app needs to navigate
  // We'll just let the browser handle it directly
  navigate: (to) => window.location.assign(to)
};

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    routing={routing}
  >
    <App />
  </ClerkProvider>
);
