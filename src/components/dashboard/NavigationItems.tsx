
import React from 'react';
import { BarChart2, CalendarDays, Settings, LayoutTemplate } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

const navigationItems: NavItem[] = [
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

interface NavigationItemsProps {
  className?: string;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({ className }) => {
  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}>
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
  );
};

export default NavigationItems;
