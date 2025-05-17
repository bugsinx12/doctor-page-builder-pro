
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/Shell";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import NavigationItems from "@/components/dashboard/NavigationItems";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const Dashboard = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const { subscriptionStatus, isLoading: isSubscriptionLoading } = useSubscriptionStatus();
  
  useEffect(() => {
    if (!user || !session) {
      navigate("/auth");
    }
  }, [user, session, navigate]);

  useEffect(() => {
    console.log("Dashboard - Profile:", profile);
    console.log("Dashboard - Subscription:", subscriptionStatus);
  }, [profile, subscriptionStatus]);

  return (
    <Shell>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          <ProfileHeader
            isLoading={loading}
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
