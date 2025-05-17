
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface AuthTabsProps {
  defaultTab: string;
  templateId: string | null;
}

const AuthTabs = ({ defaultTab, templateId }: AuthTabsProps) => {
  const [currentTab, setCurrentTab] = useState(defaultTab);
  
  const handleSwitchToSignUp = () => {
    setCurrentTab('signup');
  };
  
  const handleSwitchToLogin = () => {
    setCurrentTab('login');
  };

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        <TabsContent value="login">
          <LoginForm onSwitchToSignUp={handleSwitchToSignUp} />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignupForm onSwitchToLogin={handleSwitchToLogin} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AuthTabs;
