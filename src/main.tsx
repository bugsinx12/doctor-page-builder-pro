
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = "pk_test_ZnVua3ktbGFicmFkb3ItOTEuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Since we're at the root level, we can't use hooks directly
// We'll rely on Clerk's default navigation behavior which will use
// the browser's window.location.href under the hood
createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
