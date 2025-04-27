
import { toast } from "@/hooks/use-toast";

export type WebsiteError = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

export const getWebsiteError = (error: unknown): WebsiteError => {
  // Handle specific error types
  if (error instanceof Error) {
    if (error.message.includes("Authentication")) {
      return {
        title: "Authentication Error",
        description: "Please log in and try again.",
        variant: "destructive",
      };
    }
    
    if (error.message.includes("duplicate key")) {
      return {
        title: "Name Already Taken",
        description: "Please choose a different name for your website.",
        variant: "destructive",
      };
    }
  }

  // Generic database errors
  if (typeof error === "object" && error !== null && "code" in error) {
    const { code } = error as { code: string };
    if (code === "23505") {
      return {
        title: "Duplicate Entry",
        description: "This website name or URL is already in use.",
        variant: "destructive",
      };
    }
    if (code === "23503") {
      return {
        title: "Invalid Reference",
        description: "The template you selected is no longer available.",
        variant: "destructive",
      };
    }
  }

  // Default error
  console.error("Website creation error:", error);
  return {
    title: "Error",
    description: "Failed to create website. Please try again.",
    variant: "destructive",
  };
};

export const getValidationError = (
  practiceInfo: { name?: string; specialty?: string }
): WebsiteError | null => {
  if (!practiceInfo.name?.trim()) {
    return {
      title: "Missing Information",
      description: "Practice name is required.",
      variant: "destructive",
    };
  }

  if (!practiceInfo.specialty?.trim()) {
    return {
      title: "Missing Information",
      description: "Practice specialty is required.",
      variant: "destructive",
    };
  }

  return null;
};
