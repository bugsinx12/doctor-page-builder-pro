
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Website, Template } from "@/types";

interface WebsiteCardProps {
  website: Website;
  templateName: string;
  onCopyUrl: (websiteId: string) => void;
  onDelete: (websiteId: string) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({
  website,
  templateName,
  onCopyUrl,
  onDelete,
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-4">
      <CardTitle>{website.name}</CardTitle>
      <CardDescription>
        Created: {new Date(website.createdAt).toLocaleDateString()}
      </CardDescription>
    </CardHeader>
    <div className="aspect-video bg-gray-100 px-6">
      {/* Use doctor-hero.svg instead of placeholder.svg */}
      <img
        src="/doctor-hero.svg"
        alt={website.name}
        className="w-full h-full object-cover"
      />
    </div>
    <CardContent className="pt-6">
      <p className="text-sm text-gray-600 mb-4">
        Template: {templateName}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => onCopyUrl(website.id)}
        >
          <Copy className="h-4 w-4" /> Copy URL
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          asChild
        >
          <Link to={`/landings/${website.id}`} target="_blank">
            <ExternalLink className="h-4 w-4" /> View
          </Link>
        </Button>
      </div>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        disabled
      >
        <Edit className="h-4 w-4" /> Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onDelete(website.id)}
      >
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
    </CardFooter>
  </Card>
);

export default WebsiteCard;
