import { Metadata } from "next";
import AIEngineManager from "../../../components/admin/AIEngineManager";

export const metadata: Metadata = {
  title: "AI Engine Optimization | Admin Dashboard",
  description:
    "Optimize AI engine performance with advanced analytics, prompt engineering, and model fine-tuning tools.",
  keywords:
    "AI engine optimization, machine learning, prompt engineering, model tuning, admin",
  openGraph: {
    title: "AI Engine Optimization",
    description: "Advanced AI engine optimization and performance management",
    type: "website",
  },
};

export default function AIEnginePage() {
  return (
    <div className="container mx-auto py-6">
      <AIEngineManager />
    </div>
  );
}
