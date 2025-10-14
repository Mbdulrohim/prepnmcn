"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FeedbackDialog from "@/components/FeedbackDialog";

export default function Feedback() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    fetch("/api/user/me")
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // User not authenticated
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Share Your Feedback
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Help us improve O'Prep by sharing your thoughts and suggestions.
        </p>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Please sign in to submit feedback.
            </p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <FeedbackDialog>
              <Button size="lg" className="px-8">
                Give Feedback
              </Button>
            </FeedbackDialog>
            <p className="text-sm text-gray-500">
              Your feedback helps us make O'Prep better for everyone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
