"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  ChevronUp,
  ChevronDown,
  Upload,
  FileText,
} from "lucide-react";
import { ADMIN_ROLES } from "@/lib/roles";
import { toast } from "sonner";

interface Question {
  id: string;
  examId: string;
  question: string;
  type:
    | "multiple_choice"
    | "true_false"
    | "essay"
    | "short_answer"
    | "fill_blanks";
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  type: string;
  status: "draft" | "published" | "archived";
}

export default function QuestionsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [updatingQuestion, setUpdatingQuestion] = useState(false);
  const [uploadingQuestions, setUploadingQuestions] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<"csv" | "document">("csv");

  const [createForm, setCreateForm] = useState({
    question: "",
    type: "multiple_choice" as Question["type"],
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    marks: 1,
  });

  useEffect(() => {
    if (status === "loading") return;

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
    if (selectedExamId) {
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (!showCreateModal) {
      resetForm();
    }
  }, [showCreateModal]);

  const resetForm = () => {
    setCreateForm({
      question: "",
      type: "multiple_choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      marks: 1,
    });
    setEditingQuestion(null);
  };

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/admin/exams");
      const data = await response.json();

      if (data.success) {
        setExams(data.data.exams);
      } else {
        console.error("Failed to fetch exams:", data.error);
        setExams([]);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedExamId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/questions?examId=${selectedExamId}`
      );
      const data = await response.json();

      if (data.success) {
        setQuestions(data.data.questions);
      } else {
        console.error("Failed to fetch questions:", data.error);
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!selectedExamId) {
      toast.error("Please select an exam first");
      return;
    }

    try {
      setCreatingQuestion(true);
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId: selectedExamId,
          ...createForm,
          options:
            createForm.type === "multiple_choice"
              ? createForm.options.filter((opt) => opt.trim())
              : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Question created successfully!");
        setShowCreateModal(false);
        await fetchQuestions();
      } else {
        toast.error(
          "Failed to create question: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question. Please try again.");
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setCreateForm({
      question: question.question,
      type: question.type,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer || "",
      explanation: question.explanation || "",
      marks: question.marks,
    });
    setShowCreateModal(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      setUpdatingQuestion(true);
      const response = await fetch(
        `/api/admin/questions/${editingQuestion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...createForm,
            options:
              createForm.type === "multiple_choice"
                ? createForm.options.filter((opt) => opt.trim())
                : null,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Question updated successfully!");
        setShowCreateModal(false);
        await fetchQuestions();
      } else {
        toast.error(
          "Failed to update question: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question. Please try again.");
    } finally {
      setUpdatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Question deleted successfully!");
        await fetchQuestions();
      } else {
        toast.error(
          "Failed to delete question: " + (data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question. Please try again.");
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedExamId) {
      toast.error("Please select an exam first");
      return;
    }

    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploadingQuestions(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("examId", selectedExamId);

      const endpoint =
        uploadType === "csv"
          ? "/api/admin/questions/upload/csv"
          : "/api/admin/questions/upload";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (uploadType === "csv") {
          toast.success(
            `Successfully uploaded ${data.questions?.length || 0} questions!`
          );
        } else {
          toast.success(
            `Successfully parsed and uploaded ${
              data.data?.questionsParsed || 0
            } questions from document!`
          );
        }
        setUploadFile(null);
        await fetchQuestions();
      } else {
        toast.error(
          "Failed to upload questions: " +
            (data.error || data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error uploading questions:", error);
      toast.error("Failed to upload questions. Please try again.");
    } finally {
      setUploadingQuestions(false);
    }
  };

  const handleReorderQuestion = async (
    questionId: string,
    direction: "up" | "down"
  ) => {
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) return;

    const newIndex = direction === "up" ? questionIndex - 1 : questionIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[questionIndex], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[questionIndex],
    ];

    // Update order numbers
    updatedQuestions.forEach((q, index) => {
      q.order = index + 1;
    });

    setQuestions(updatedQuestions);

    // Update in database
    try {
      await Promise.all(
        updatedQuestions.map((q, index) =>
          fetch(`/api/admin/questions/${q.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index + 1 }),
          })
        )
      );
      toast.success("Question order updated!");
    } catch (error) {
      console.error("Error updating question order:", error);
      toast.error("Failed to update question order");
      // Revert changes
      await fetchQuestions();
    }
  };

  const filteredQuestions = questions.filter((question) =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getQuestionTypeBadge = (type: string) => {
    const colors = {
      multiple_choice: "bg-blue-100 text-blue-800",
      true_false: "bg-green-100 text-green-800",
      essay: "bg-purple-100 text-purple-800",
      short_answer: "bg-orange-100 text-orange-800",
      fill_blanks: "bg-pink-100 text-pink-800",
    };
    return (
      <Badge
        className={
          colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {type.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...createForm.options];
    newOptions[index] = value;
    setCreateForm({ ...createForm, options: newOptions });
  };

  if (loading && !selectedExamId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Question Management
          </h1>
          <p className="text-muted-foreground">
            Manage questions for your exams
          </p>
        </div>
      </div>

      {/* Exam Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>
            Choose an exam to manage its questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an exam..." />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title} - {exam.subject} ({exam.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedExamId && (
        <>
          {/* Questions Management */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    Manage questions for the selected exam
                  </CardDescription>
                </div>
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                  {/* Upload Section */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                    <Select
                      value={uploadType}
                      onValueChange={(value: "csv" | "document") =>
                        setUploadType(value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV/Excel</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                      <Input
                        type="file"
                        accept={
                          uploadType === "csv"
                            ? ".csv,.xlsx,.xls"
                            : ".pdf,.docx,.txt"
                        }
                        onChange={(e) =>
                          setUploadFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="question-upload"
                      />
                      <Label
                        htmlFor="question-upload"
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate max-w-[120px] sm:max-w-none">
                          {uploadFile ? uploadFile.name : "Choose File"}
                        </span>
                      </Label>
                      <Button
                        onClick={handleBulkUpload}
                        disabled={!uploadFile || uploadingQuestions}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {uploadingQuestions ? (
                          "Uploading..."
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Add Question Button */}
                  <Dialog
                    open={showCreateModal}
                    onOpenChange={setShowCreateModal}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingQuestion
                            ? "Edit Question"
                            : "Add New Question"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingQuestion
                            ? "Update the question details below."
                            : "Add a new question to the exam."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                          <Label htmlFor="question" className="sm:text-right">
                            Question
                          </Label>
                          <Textarea
                            id="question"
                            value={createForm.question}
                            onChange={(e) =>
                              setCreateForm({
                                ...createForm,
                                question: e.target.value,
                              })
                            }
                            className="sm:col-span-3"
                            placeholder="Enter the question text"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                          <Label htmlFor="type" className="sm:text-right">
                            Type
                          </Label>
                          <Select
                            value={createForm.type}
                            onValueChange={(value: Question["type"]) =>
                              setCreateForm({ ...createForm, type: value })
                            }
                          >
                            <SelectTrigger className="sm:col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">
                                Multiple Choice
                              </SelectItem>
                              <SelectItem value="true_false">
                                True/False
                              </SelectItem>
                              <SelectItem value="essay">Essay</SelectItem>
                              <SelectItem value="short_answer">
                                Short Answer
                              </SelectItem>
                              <SelectItem value="fill_blanks">
                                Fill in the Blanks
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {createForm.type === "multiple_choice" && (
                          <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-start gap-4">
                            <Label className="sm:text-right sm:pt-2">
                              Options
                            </Label>
                            <div className="sm:col-span-3 space-y-2">
                              {createForm.options.map((option, index) => (
                                <Input
                                  key={index}
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(index, e.target.value)
                                  }
                                  placeholder={`Option ${index + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                          <Label
                            htmlFor="correctAnswer"
                            className="sm:text-right"
                          >
                            Correct Answer
                          </Label>
                          {createForm.type === "multiple_choice" ? (
                            <Select
                              value={createForm.correctAnswer}
                              onValueChange={(value) =>
                                setCreateForm({
                                  ...createForm,
                                  correctAnswer: value,
                                })
                              }
                            >
                              <SelectTrigger className="sm:col-span-3">
                                <SelectValue placeholder="Select correct option" />
                              </SelectTrigger>
                              <SelectContent>
                                {createForm.options.map(
                                  (option, index) =>
                                    option.trim() && (
                                      <SelectItem key={index} value={option}>
                                        {option}
                                      </SelectItem>
                                    )
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Textarea
                              id="correctAnswer"
                              value={createForm.correctAnswer}
                              onChange={(e) =>
                                setCreateForm({
                                  ...createForm,
                                  correctAnswer: e.target.value,
                                })
                              }
                              className="sm:col-span-3"
                              placeholder="Enter the correct answer"
                              rows={2}
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                          <Label
                            htmlFor="explanation"
                            className="sm:text-right"
                          >
                            Explanation
                          </Label>
                          <Textarea
                            id="explanation"
                            value={createForm.explanation}
                            onChange={(e) =>
                              setCreateForm({
                                ...createForm,
                                explanation: e.target.value,
                              })
                            }
                            className="sm:col-span-3"
                            placeholder="Optional explanation for the answer"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-4">
                          <Label htmlFor="marks" className="sm:text-right">
                            Marks
                          </Label>
                          <Input
                            id="marks"
                            type="number"
                            value={createForm.marks}
                            onChange={(e) =>
                              setCreateForm({
                                ...createForm,
                                marks: parseInt(e.target.value) || 1,
                              })
                            }
                            className="sm:col-span-3"
                            min="1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={
                            editingQuestion
                              ? handleUpdateQuestion
                              : handleCreateQuestion
                          }
                          disabled={creatingQuestion || updatingQuestion}
                        >
                          {creatingQuestion
                            ? "Creating..."
                            : updatingQuestion
                            ? "Updating..."
                            : editingQuestion
                            ? "Update Question"
                            : "Create Question"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Loading questions...
                    </p>
                  </div>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No questions found matching your search."
                        : "No questions added yet."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Order</TableHead>
                        <TableHead className="min-w-[200px]">
                          Question
                        </TableHead>
                        <TableHead className="w-24">Type</TableHead>
                        <TableHead className="min-w-[150px]">
                          Correct Answer
                        </TableHead>
                        <TableHead className="w-16">Marks</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions.map((question, index) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {question.order}
                              </span>
                              <div className="flex flex-col">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleReorderQuestion(question.id, "up")
                                  }
                                  disabled={index === 0}
                                  className="h-4 w-4 p-0"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleReorderQuestion(question.id, "down")
                                  }
                                  disabled={
                                    index === filteredQuestions.length - 1
                                  }
                                  className="h-4 w-4 p-0"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className="max-w-xs truncate"
                              title={question.question}
                            >
                              {question.question}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getQuestionTypeBadge(question.type)}
                          </TableCell>
                          <TableCell>
                            <div
                              className="max-w-xs truncate text-green-600 font-medium"
                              title={question.correctAnswer}
                            >
                              {question.correctAnswer || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{question.marks}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditQuestion(question)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleDeleteQuestion(question.id)
                                  }
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
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
