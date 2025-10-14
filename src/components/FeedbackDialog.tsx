"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface FeedbackDialogProps {
  children?: React.ReactNode;
  triggerClassName?: string;
}

export default function FeedbackDialog({
  children,
  triggerClassName = "",
}: FeedbackDialogProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    if (!session) {
      toast.error("Please sign in to submit feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (res.ok) {
        toast.success("Thank you for your feedback!");
        setMessage("");
        setIsOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred while submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className={triggerClassName}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve O'Prep by sharing your thoughts and suggestions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Your Feedback</Label>
            <Textarea
              id="feedback-message"
              placeholder="Tell us what you think about O'Prep..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim() && !isSubmitting) {
                    handleSubmit(e as any);
                  }
                }
              }}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}