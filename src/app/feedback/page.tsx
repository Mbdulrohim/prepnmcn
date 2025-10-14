"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Feedback() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      setStatus("Feedback submitted successfully!");
      setMessage("");
    } else {
      const data = await res.json();
      setStatus(data.error || "Error submitting feedback");
    }
  };

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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Share Your Feedback
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Help us improve O'Prep by sharing your thoughts and suggestions.
        </p>

        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to submit feedback.
            </p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-8"
          >
            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Feedback
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think about O'Prep..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
                rows={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={!message.trim()}>
              Submit Feedback
            </Button>
            {status && (
              <p className="mt-4 text-center text-gray-600">{status}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
