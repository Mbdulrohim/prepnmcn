"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import FeedbackDialog from "@/components/FeedbackDialog";
import { MessageSquare } from "lucide-react";

export default function FeedbackButton() {
  const { data: session } = useSession();

  // Only show feedback button if user is authenticated
  if (!session) {
    return null;
  }

  return (
    <FeedbackDialog>
      <Button variant="ghost" size="sm">
        <MessageSquare className="h-4 w-4 mr-2" />
        Feedback
      </Button>
    </FeedbackDialog>
  );
}