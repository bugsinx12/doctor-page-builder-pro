
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface OnboardingControllerProps {
  authenticated: boolean;
  children: React.ReactNode;
}

const OnboardingController = ({ authenticated, children }: OnboardingControllerProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    if (!authenticated || !user) return;
    
    const checkOnboardingStatus = async () => {
      const onboardingCompleted = user.unsafeMetadata?.onboardingCompleted as boolean;
      
      if (onboardingCompleted) {
        setIsRedirecting(true);
        navigate('/dashboard', { replace: true });
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate, authenticated]);
  
  if (isRedirecting) {
    return null;
  }
  
  return <>{children}</>;
};

export default OnboardingController;
