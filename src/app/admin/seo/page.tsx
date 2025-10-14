import { Metadata } from "next";
import SEOManager from "../../../components/admin/SEOManager";

export const metadata: Metadata = {
  title: "SEO Management | Admin Dashboard",
  description:
    "Optimize search engine visibility with advanced SEO tools, meta tags management, and performance analytics.",
  keywords:
    "SEO management, search engine optimization, meta tags, analytics, admin",
  openGraph: {
    title: "SEO Management",
    description: "Advanced SEO management and optimization tools",
    type: "website",
  },
};

export default function SEOPage() {
  return (
    <div className="container mx-auto py-6">
      <SEOManager />
    </div>
  );
}
