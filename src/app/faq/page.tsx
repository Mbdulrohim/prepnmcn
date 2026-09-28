import type { Metadata } from "next";

import FaqSection from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "FAQs | OPREP",
  description:
    "Answers to common questions about OPREP: who can join, what you get, how classes are delivered, and how to register.",
};

export default function FaqPage() {
  return (
    <div className="bg-paper text-foreground">
      <FaqSection as="h1" />
    </div>
  );
}
