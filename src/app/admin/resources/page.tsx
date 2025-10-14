import { Metadata } from "next";
import ResourcesManager from "../../../components/admin/ResourcesManager";

export const metadata: Metadata = {
  title: "Resources Management | Admin Dashboard",
  description:
    "Manage educational resources with advanced search, filtering, and upload capabilities. Organize and distribute study materials effectively.",
  keywords:
    "resources management, educational materials, pdf upload, study resources, admin",
  openGraph: {
    title: "Resources Management",
    description:
      "Comprehensive resource management system for educational materials",
    type: "website",
  },
};

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-6">
      <ResourcesManager />
    </div>
  );
}
