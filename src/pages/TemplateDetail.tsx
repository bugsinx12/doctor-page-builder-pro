
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/Shell";
import { templates } from "@/data/templates";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const template = templates.find((t) => t.id === id);

  if (!template) {
    return (
      <Shell>
        <div className="container py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Template not found</h2>
            <p className="mt-4 text-gray-600">
              The template you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild className="mt-6">
              <Link to="/templates">Back to Templates</Link>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container py-12">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="sticky top-24">
              <h1 className="text-4xl font-bold">{template.name}</h1>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="mt-6 text-lg text-gray-600">{template.description}</p>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold">Features</h3>
                <ul className="mt-4 space-y-3">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-medical-50 text-medical-600">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-10">
                <Button asChild size="lg">
                  <Link to="/auth?tab=signup&template=1">
                    Use this template
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="overflow-hidden rounded-xl border shadow-sm">
              <img
                src={template.preview}
                alt={template.name}
                className="w-full object-cover"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {template.screenshots.map((screenshot, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border shadow-sm"
                >
                  <img
                    src={screenshot}
                    alt={`${template.name} screenshot ${index + 1}`}
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
