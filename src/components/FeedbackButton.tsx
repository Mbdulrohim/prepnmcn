"use client";

import { useSession } from "next-auth/react";
import FeedbackDialog from "@/components/FeedbackDialog";
import { MessageSquare } from "lucide-react";

interface FeedbackButtonProps {
  children: React.ReactNode;
}

export default function FeedbackButton({ children }: FeedbackButtonProps) {
  const { data: session } = useSession();

  // Only show feedback button if user is authenticated
  if (!session) {
    return null;
  }

  return <FeedbackDialog>{children}</FeedbackDialog>;
}
