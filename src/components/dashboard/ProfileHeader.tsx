
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";

interface ProfileHeaderProps {
  isLoading: boolean;
  practiceName: string | null;
  specialty: string | null;
  avatarUrl: string | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isLoading,
  practiceName,
  specialty,
  avatarUrl,
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const onboardingCompleted = user?.unsafeMetadata?.onboardingCompleted as boolean;

  return (
    <div className="flex items-center gap-4">
      <Avatar>
        {isLoading ? (
          <Skeleton className="h-12 w-12 rounded-full" />
        ) : avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={practiceName || "Avatar"} />
        ) : (
          <AvatarFallback>{practiceName?.charAt(0) || user?.firstName?.charAt(0) || "P"}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-col gap-1">
        <CardTitle className="text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            practiceName || user?.firstName || "Welcome"
          )}
        </CardTitle>
        <CardContent className="p-0 text-sm text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            specialty || (onboardingCompleted ? "No specialty set" : "Please complete onboarding")
          )}
          {!onboardingCompleted && (
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-medical-600"
              onClick={() => navigate("/onboarding")}
            >
              Complete your profile
            </Button>
          )}
        </CardContent>
      </div>
    </div>
  );
};

export default ProfileHeader;
