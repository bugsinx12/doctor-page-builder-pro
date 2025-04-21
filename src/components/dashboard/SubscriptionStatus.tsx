
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SubscriptionStatusProps {
  isLoading: boolean;
  subscriptionStatus: {
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  };
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  isLoading,
  subscriptionStatus,
}) => {
  return (
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
              Tier: {subscriptionStatus.subscription_tier || "Premium"}
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
            <p className="text-amber-600 font-bold">Not Subscribed</p>
            <Button asChild className="mt-2">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
