
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Shell } from "@/components/Shell";
import { useSyncUserProfile } from "@/hooks/useSyncUserProfile";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import NavigationItems from "@/components/dashboard/NavigationItems";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";

const Dashboard = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading: isProfileLoading } = useSyncUserProfile();
  const { subscriptionStatus, isLoading: isSubscriptionLoading } = useSubscriptionStatus();
  
  useEffect(() => {
    if (!userId) {
      navigate("/auth");
    }
  }, [userId, navigate]);

  useEffect(() => {
    console.log("Dashboard - Profile:", profile);
    console.log("Dashboard - Subscription:", subscriptionStatus);
  }, [profile, subscriptionStatus]);

  return (
    <Shell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6">
          <ProfileHeader
            isLoading={isProfileLoading}
            practiceName={profile?.practice_name || null}
            specialty={profile?.specialty || null}
            avatarUrl={profile?.avatar_url || null}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <NavigationItems />

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
