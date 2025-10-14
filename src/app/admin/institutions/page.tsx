import { Metadata } from "next";
import InstitutionsManager from "../../../components/admin/InstitutionsManager";

export const metadata: Metadata = {
  title: "Institutions Management | Admin Dashboard",
  description:
    "Manage educational institutions with advanced search, filtering, and geographic features. Add, edit, and organize institutions across Nigeria.",
  keywords:
    "institutions management, universities, polytechnics, colleges, education, Nigeria, admin",
  openGraph: {
    title: "Institutions Management",
    description:
      "Comprehensive institution management system with geographic insights",
    type: "website",
  },
};

export default function InstitutionsPage() {
  return (
    <div className="container mx-auto py-6">
      <InstitutionsManager />
    </div>
  );
}
