import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, BarChart2, Settings, LayoutTemplate } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  color: string;
}

const Dashboard = () => {
  const { userId, getToken } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [practiceName, setPracticeName] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  }>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });

  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("practice_name, specialty, avatar_url")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load your profile. Please try again.",
            variant: "destructive",
          });
        } else if (data) {
          setPracticeName(data.practice_name);
          setSpecialty(data.specialty);
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    const checkSubscription = async () => {
      try {
        const token = await getToken({ template: "supabase" });

        const response = await fetch("/api/check-subscription", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to check subscription:", response.statusText);
          toast({
            title: "Subscription Check Failed",
            description:
              "Unable to verify your subscription status. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const data = await response.json();
        setSubscriptionStatus({
          subscribed: data.subscribed,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
        });
      } catch (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Subscription Check Error",
          description:
            "An error occurred while checking your subscription status.",
          variant: "destructive",
        });
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), checkSubscription()]);
      setIsLoading(false);
    };

    fetchData();
  }, [userId, navigate, toast, getToken]);

  const navigationItems = [
    {
      name: "Analytics",
      href: "/dashboard",
      icon: BarChart2,
      color: "text-sky-600 bg-sky-100",
    },
    {
      name: "Schedule",
      href: "/schedule",
      icon: CalendarDays,
      color: "text-orange-600 bg-orange-100",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      color: "text-neutral-600 bg-neutral-100",
    },
    {
      name: 'Websites',
      href: '/websites',
      icon: LayoutTemplate,
      color: 'text-green-600 bg-green-100',
    },
  ];

  return (
    <Shell>
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <Avatar>
            {isLoading ? (
              <Skeleton className="h-12 w-12 rounded-full" />
            ) : avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={practiceName || "Avatar"} />
            ) : (
              <AvatarFallback>{practiceName?.charAt(0) || "P"}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                practiceName || "Loading..."
              )}
            </CardTitle>
            <CardContent className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                specialty || "Loading..."
              )}
            </CardContent>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {navigationItems.map((item) => (
            <Card key={item.name} className="overflow-hidden">
              <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.name}
                </CardTitle>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Button asChild variant="link">
                    <Link to={item.href}>Go to {item.name}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : subscriptionStatus.subscribed ? (
              <>
                <p className="text-green-600 font-bold">Subscribed</p>
                <p>
                  Tier: {subscriptionStatus.subscription_tier || "Unknown"}
                </p>
                {subscriptionStatus.subscription_end && (
                  <p>
                    Renews:{" "}
                    {new Date(
                      subscriptionStatus.subscription_end
                    ).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-red-600 font-bold">Not Subscribed</p>
                <Button asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

export default Dashboard;
