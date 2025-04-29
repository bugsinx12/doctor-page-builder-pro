
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticationTest from "./AuthenticationTest";

interface AuthTabsProps {
  defaultTab: string;
  templateId: string | null;
  userId?: string | null;
}

const AuthTabs = ({ defaultTab, templateId, userId }: AuthTabsProps) => {
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        <AuthenticationTest userId={userId} />
        
        <TabsContent value="login">
          <SignIn 
            signUpUrl={`/auth?tab=signup${templateId ? `&template=${templateId}` : ''}`}
            redirectUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none p-0",
                form: "w-full",
                formButtonPrimary: "bg-medical-600 hover:bg-medical-700",
                formFieldInput: "border-gray-300 focus:border-medical-500 focus:ring-medical-500",
                identityPreviewEditButton: "text-medical-600",
                footerActionLink: "text-medical-600 hover:text-medical-700",
              }
            }}
          />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignUp 
            signInUrl={`/auth?tab=login${templateId ? `&template=${templateId}` : ''}`}
            redirectUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none p-0",
                form: "w-full",
                formButtonPrimary: "bg-medical-600 hover:bg-medical-700",
                formFieldInput: "border-gray-300 focus:border-medical-500 focus:ring-medical-500",
                identityPreviewEditButton: "text-medical-600",
                footerActionLink: "text-medical-600 hover:text-medical-700",
                otpCodeFieldInput: "border-gray-300 focus:border-medical-500 focus:ring-medical-500",
              }
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AuthTabs;
