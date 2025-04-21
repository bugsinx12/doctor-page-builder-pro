
import { Template } from "@/types";

export const templates: Template[] = [
  {
    id: "general-practice-1",
    name: "Modern General Practice",
    description: "Clean, professional design for general practitioners with sections for services, team members, and patient resources.",
    thumbnail: "/placeholder.svg",
    category: "general",
    features: [
      "Responsive design optimized for all devices",
      "Patient appointment booking integration",
      "Team members showcase",
      "Service overview with detailed descriptions",
      "Patient testimonials section",
      "Contact form with Google Maps integration"
    ],
    popular: true,
    preview: "/placeholder.svg",
    screenshots: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    tags: ["modern", "clean", "professional"]
  },
  {
    id: "specialist-1",
    name: "Specialist Clinic",
    description: "Showcase your specialty with dedicated sections for your expertise, procedures, and professional accomplishments.",
    thumbnail: "/placeholder.svg",
    category: "specialist",
    features: [
      "Specialty highlight sections",
      "Procedure and treatment descriptions",
      "Before/after gallery",
      "Professional credentials showcase",
      "Research and publications section",
      "Specialized patient resources"
    ],
    new: true,
    preview: "/placeholder.svg",
    screenshots: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    tags: ["specialist", "professional", "focused"]
  },
  {
    id: "clinic-1",
    name: "Modern Clinic",
    description: "Multi-doctor practice with team sections, individual doctor profiles, and comprehensive service listings.",
    thumbnail: "/placeholder.svg",
    category: "clinic",
    features: [
      "Team directory with individual profiles",
      "Department/specialty navigation",
      "Insurance information section",
      "Patient portal integration",
      "Multi-location support",
      "News and updates section"
    ],
    popular: true,
    preview: "/placeholder.svg",
    screenshots: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    tags: ["multi-provider", "clinic", "comprehensive"]
  }
];
