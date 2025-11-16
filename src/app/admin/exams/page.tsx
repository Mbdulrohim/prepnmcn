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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { ADMIN_ROLES } from "@/lib/roles";
import { toast } from "sonner";

interface ExamStats {
  total: number;
  published: number;
  draft: number;
  avgDuration: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  level: string;
  duration: number;
  totalQuestions: number;
  status: "draft" | "published" | "archived";
  type: string;
  createdAt: string;
  description?: string;
  institutionId?: string;
  passingScore?: number;
  price?: number;
  currency?: string;
}

export default function ExamsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<ExamAdmin[]>([]);
  const [stats, setStats] = useState<ExamStats>({
    total: 0,
    published: 0,
    draft: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamAdmin | null>(null);
  const [updatingExam, setUpdatingExam] = useState(false);
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [viewingExam, setViewingExam] = useState<ExamAdmin | null>(null);
  const [publishingExam, setPublishingExam] = useState<ExamAdmin | null>(null);
  const [publishNote, setPublishNote] = useState("");
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [examVersions, setExamVersions] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    subject: "",
    type: "quiz" as
      | "quiz"
      | "midterm"
      | "final"
      | "practice"
      | "certification"
      | "licensing"
      | "professional",
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    price: 0,
    currency: "NGN",
    institutionId: "",
    status: "draft" as "draft" | "published" | "archived",
    startAt: "",
    endAt: "",
    allowPreview: false,
    maxAttempts: 3,
    allowMultipleAttempts: false,
  });
  const [institutions, setInstitutions] = useState<any[]>([]);

  const resetForm = () => {
    setCreateForm({
      title: "",
      description: "",
      subject: "",
      type: "quiz",
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      price: 0,
      currency: "NGN",
      institutionId: "",
      status: "draft",
      startAt: "",
      endAt: "",
      allowPreview: false,
      maxAttempts: 3,
      allowMultipleAttempts: false,
    });
    setEditingExam(null);
  };

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const userRole = (session.user as any)?.role;
    if (!userRole || !(ADMIN_ROLES as readonly string[]).includes(userRole)) {
      router.push("/dashboard");
      return;
    }

    fetchExams();
  }, [session, status, router]);

  useEffect(() => {
    if (!showCreateModal) {
      resetForm();
    }
  }, [showCreateModal]);

  // Helper to convert ISO datetime string to local datetime-local input format
  const isoToLocalInput = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    // apply timezone offset for local representation
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fetchInstitutions = async () => {
    try {
      const response = await fetch("/api/admin/institutions");
      const data = await response.json();
      if (data.success) {
        setInstitutions(data.data);
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const handleCreateExam = async () => {
    try {
      setCreatingExam(true);
      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "exam",
          title: createForm.title,
          description: createForm.description,
          subject: createForm.subject,
          examType: createForm.type,
          duration: createForm.duration,
          totalMarks: createForm.totalMarks,
          passingMarks: createForm.passingMarks,
          price: createForm.price,
          currency: createForm.currency,
          startAt: createForm.startAt
            ? new Date(createForm.startAt).toISOString()
            : null,
          endAt: createForm.endAt
            ? new Date(createForm.endAt).toISOString()
            : null,
          allowPreview: createForm.allowPreview,
          maxAttempts: createForm.maxAttempts,
          allowMultipleAttempts: createForm.allowMultipleAttempts,
          institutionId: createForm.institutionId,
          status: createForm.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreateForm({
          title: "",
          description: "",
          subject: "",
          type: "quiz",
          duration: 60,
          totalMarks: 100,
          passingMarks: 40,
          price: 0,
          currency: "NGN",
          institutionId: "",
          status: "draft",
          startAt: "",
          endAt: "",
          allowPreview: false,
          maxAttempts: 3,
          allowMultipleAttempts: false,
        });
        fetchExams();
        toast.success("Exam created successfully!");
      } else {
        toast.error(
          "Failed to create exam: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam. Please try again.");
    } finally {
      setCreatingExam(false);
    }
  };

  const handleViewExam = (exam: Exam) => {
    setViewingExam(exam);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setCreateForm({
      title: exam.title,
      description: exam.description || "",
      subject: exam.subject,
      type: exam.type as any,
      duration: exam.duration,
      totalMarks: exam.totalQuestions,
      passingMarks: exam.passingScore || 40,
      price: exam.price || 0,
      currency: exam.currency || "NGN",
      institutionId: exam.institutionId || "",
      status: exam.status,
      startAt: isoToLocalInput((exam as any)?.startAt || null),
      endAt: isoToLocalInput((exam as any)?.endAt || null),
      allowPreview: (exam as any)?.allowPreview || false,
      maxAttempts: (exam as any)?.maxAttempts || 3,
      allowMultipleAttempts: (exam as any)?.allowMultipleAttempts || false,
    });
    setShowCreateModal(true);
  };

  const handleUpdateExam = async () => {
    if (!editingExam) return;

    try {
      setUpdatingExam(true);
      const response = await fetch(`/api/admin/exams/${editingExam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createForm,
          institutionId: createForm.institutionId || null,
          startAt: createForm.startAt
            ? new Date(createForm.startAt).toISOString()
            : null,
          endAt: createForm.endAt
            ? new Date(createForm.endAt).toISOString()
            : null,
          allowPreview: createForm.allowPreview,
          maxAttempts: createForm.maxAttempts,
          allowMultipleAttempts: createForm.allowMultipleAttempts,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Exam updated successfully!");
        setShowCreateModal(false);
        setEditingExam(null);
        await fetchExams();
      } else {
        toast.error(
          "Failed to update exam: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("Failed to update exam. Please try again.");
    } finally {
      setUpdatingExam(false);
    }
  };

  const handleDeleteExam = (exam: Exam) => {
    setDeletingExam(exam);
  };

  const handlePublishExam = async () => {
    if (!publishingExam) return;
    try {
      const resp = await fetch(
        `/api/admin/exams/${publishingExam.id}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: publishNote }),
        }
      );
      const data = await resp.json();
      if (data.success) {
        toast.success("Exam published");
        setPublishingExam(null);
        setPublishNote("");
        fetchExams();
      } else {
        toast.error("Failed to publish exam: " + (data.error || "Unknown"));
      }
    } catch (err) {
      toast.error("Failed to publish exam");
    }
  };

  const confirmDeleteExam = async () => {
    if (!deletingExam) return;

    try {
      const response = await fetch(`/api/admin/exams/${deletingExam.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Exam deleted successfully!");
        await fetchExams();
      } else {
        toast.error(
          "Failed to delete exam: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam. Please try again.");
    } finally {
      setDeletingExam(null);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/exams");
      const data = await response.json();

      if (data.success) {
        setExams(data.data.exams);
        setStats(data.data.stats);
      } else {
        console.error("Failed to fetch exams:", data.error);
        setExams([]);
        setStats({ total: 0, published: 0, draft: 0, avgDuration: 0 });
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
      setStats({ total: 0, published: 0, draft: 0, avgDuration: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatExamType = (type: string) => {
    switch (type) {
      case "certification":
        return "Certification";
      case "licensing":
        return "Licensing";
      case "professional":
        return "Professional";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }
  interface ExamAdmin extends Exam {
    startAt?: string | null;
    endAt?: string | null;
    allowPreview?: boolean;
    maxAttempts?: number;
    allowMultipleAttempts?: boolean;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">
            Manage and monitor exam content across all subjects and levels.
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                fetchInstitutions();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingExam ? "Edit Exam" : "Create New Exam"}
              </DialogTitle>
              <DialogDescription>
                {editingExam
                  ? "Update the exam details below."
                  : "Add a new exam to the system. Fill in the details below."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Enter exam title"
                  disabled={creatingExam}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Enter exam description"
                  disabled={creatingExam}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={createForm.subject}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, subject: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Enter subject"
                  disabled={creatingExam}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={createForm.type}
                  onValueChange={(value: any) =>
                    setCreateForm({ ...createForm, type: value })
                  }
                  disabled={creatingExam}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="licensing">Licensing</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={createForm.duration}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                  disabled={creatingExam}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalMarks" className="text-right">
                  Total Marks
                </Label>
                <Input
                  id="totalMarks"
                  type="number"
                  value={createForm.totalMarks}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      totalMarks: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="passingMarks" className="text-right">
                  Passing Marks
                </Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={createForm.passingMarks}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      passingMarks: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={createForm.price}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="col-span-2"
                  placeholder="0.00"
                />
                <Select
                  value={createForm.currency}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, currency: value })
                  }
                >
                  <SelectTrigger className="col-span-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution" className="text-right">
                  Institution{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Select
                  value={createForm.institutionId}
                  onValueChange={(value) =>
                    setCreateForm({
                      ...createForm,
                      institutionId: value === "none" ? "" : value,
                    })
                  }
                  disabled={creatingExam}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select institution (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not applicable</SelectItem>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={createForm.status}
                  onValueChange={(value: "draft" | "published" | "archived") =>
                    setCreateForm({ ...createForm, status: value })
                  }
                  disabled={creatingExam || updatingExam}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startAt" className="text-right">
                  Start At
                </Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={createForm.startAt}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, startAt: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endAt" className="text-right">
                  End At
                </Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={createForm.endAt}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, endAt: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxAttempts" className="text-right">
                  Max Attempts
                </Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={createForm.maxAttempts}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      maxAttempts: parseInt(e.target.value || "0"),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Options</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      checked={createForm.allowPreview}
                      onCheckedChange={(v) =>
                        setCreateForm({ ...createForm, allowPreview: !!v })
                      }
                    />
                    <div className="ml-2 text-sm">Allow Preview</div>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      checked={createForm.allowMultipleAttempts}
                      onCheckedChange={(v) =>
                        setCreateForm({
                          ...createForm,
                          allowMultipleAttempts: !!v,
                        })
                      }
                    />
                    <div className="ml-2 text-sm">Allow Multiple Attempts</div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={editingExam ? handleUpdateExam : handleCreateExam}
                disabled={creatingExam || updatingExam}
              >
                {creatingExam
                  ? "Creating..."
                  : updatingExam
                  ? "Updating..."
                  : editingExam
                  ? "Update Exam"
                  : "Create Exam"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration} min</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Exams</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell className="capitalize">
                    {formatExamType(exam.type)}
                  </TableCell>
                  <TableCell>{exam.level} Level</TableCell>
                  <TableCell>{exam.duration} min</TableCell>
                  <TableCell>{exam.totalQuestions}</TableCell>
                  <TableCell>{getStatusBadge(exam.status)}</TableCell>
                  <TableCell>{exam.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewExam(exam)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPublishingExam(exam);
                          }}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Publish
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            setViewingExam(exam);
                            setVersionsOpen(true);
                            try {
                              const resp = await fetch(
                                `/api/admin/exams/${exam.id}/versions`
                              );
                              const data = await resp.json();
                              if (data.success) setExamVersions(data.data);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Versions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditExam(exam)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteExam(exam)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredExams.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No exams found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Get started by creating your first exam."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Exam Dialog */}
      <Dialog open={!!viewingExam} onOpenChange={() => setViewingExam(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Exam Details</DialogTitle>
            <DialogDescription>
              View the complete details of this exam.
            </DialogDescription>
          </DialogHeader>
          {viewingExam && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Title</Label>
                <div className="col-span-3 text-sm">{viewingExam.title}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Description</Label>
                <div className="col-span-3 text-sm">
                  {viewingExam.description || "No description provided"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Subject</Label>
                <div className="col-span-3 text-sm">{viewingExam.subject}</div>
              </div>
              {viewingExam.startAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Start At</Label>
                  <div className="col-span-3 text-sm">
                    {new Date(viewingExam.startAt).toLocaleString()}
                  </div>
                </div>
              )}
              {viewingExam.endAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">End At</Label>
                  <div className="col-span-3 text-sm">
                    {new Date(viewingExam.endAt).toLocaleString()}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Options</Label>
                <div className="col-span-3 text-sm">
                  <div>
                    Allow Preview: {viewingExam.allowPreview ? "Yes" : "No"}
                  </div>
                  <div>Max Attempts: {viewingExam.maxAttempts || 0}</div>
                  <div>
                    Allow Multiple Attempts:{" "}
                    {viewingExam.allowMultipleAttempts ? "Yes" : "No"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Type</Label>
                <div className="col-span-3 text-sm capitalize">
                  {formatExamType(viewingExam.type)}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Level</Label>
                <div className="col-span-3 text-sm">
                  {viewingExam.level} Level
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Duration</Label>
                <div className="col-span-3 text-sm">
                  {viewingExam.duration} minutes
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">
                  Total Questions
                </Label>
                <div className="col-span-3 text-sm">
                  {viewingExam.totalQuestions}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Status</Label>
                <div className="col-span-3">
                  {getStatusBadge(viewingExam.status)}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Passing Score</Label>
                <div className="col-span-3 text-sm">
                  {viewingExam.passingScore
                    ? `${viewingExam.passingScore}%`
                    : "Not set"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Price</Label>
                <div className="col-span-3 text-sm">
                  {viewingExam.price
                    ? `${viewingExam.currency || "NGN"} ${viewingExam.price}`
                    : "Free"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Created</Label>
                <div className="col-span-3 text-sm">
                  {viewingExam.createdAt}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingExam(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Exam Dialog */}
      <Dialog
        open={!!publishingExam}
        onOpenChange={() => setPublishingExam(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Publish Exam</DialogTitle>
            <DialogDescription>
              Publishing will snapshot current questions & metadata. Add an
              optional note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Exam</Label>
              <div className="col-span-3 text-sm">{publishingExam?.title}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Note</Label>
              <Textarea
                value={publishNote}
                onChange={(e) => setPublishNote(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPublishingExam(null)}>
              Cancel
            </Button>
            <Button onClick={handlePublishExam}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions Dialog */}
      <Dialog open={versionsOpen} onOpenChange={() => setVersionsOpen(false)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Exam Versions</DialogTitle>
            <DialogDescription>
              List of published snapshots for this exam.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {examVersions.length === 0 && (
              <div className="text-muted-foreground">No versions yet.</div>
            )}
            <div className="space-y-3">
              {examVersions.map((v) => (
                <Card key={v.id} className="p-3">
                  <div className="text-sm font-medium">
                    {new Date(v.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Note: {v.note || "—"}
                  </div>
                  <div className="text-xs mt-2">
                    Questions: {(v.snapshot?.questions || []).length}
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setVersionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingExam}
        onOpenChange={() => setDeletingExam(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingExam?.title}"? This
              action cannot be undone and will permanently remove the exam and
              all its questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteExam}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
