
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Website, WebsiteContent, WebsiteSettings } from "@/types";
import { generateStaticLanding } from "@/utils/generateStaticLanding";
import { Loader2 } from "lucide-react";

const LandingView = () => {
  const { id } = useParams<{ id: string }>();
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("No website ID provided");
          return;
        }

        const { data, error } = await supabase
          .from("websites")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching website:", error);
          setError("Website not found");
          return;
        }

        const websiteData: Website = {
          id: data.id,
          userId: data.userid,
          name: data.name,
          slug: data.slug,
          templateId: data.templateid,
          customDomain: data.customdomain || undefined,
          content: data.content as unknown as WebsiteContent,
          settings: data.settings as unknown as WebsiteSettings,
          createdAt: data.createdat,
          updatedAt: data.updatedat,
          publishedAt: data.publishedat || undefined,
        };

        setWebsite(websiteData);
        
        // Generate static HTML
        const staticHtml = generateStaticLanding(
          websiteData.content,
          websiteData.settings,
          websiteData.name,
          websiteData.content.hero.subheading || "Medical Practice"
        );
        
        setHtmlContent(staticHtml);
      } catch (err) {
        console.error("Error in fetchWebsite:", err);
        setError("An error occurred while loading the website");
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Website not found"}
          </h1>
          <p className="text-gray-600">
            The website you're looking for could not be found or is not published.
          </p>
        </div>
      </div>
    );
  }

  // Render the static HTML using an iframe with the generated content
  return (
    <iframe 
      srcDoc={htmlContent}
      title={website.name}
      className="w-full min-h-screen border-none"
      sandbox="allow-same-origin allow-scripts"
    />
  );
};

export default LandingView;
