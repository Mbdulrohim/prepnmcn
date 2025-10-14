"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  TrendingUp,
  Globe,
  BarChart3,
  Eye,
  Target,
  RefreshCw,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface SEOMetrics {
  totalPages: number;
  averageScore: number;
  indexedPages: number;
  organicTraffic: number;
}

interface SEOIssue {
  id: string;
  page: string;
  issue: string;
  severity: "high" | "medium" | "low";
  status: "open" | "fixed" | "ignored";
}

interface MetaTag {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  lastUpdated: string;
}

export default function SEOManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("");
  const [newMetaTag, setNewMetaTag] = useState({
    page: "",
    title: "",
    description: "",
    keywords: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any)?.role)
    ) {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchMetrics();
      fetchIssues();
      fetchMetaTags();
    }
  }, [session, status, router]);

  const fetchMetrics = async () => {
    try {
      // TODO: Implement API call to fetch real SEO metrics
      setMetrics(null);
    } catch (error) {
      console.error("Error fetching SEO metrics:", error);
    }
  };

  const fetchIssues = async () => {
    try {
      // TODO: Implement API call to fetch real SEO issues
      setIssues([]);
    } catch (error) {
      console.error("Error fetching SEO issues:", error);
    }
  };

  const fetchMetaTags = async () => {
    try {
      // TODO: Implement API call to fetch real meta tags
      setMetaTags([]);
    } catch (error) {
      console.error("Error fetching meta tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMetaTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMetaTag.page || !newMetaTag.title || !newMetaTag.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // TODO: Implement API call to create meta tag
      toast.info("Meta tag creation would be implemented here");
    } catch (error) {
      toast.error("Failed to update meta tags");
    }
  };

  const handleFixIssue = (issueId: string) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId ? { ...issue, status: "fixed" as const } : issue
      )
    );
    toast.success("SEO issue marked as fixed");
  };

  const handleRunAudit = () => {
    toast.info("SEO audit would be implemented here");
  };

  const handleGenerateSitemap = () => {
    toast.info("Sitemap generation would be implemented here");
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">SEO Management</h1>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {metrics?.totalPages || 0} Pages
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {metrics?.averageScore || 0}% Avg Score
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {metrics?.organicTraffic?.toLocaleString() || 0} Traffic
          </Badge>
        </div>
      </div>

      {/* SEO Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Total Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPages}</div>
              <p className="text-xs text-muted-foreground">Indexed pages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageScore}%</div>
              <p className="text-xs text-muted-foreground">SEO performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Indexed Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.indexedPages}</div>
              <p className="text-xs text-muted-foreground">
                Search engine indexed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Organic Traffic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.organicTraffic.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Monthly visitors</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Tags Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta Tags Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMetaTag} className="space-y-4">
              <div>
                <Label htmlFor="page-url">Page URL</Label>
                <Input
                  id="page-url"
                  value={newMetaTag.page}
                  onChange={(e) =>
                    setNewMetaTag({ ...newMetaTag, page: e.target.value })
                  }
                  placeholder="e.g., /dashboard"
                  required
                />
              </div>
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={newMetaTag.title}
                  onChange={(e) =>
                    setNewMetaTag({ ...newMetaTag, title: e.target.value })
                  }
                  placeholder="Page title for search results"
                  required
                />
              </div>
              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={newMetaTag.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewMetaTag({
                      ...newMetaTag,
                      description: e.target.value,
                    })
                  }
                  placeholder="Page description for search results"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="meta-keywords">Keywords</Label>
                <Input
                  id="meta-keywords"
                  value={newMetaTag.keywords}
                  onChange={(e) =>
                    setNewMetaTag({ ...newMetaTag, keywords: e.target.value })
                  }
                  placeholder="Comma-separated keywords"
                />
              </div>
              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Update Meta Tags
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* SEO Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              SEO Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleRunAudit}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Run SEO Audit
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleGenerateSitemap}
            >
              <Globe className="mr-2 h-4 w-4" />
              Generate Sitemap
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                toast.info(" robots.txt management would be implemented here")
              }
            >
              <Target className="mr-2 h-4 w-4" />
              Update robots.txt
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                toast.info("Structured data would be implemented here")
              }
            >
              <Search className="mr-2 h-4 w-4" />
              Add Structured Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SEO Issues */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Issues ({issues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{issue.page}</h3>
                    <p className="text-sm text-muted-foreground">
                      {issue.issue}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          issue.severity === "high"
                            ? "destructive"
                            : issue.severity === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {issue.severity} priority
                      </Badge>
                      <Badge
                        variant={
                          issue.status === "fixed"
                            ? "default"
                            : issue.status === "ignored"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                  {issue.status === "open" && (
                    <Button size="sm" onClick={() => handleFixIssue(issue.id)}>
                      Mark Fixed
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meta Tags Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Tags Overview ({metaTags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metaTags.map((tag) => (
              <div key={tag.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{tag.page}</h3>
                    <p className="text-sm font-medium mt-1">{tag.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tag.description}
                    </p>
                    {tag.keywords && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Keywords: {tag.keywords}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {tag.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
