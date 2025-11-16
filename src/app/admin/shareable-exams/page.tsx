"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Share2,
  Copy,
  CheckCircle,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

interface ShareableExam {
  id: string;
  title: string;
  subject: string;
  shareSlug: string;
  isShareable: boolean;
  status: string;
  duration: number;
  totalQuestions: number;
  createdAt: string;
}

interface CreateExamForm {
  title: string;
  description: string;
  subject: string;
  type: string;
  duration: number;
  shareSlug: string;
  status?: string;
}

export default function ShareableExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ShareableExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingExam, setEditingExam] = useState<ShareableExam | null>(null);
  const [updating, setUpdating] = useState(false);

  const [createForm, setCreateForm] = useState<CreateExamForm>({
    title: "",
    description: "",
    subject: "",
    type: "quiz",
    duration: 60,
    shareSlug: "",
  });

  useEffect(() => {
    loadShareableExams();
  }, []);

  const loadShareableExams = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/exams/shareable");
      const data = await res.json();

      if (data.success) {
        setExams(data.data);
      }
    } catch (error) {
      console.error("Error loading shareable exams:", error);
      toast.error("Failed to load shareable exams");
    } finally {
      setLoading(false);
    }
  };

  const createShareableExam = async () => {
    if (!createForm.title || !createForm.subject || !createForm.shareSlug) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/admin/exams/shareable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create shareable exam");
      }

      toast.success("Shareable exam created!");
      setShowCreateDialog(false);
      setCreateForm({
        title: "",
        description: "",
        subject: "",
        type: "quiz",
        duration: 60,
        shareSlug: "",
      });

      // Redirect to add questions
      router.push(`/admin/shareable-exams/${data.data.id}/questions`);
    } catch (error: any) {
      console.error("Error creating shareable exam:", error);
      toast.error(error.message || "Failed to create shareable exam");
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (exam: ShareableExam) => {
    setEditingExam(exam);
    setCreateForm({
      title: exam.title,
      description: exam.subject, // Using subject as description for now
      subject: exam.subject,
      type: "quiz",
      duration: exam.duration,
      shareSlug: exam.shareSlug,
      status: exam.status,
    });
  };

  const updateShareableExam = async () => {
    if (!editingExam) return;
    if (!createForm.title || !createForm.subject || !createForm.shareSlug) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/exams/${editingExam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description,
          subject: createForm.subject,
          type: createForm.type,
          duration: createForm.duration,
          shareSlug: createForm.shareSlug,
          status: createForm.status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update exam");
      }

      toast.success("Exam updated successfully!");
      setEditingExam(null);
      setCreateForm({
        title: "",
        description: "",
        subject: "",
        type: "quiz",
        duration: 60,
        shareSlug: "",
      });
      await loadShareableExams();
    } catch (error: any) {
      console.error("Error updating exam:", error);
      toast.error(error.message || "Failed to update exam");
    } finally {
      setUpdating(false);
    }
  };

  const deleteExam = async (examId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this shareable exam? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/exams/shareable/${examId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete exam");
      }

      toast.success("Exam deleted");
      loadShareableExams();
    } catch (error: any) {
      console.error("Error deleting exam:", error);
      toast.error(error.message || "Failed to delete exam");
    }
  };

  const copyShareLink = (slug: string) => {
    const link = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    toast.success("Link copied to clipboard!");

    setTimeout(() => setCopiedSlug(""), 2000);
  };

  const openShareLink = (slug: string) => {
    window.open(`/share/${slug}`, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading shareable exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Shareable Exams
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Create link-shareable exams that anyone can access
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Shareable Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Share2 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Shareable Exams Yet
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Create shareable exams with custom questions that users can access
              directly via link without enrollment.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Shareable Exam
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl">
                      {exam.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      {exam.subject} • {exam.duration} mins •{" "}
                      {exam.totalQuestions} questions
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      exam.status === "published"
                        ? "bg-green-100 text-green-700 self-start"
                        : "bg-yellow-100 text-yellow-700 self-start"
                    }
                  >
                    {exam.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Share2 className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <code className="text-xs sm:text-sm text-gray-900 truncate">
                        {window.location.origin}/share/{exam.shareSlug}
                      </code>
                    </div>
                    <Button
                      onClick={() => copyShareLink(exam.shareSlug)}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {copiedSlug === exam.shareSlug ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    {exam.status === "draft" && (
                      <Button
                        onClick={() => openEditDialog(exam)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Edit Details</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        router.push(
                          `/admin/shareable-exams/${exam.id}/questions`
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">
                        {exam.status === "draft"
                          ? "Add Questions"
                          : "Manage Questions"}
                      </span>
                      <span className="sm:hidden">
                        {exam.status === "draft" ? "Add" : "Manage"}
                      </span>
                    </Button>
                    <Button
                      onClick={() => openShareLink(exam.shareSlug)}
                      variant="outline"
                      size="sm"
                      disabled={exam.status === "draft"}
                      className="w-full sm:w-auto"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => deleteExam(exam.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingExam}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingExam(null);
            setCreateForm({
              title: "",
              description: "",
              subject: "",
              type: "quiz",
              duration: 60,
              shareSlug: "",
            });
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? "Edit Exam Details" : "Create Shareable Exam"}
            </DialogTitle>
            <DialogDescription>
              {editingExam
                ? "Update the exam information. You can only edit draft exams."
                : "Create a new exam that can be accessed via shareable link without enrollment."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
                placeholder="e.g., Mathematics Final Exam 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="Brief description of the exam"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={createForm.subject}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, subject: e.target.value })
                  }
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Exam Type *</Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={createForm.duration}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    duration: parseInt(e.target.value) || 60,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Share Slug *</Label>
              <Input
                id="slug"
                value={createForm.shareSlug}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    shareSlug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ""),
                  })
                }
                placeholder="e.g., math-final-2024"
              />
              <p className="text-sm text-gray-600">
                Link will be: {window.location.origin}/share/
                {createForm.shareSlug || "your-slug"}
              </p>
            </div>

            {editingExam && (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  {createForm.status === "published"
                    ? "Exam will be accessible via share link"
                    : "Exam is hidden and not accessible"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingExam(null);
                setCreateForm({
                  title: "",
                  description: "",
                  subject: "",
                  type: "quiz",
                  duration: 60,
                  shareSlug: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingExam ? updateShareableExam : createShareableExam}
              disabled={
                !createForm.title ||
                !createForm.subject ||
                !createForm.shareSlug ||
                creating ||
                updating
              }
            >
              {creating || updating
                ? "Saving..."
                : editingExam
                ? "Update Exam"
                : "Create & Add Questions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
