
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";

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
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : subscriptionStatus.subscribed ? (
          <div className="space-y-3">
            <div className="flex items-center text-green-600 font-bold">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <span>Subscribed</span>
            </div>
            <p className="text-gray-700">
              Tier: <span className="font-medium">{subscriptionStatus.subscription_tier || "Premium"}</span>
            </p>
            {subscriptionStatus.subscription_end && (
              <p className="text-gray-700">
                Renews:{" "}
                <span className="font-medium">
                  {new Date(
                    subscriptionStatus.subscription_end
                  ).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center text-amber-600 font-bold">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>Not Subscribed</span>
            </div>
            <p className="text-gray-700 mb-3">Upgrade to access all features and benefits.</p>
            <Button asChild className="w-full bg-medical-600 hover:bg-medical-700">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
