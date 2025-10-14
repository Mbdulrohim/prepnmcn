"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ForumsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard for now since forums aren't implemented yet
    // This will be replaced with actual forums functionality later
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Forums
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Forums feature coming soon! Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
