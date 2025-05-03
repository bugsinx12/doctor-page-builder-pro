
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/Shell";
import { useSyncUserProfile } from "@/hooks/useSyncUserProfile";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import NavigationItems from "@/components/dashboard/NavigationItems";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";
import { useClerkSupabaseAuth } from "@/hooks/useClerkSupabaseAuth";
import { useSession } from "@clerk/clerk-react";

const Dashboard = () => {
  const { session } = useSession();
  const { isAuthenticated, userId: clerkId } = useClerkSupabaseAuth();
  const navigate = useNavigate();
  const { profile, isLoading: isProfileLoading } = useSyncUserProfile();
  const { subscriptionStatus, isLoading: isSubscriptionLoading } = useSubscriptionStatus();
  
  useEffect(() => {
    if (!session?.user?.id || !isAuthenticated) {
      navigate("/auth");
    }
  }, [session, navigate, isAuthenticated]);

  useEffect(() => {
    console.log("Dashboard - Profile:", profile);
    console.log("Dashboard - Subscription:", subscriptionStatus);
  }, [profile, subscriptionStatus]);

  return (
    <Shell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          <ProfileHeader
            isLoading={isProfileLoading}
            practiceName={profile?.practice_name || null}
            specialty={profile?.specialty || null}
            avatarUrl={profile?.avatar_url || null}
          />

          <div className="space-y-8">
            <NavigationItems className="w-full" />

            <SubscriptionStatus
              isLoading={isSubscriptionLoading}
              subscriptionStatus={subscriptionStatus}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default Dashboard;
