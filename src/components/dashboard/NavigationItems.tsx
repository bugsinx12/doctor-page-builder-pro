
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
  bgClass: string;
}

const navigationItems: NavItem[] = [
  {
    name: "Analytics",
    href: "/dashboard",
    icon: BarChart2,
    color: "text-blue-600",
    bgClass: "bg-blue-50",
  },
  {
    name: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
    color: "text-orange-600",
    bgClass: "bg-orange-50",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    color: "text-neutral-600",
    bgClass: "bg-neutral-50",
  },
  {
    name: 'Websites',
    href: '/websites',
    icon: LayoutTemplate,
    color: 'text-green-600',
    bgClass: 'bg-green-50',
  },
];

interface NavigationItemsProps {
  className?: string;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({ className }) => {
  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ${className || ""}`}>
      {navigationItems.map((item) => (
        <Card key={item.name} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.name}
            </CardTitle>
            <div className={`p-2 rounded-full ${item.bgClass}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mt-4">
              <Button asChild variant="outline" className={`px-4 py-2 rounded-md font-medium ${item.color} hover:${item.bgClass} hover:border-${item.color.replace('text-', '')} transition-colors`}>
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
