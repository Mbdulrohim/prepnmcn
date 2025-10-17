"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InstitutionSelect } from "@/components/InstitutionSelect";
import { GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function InstitutionSelectPage() {
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  const handleContinue = async () => {
    if (!selectedInstitution) {
      toast.error("Please select an institution to continue");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/institution", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institutionId: selectedInstitution,
        }),
      });

      if (response.ok) {
        toast.success("Institution selected successfully!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update institution");
      }
    } catch (error) {
      console.error("Error updating institution:", error);
      toast.error("Failed to update institution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Select Your Institution</CardTitle>
          <CardDescription>
            Choose your educational institution to personalize your experience
            and connect with peers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <InstitutionSelect
              value={selectedInstitution}
              onValueChange={setSelectedInstitution}
              placeholder="Search for your institution..."
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedInstitution || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting up...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't see your institution? Contact support to add it to our
            database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
