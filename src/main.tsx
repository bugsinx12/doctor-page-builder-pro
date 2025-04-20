
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

// Make sure to use the environment variable or the publishable key directly
const PUBLISHABLE_KEY = "pk_test_ZnVua3ktbGFicmFkb3ItOTEuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    navigate={(to) => window.location.href = to} // Use window.location for navigation
  >
    <App />
  </ClerkProvider>
);
