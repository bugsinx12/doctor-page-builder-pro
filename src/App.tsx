
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import NotFound from "./pages/NotFound";
import './i18n';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    // Wait for auth to load
    if (isLoaded) {
      setChecking(false);
    }
  }, [isLoaded]);
  
  if (checking || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medical-600"></div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ClerkProviderWithRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// This component will pass the correct navigate function to ClerkProvider
const ClerkProviderWithRoutes = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/templates/:id" element={<TemplateDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
