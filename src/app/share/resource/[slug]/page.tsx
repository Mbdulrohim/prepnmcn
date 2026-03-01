"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  AlertCircle,
  Lock,
  BookOpen,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SharedResource {
  id: number;
  name: string;
  isFree: boolean;
  isShareable: boolean;
  shareSlug: string;
  programName: string | null;
  programCode: string | null;
  createdAt: string;
  fileUrl: string;
}

export default function SharedResourcePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [resource, setResource] = useState<SharedResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/share/resource/${slug}`);
    } else if (status === "authenticated") {
      loadResource();
    }
  }, [status, slug]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/resources/share/${slug}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Resource not found");
      }

      setResource(data.data);
    } catch (err: any) {
      console.error("Error loading resource:", err);
      setError(err.message || "Failed to load resource");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resource?.fileUrl) {
      toast.error("File not available for download");
      return;
    }

    setIsDownloading(true);
    try {
      const a = document.createElement("a");
      a.href = resource.fileUrl;
      a.download = `${resource.name}.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started");
    } catch {
      toast.error("Failed to start download");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/resource/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: resource?.name || "Shared Resource",
          text: `Check out this study resource on O'Prep: ${resource?.name}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-lg">
        <Card className="text-center">
          <CardContent className="py-12 space-y-4">
            <div className="bg-red-100 rounded-full p-4 w-fit mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold">Resource Not Found</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={() => router.push("/resources")}>
              Browse Resources
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card>
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">{resource.name}</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <Badge variant={resource.isFree ? "secondary" : "default"}>
                {resource.isFree ? "Free" : "Premium"}
              </Badge>
              {resource.programCode && (
                <Badge variant="outline">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {resource.programCode}
                  {resource.programName && ` - ${resource.programName}`}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <div className="text-center text-sm text-muted-foreground">
            Shared on{" "}
            {new Date(resource.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleDownload}
              disabled={isDownloading || !resource.fileUrl}
              className="flex-1 max-w-xs"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1 max-w-xs"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </div>

          {!resource.fileUrl && (
            <div className="flex items-center gap-2 justify-center text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              <Lock className="h-4 w-4" />
              <span>File not available. Contact an administrator.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
