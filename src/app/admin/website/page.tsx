import { Metadata } from "next";
import WebsiteManager from "../../../components/admin/WebsiteManager";

export const metadata: Metadata = {
  title: "Website Content Management | Admin Dashboard",
  description:
    "Manage website content including community voices, campus stories, learner testimonials, and blog posts.",
  keywords:
    "website content, community voices, campus stories, testimonials, blog, admin",
  openGraph: {
    title: "Website Content Management",
    description: "Manage and update website content sections",
    type: "website",
  },
};

export default function WebsitePage() {
  return (
    <div className="container mx-auto py-6">
      <WebsiteManager />
    </div>
  );
}
