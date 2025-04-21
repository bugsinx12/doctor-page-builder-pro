
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface WebsiteTemplateCardProps {
  template: any; // Use the Template type if possible
  practiceInfo: { name: string; specialty: string };
  onCreate: (templateId: string) => void;
}

const WebsiteTemplateCard: React.FC<WebsiteTemplateCardProps> = ({ template, practiceInfo, onCreate }) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-gray-100">
        <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
        {template.popular && (
          <div className="absolute top-2 right-2 bg-medical-600 text-white text-xs font-bold px-2 py-1 rounded">
            Popular
          </div>
        )}
        {template.new && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            New
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium mb-2">Features:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {template.features.map((feature: string, i: number) => (
            <li key={i}>• {feature}</li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Use this template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create website with this template?</DialogTitle>
              <DialogDescription>
                This will create a new website using {template.name} template with your practice information.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4"><span className="font-medium">Practice name:</span> {practiceInfo.name}</p>
              {practiceInfo.specialty && (
                <p className="mb-4"><span className="font-medium">Specialty:</span> {practiceInfo.specialty}</p>
              )}
            </div>
            <div className="flex justify-end gap-4">
              {/* The close button should trigger closing via dialog logic */}
              <Button variant="outline" data-dialog-close>
                Cancel
              </Button>
              <Button onClick={() => onCreate(template.id)} data-dialog-close>
                Create Website
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default WebsiteTemplateCard;
