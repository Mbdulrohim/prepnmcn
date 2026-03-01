"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Trash2,
  BookOpen,
  DollarSign,
  File,
  Share2,
  Link,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ProgramInfo {
  id: string;
  code: string;
  name: string;
}

interface Resource {
  id: number;
  name: string;
  contentText: string;
  isFree: boolean;
  isGlobal: boolean;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  programId?: string;
  program?: ProgramInfo;
}

interface ResourceStats {
  totalResources: number;
  freeResources: number;
  premiumResources: number;
  totalDownloads: number; // This would need to be tracked separately
}

export default function ResourcesManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<Set<number>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("all");
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: "",
    isFree: true,
    programId: "" as string,
    isGlobal: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<number | null>(null);
  const [shareDialog, setShareDialog] = useState<{
    open: boolean;
    resourceId: number | null;
    resourceName: string;
    currentSlug: string;
    isShareable: boolean;
  }>({
    open: false,
    resourceId: null,
    resourceName: "",
    currentSlug: "",
    isShareable: false,
  });
  const [shareSlugInput, setShareSlugInput] = useState("");
  const [isSavingShare, setIsSavingShare] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any)?.role)
    ) {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchResources();
      fetchPrograms();
    }
  }, [session, status, router]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedType, selectedProgramFilter]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchResources();
    }
  }, [selectedProgramFilter]);

  useEffect(() => {
    if (resources.length > 0 || totalCount > 0) {
      calculateStats();
    }
  }, [resources, totalCount]);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs ?? []);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchResources = async (newLimit?: number) => {
    try {
      const currentLimit = newLimit || limit;
      const params = new URLSearchParams({ limit: String(currentLimit) });
      if (selectedProgramFilter && selectedProgramFilter !== "all") {
        params.set("programId", selectedProgramFilter);
      }
      const res = await fetch(`/api/admin/resources?${params}`);
      const data = await res.json();

      if (res.ok) {
        setResources(data.resources || []);
        setTotalCount(data.totalCount || 0);
        setHasMore(data.hasMore || false);
        if (newLimit) {
          setLimit(newLimit);
        }
      } else {
        toast.error("Failed to load resources");
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setIsLoading(false);
    }
  };

  const increaseLimit = () => {
    const newLimit = Math.min(limit + 20, 100); // Max 100, increase by 20
    fetchResources(newLimit);
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(
        (resource) =>
          resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.contentText.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedType && selectedType !== "all") {
      if (selectedType === "free") {
        filtered = filtered.filter((resource) => resource.isFree);
      } else if (selectedType === "premium") {
        filtered = filtered.filter((resource) => !resource.isFree);
      }
    }

    setFilteredResources(filtered);
  };

  const calculateStats = () => {
    const totalResources = totalCount;
    const freeResources = resources.filter((r) => r.isFree).length;
    const premiumResources = resources.filter((r) => !r.isFree).length;

    setStats({
      totalResources,
      freeResources,
      premiumResources,
      totalDownloads: 0, // This would need a separate tracking system
    });
  };

  const toggleResourceSelection = (resourceId: number) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(resourceId)) {
      newSelected.delete(resourceId);
    } else {
      newSelected.add(resourceId);
    }
    setSelectedResources(newSelected);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.name) {
      toast.error("Please provide a file and a name.");
      return;
    }

    // Client-side validation
    if (!uploadForm.file.type.includes("pdf")) {
      toast.error("Only PDF files are allowed.");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadForm.file.size > maxSize) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append("name", uploadForm.name);
    formData.append("isFree", String(uploadForm.isFree));
    if (uploadForm.programId) {
      formData.append("programId", uploadForm.programId);
    }
    formData.append("isGlobal", String(uploadForm.isGlobal));

    try {
      const response = await fetch("/api/admin/resources", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newResource = await response.json();
        setResources([newResource, ...resources]);
        setUploadForm({
          file: null,
          name: "",
          isFree: true,
          programId: "",
          isGlobal: false,
        });
        setIsUploadOpen(false);
        toast.success("Resource uploaded successfully.");
      } else {
        let errorMessage = "Failed to upload resource.";
        try {
          const errorData = await response.json();
          // Check if errorData is empty or doesn't have a message
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (Object.keys(errorData).length === 0) {
            // Empty object - provide status-based error message
            switch (response.status) {
              case 400:
                errorMessage = "Invalid request. Please check your input.";
                break;
              case 401:
                errorMessage = "Unauthorized. Please log in again.";
                break;
              case 403:
                errorMessage =
                  "Forbidden. You don't have permission to upload resources.";
                break;
              case 413:
                errorMessage = "File too large. Please choose a smaller file.";
                break;
              case 415:
                errorMessage =
                  "Unsupported file type. Only PDF files are allowed.";
                break;
              case 500:
                errorMessage = "Server error. Please try again later.";
                break;
              default:
                errorMessage = `Upload failed with status ${response.status}`;
            }
          }
          console.error("Upload failed:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });
        } catch (parseError) {
          // If response is not valid JSON, use status text or generic message
          errorMessage =
            response.statusText ||
            `Upload failed with status ${response.status}`;
          console.error(
            "Upload failed - invalid JSON response:",
            response.status,
            response.statusText,
          );
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const response = await fetch(
        `/api/admin/resources/${resource.id}?download=true`,
        {
          method: "GET",
        },
      );

      if (response.ok) {
        const data = await response.json();
        const downloadUrl = data.downloadUrl;

        // Create a download link and trigger download
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${resource.name}.pdf`;
        a.target = "_blank"; // Open in new tab as fallback
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success("Download started");
      } else {
        toast.error("Failed to download resource");
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
      toast.error("Failed to download resource");
    }
  };

  const handleToggleType = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/admin/resources/${resource.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const updatedResource = await response.json();
        setResources(
          resources.map((r) => (r.id === resource.id ? updatedResource : r)),
        );
        toast.success(
          `Resource changed to ${updatedResource.isFree ? "Free" : "Premium"}`,
        );
      } else {
        let errorMessage = "Failed to update resource type";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Failed to update resource type (${response.status})`;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error toggling resource type:", error);
      toast.error("Failed to update resource type");
    }
  };

  const handleView = (resource: Resource) => {
    // Open PDF directly using the S3 presigned URL
    if (resource.fileUrl) {
      window.open(resource.fileUrl, "_blank");
    } else {
      toast.error("File not available for viewing");
    }
  };

  const handleDelete = async (resourceId: number) => {
    setDeleteResourceId(resourceId);
  };

  const confirmDelete = async () => {
    if (!deleteResourceId) {
      console.log("No resource ID to delete");
      return;
    }

    console.log("Attempting to delete resource:", deleteResourceId);

    try {
      const response = await fetch(`/api/admin/resources/${deleteResourceId}`, {
        method: "DELETE",
      });

      console.log("Delete response status:", response.status);
      const data = await response.json();
      console.log("Delete response data:", data);

      if (response.ok) {
        toast.success("Resource deleted successfully");
        // Refresh the resources list
        fetchResources();
        // Refresh stats
        calculateStats();
      } else {
        toast.error(data.message || "Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    } finally {
      setDeleteResourceId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedProgramFilter("all");
  };

  const getProgramBadge = (resource: Resource) => {
    if (resource.isGlobal)
      return (
        <Badge variant="outline" className="text-xs">
          Global
        </Badge>
      );
    if (resource.program)
      return (
        <Badge variant="secondary" className="text-xs">
          {resource.program.code}
        </Badge>
      );
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Unassigned
      </Badge>
    );
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  };

  const openShareDialog = (resource: Resource) => {
    const isShareable = !!(resource as any).isShareable;
    const currentSlug = (resource as any).shareSlug || "";
    setShareDialog({
      open: true,
      resourceId: resource.id,
      resourceName: resource.name,
      currentSlug,
      isShareable,
    });
    setShareSlugInput(currentSlug || generateSlug(resource.name));
  };

  const handleEnableShare = async () => {
    if (!shareDialog.resourceId || !shareSlugInput) {
      toast.error("Please enter a share slug");
      return;
    }

    setIsSavingShare(true);
    try {
      const response = await fetch(
        `/api/admin/resources/${shareDialog.resourceId}/share`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareSlug: shareSlugInput }),
        },
      );
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Sharing enabled! Link copied to clipboard.");
        const shareUrl = `${window.location.origin}/share/resource/${shareSlugInput}`;
        await navigator.clipboard.writeText(shareUrl);
        setShareDialog((prev) => ({
          ...prev,
          isShareable: true,
          currentSlug: shareSlugInput,
        }));
        fetchResources();
      } else {
        toast.error(data.error || "Failed to enable sharing");
      }
    } catch {
      toast.error("Failed to enable sharing");
    } finally {
      setIsSavingShare(false);
    }
  };

  const handleDisableShare = async () => {
    if (!shareDialog.resourceId) return;

    setIsSavingShare(true);
    try {
      const response = await fetch(
        `/api/admin/resources/${shareDialog.resourceId}/share`,
        { method: "DELETE" },
      );

      if (response.ok) {
        toast.success("Sharing disabled");
        setShareDialog((prev) => ({
          ...prev,
          isShareable: false,
          currentSlug: "",
        }));
        fetchResources();
      } else {
        toast.error("Failed to disable sharing");
      }
    } catch {
      toast.error("Failed to disable sharing");
    } finally {
      setIsSavingShare(false);
    }
  };

  const copyShareLink = async (slug: string) => {
    const url = `${window.location.origin}/share/resource/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied!");
  };

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-64 mx-auto" />
          <div className="flex justify-center gap-2 mt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-end gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header */}
              <div className="flex items-center space-x-4 pb-2 border-b">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              {/* Table Rows */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">
          Resources Management
        </h1>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {stats?.totalResources || 0} Resources
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {stats?.freeResources || 0} Free
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {stats?.premiumResources || 0} Premium
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResources}</div>
              <p className="text-xs text-muted-foreground">Study materials</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Free Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.freeResources}</div>
              <p className="text-xs text-muted-foreground">Open access</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Premium Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumResources}</div>
              <p className="text-xs text-muted-foreground">Paid content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Resources</Label>
              <Input
                id="search"
                placeholder="Resource name or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Resource Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="free">Free Resources</SelectItem>
                  <SelectItem value="premium">Premium Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="program-filter">Program</Label>
              <Select
                value={selectedProgramFilter}
                onValueChange={setSelectedProgramFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload New Resource</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="upload-name">Resource Name</Label>
                      <Input
                        id="upload-name"
                        value={uploadForm.name}
                        onChange={(e) =>
                          setUploadForm({ ...uploadForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="upload-file">PDF File</Label>
                      <Input
                        id="upload-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            file: e.target.files ? e.target.files[0] : null,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="upload-program">Program</Label>
                      <Select
                        value={
                          uploadForm.isGlobal
                            ? "global"
                            : uploadForm.programId || "none"
                        }
                        onValueChange={(val) => {
                          if (val === "global") {
                            setUploadForm({
                              ...uploadForm,
                              programId: "",
                              isGlobal: true,
                            });
                          } else if (val === "none") {
                            setUploadForm({
                              ...uploadForm,
                              programId: "",
                              isGlobal: false,
                            });
                          } else {
                            setUploadForm({
                              ...uploadForm,
                              programId: val,
                              isGlobal: false,
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            No program (unassigned)
                          </SelectItem>
                          <SelectItem value="global">
                            Global (all programs)
                          </SelectItem>
                          {programs.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.code} - {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        id="upload-isFree"
                        type="checkbox"
                        checked={uploadForm.isFree}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            isFree: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="upload-isFree">Free Resource</Label>
                    </div>
                    <Button
                      type="submit"
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? "Uploading..." : "Upload Resource"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Resources ({filteredResources.length} of {totalCount})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {limit} items</span>
              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseLimit}
                  className="text-xs"
                >
                  Load More (+20)
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow
                  key={resource.id}
                  data-state={
                    selectedResources.has(resource.id) ? "selected" : undefined
                  }
                  onClick={() => toggleResourceSelection(resource.id)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedResources.has(resource.id)}
                      onChange={() => toggleResourceSelection(resource.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell>{getProgramBadge(resource)}</TableCell>
                  <TableCell>
                    <Badge variant={resource.isFree ? "secondary" : "default"}>
                      {resource.isFree ? "Free" : "Premium"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {resource.contentText.substring(0, 100)}...
                    </p>
                  </TableCell>
                  <TableCell>
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(resource);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleType(resource);
                        }}
                        className={
                          resource.isFree
                            ? "text-green-600 hover:text-green-700"
                            : "text-blue-600 hover:text-blue-700"
                        }
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(resource);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openShareDialog(resource);
                        }}
                        className={
                          (resource as any).isShareable
                            ? "text-green-600 hover:text-green-700"
                            : "text-muted-foreground"
                        }
                        title={
                          (resource as any).isShareable
                            ? "Sharing enabled"
                            : "Enable sharing"
                        }
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(resource.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the resource.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeleteResourceId(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDelete}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog
        open={shareDialog.open}
        onOpenChange={(open) => setShareDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Resource
            </DialogTitle>
            <DialogDescription>
              Make &quot;{shareDialog.resourceName}&quot; accessible via a
              shareable link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {shareDialog.isShareable ? (
              <>
                <div className="space-y-2">
                  <Label>Share Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/resource/${shareDialog.currentSlug}`}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyShareLink(shareDialog.currentSlug)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        window.open(
                          `/share/resource/${shareDialog.currentSlug}`,
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
                  <Share2 className="h-4 w-4" />
                  <span>
                    Sharing is enabled. Anyone with the link can access this
                    resource.
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="share-slug">Share Slug</Label>
                <Input
                  id="share-slug"
                  value={shareSlugInput}
                  onChange={(e) =>
                    setShareSlugInput(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  placeholder="e.g. anatomy-notes-2026"
                />
                <p className="text-xs text-muted-foreground">
                  URL will be: /share/resource/{shareSlugInput || "your-slug"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {shareDialog.isShareable ? (
              <Button
                variant="destructive"
                onClick={handleDisableShare}
                disabled={isSavingShare}
              >
                {isSavingShare ? "Disabling..." : "Disable Sharing"}
              </Button>
            ) : (
              <Button
                onClick={handleEnableShare}
                disabled={isSavingShare || !shareSlugInput}
              >
                <Link className="mr-2 h-4 w-4" />
                {isSavingShare ? "Enabling..." : "Enable Sharing"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
