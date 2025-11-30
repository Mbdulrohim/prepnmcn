"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Check,
  Upload,
  FileText,
} from "lucide-react";

interface Question {
  id?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  status: string;
  totalQuestions: number;
}

export default function ManageShareableExamQuestions() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [newQuestion, setNewQuestion] = useState<Question>({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    difficulty: "medium",
    marks: 1,
  });

  useEffect(() => {
    loadExamAndQuestions();
  }, [examId]);

  const loadExamAndQuestions = async () => {
    try {
      setLoading(true);

      // Fetch exam details
      const examRes = await fetch(`/api/admin/exams/${examId}`);
      const examData = await examRes.json();

      if (examData.success) {
        setExam(examData.data);
      }

      // Fetch questions
      const questionsRes = await fetch(`/api/admin/exams/${examId}/questions`);
      const questionsData = await questionsRes.json();

      if (questionsData.success) {
        const mappedQuestions = (questionsData.data || []).map((q: any) => {
          const options = q.options || [];
          const correctIndex = options.findIndex(
            (opt: string) => opt === q.correctAnswer
          );
          const correctLetter =
            correctIndex >= 0 ? ["A", "B", "C", "D"][correctIndex] : "A";

          return {
            id: q.id,
            questionText: q.question,
            optionA: options[0] || "",
            optionB: options[1] || "",
            optionC: options[2] || "",
            optionD: options[3] || "",
            correctAnswer: correctLetter as "A" | "B" | "C" | "D",
            explanation: q.explanation || "",
            difficulty: "medium",
            marks: q.marks || 1,
          };
        });
        setQuestions(mappedQuestions);
      }
    } catch (error) {
      console.error("Error loading exam and questions:", error);
      toast.error("Failed to load exam details");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (
      !newQuestion.questionText ||
      !newQuestion.optionA ||
      !newQuestion.optionB ||
      !newQuestion.optionC ||
      !newQuestion.optionD
    ) {
      toast.error("Please fill in all question fields");
      return;
    }

    setQuestions([...questions, { ...newQuestion }]);
    setNewQuestion({
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
      difficulty: "medium",
      marks: 1,
    });
    toast.success("Question added");
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success("Question removed");
  };

  const handleDocumentUpload = async () => {
    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("examId", examId);

      const response = await fetch("/api/admin/questions/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = "Failed to upload document";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to upload document");
      }

      // Convert uploaded questions to our format
      const uploadedQuestions = data.data.questions.map((q: any) => {
        const options = q.options || [];
        const correctIndex = options.findIndex(
          (opt: string) => opt === q.correctAnswer
        );
        const correctLetter =
          correctIndex >= 0 ? ["A", "B", "C", "D"][correctIndex] : "A";

        return {
          questionText: q.question,
          optionA: options[0] || "",
          optionB: options[1] || "",
          optionC: options[2] || "",
          optionD: options[3] || "",
          correctAnswer: correctLetter as "A" | "B" | "C" | "D",
          explanation: q.explanation || "",
          difficulty: "medium",
          marks: q.marks || 1,
        };
      });

      setQuestions([...questions, ...uploadedQuestions]);
      setUploadFile(null);
      toast.success(
        `Successfully imported ${uploadedQuestions.length} questions from document!`
      );
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const saveAllQuestions = async () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save questions");
      }

      toast.success("Questions saved successfully!");

      // Publish the exam
      await publishExam();
    } catch (error: any) {
      console.error("Error saving questions:", error);
      toast.error(error.message || "Failed to save questions");
    } finally {
      setSaving(false);
    }
  };

  const publishExam = async () => {
    try {
      const res = await fetch(`/api/admin/exams/${examId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: "Published shareable exam",
          publishedBy: "admin",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Exam published successfully!");
        router.push("/admin/shareable-exams");
      }
    } catch (error) {
      console.error("Error publishing exam:", error);
      toast.error("Exam saved but failed to publish");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/shareable-exams")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shareable Exams
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{exam?.title}</h1>
            <p className="text-muted-foreground mt-1">
              {exam?.subject} • {questions.length} questions added
            </p>
          </div>
          <Badge
            className={
              exam?.status === "published"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
            }
          >
            {exam?.status}
          </Badge>
        </div>
      </div>

      {/* Add New Question Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <Plus className="h-4 w-4 mr-2" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question *</Label>
                <Textarea
                  id="questionText"
                  value={newQuestion.questionText}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      questionText: e.target.value,
                    })
                  }
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="optionA">Option A *</Label>
                  <Input
                    id="optionA"
                    value={newQuestion.optionA}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        optionA: e.target.value,
                      })
                    }
                    placeholder="Option A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optionB">Option B *</Label>
                  <Input
                    id="optionB"
                    value={newQuestion.optionB}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        optionB: e.target.value,
                      })
                    }
                    placeholder="Option B"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optionC">Option C *</Label>
                  <Input
                    id="optionC"
                    value={newQuestion.optionC}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        optionC: e.target.value,
                      })
                    }
                    placeholder="Option C"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optionD">Option D *</Label>
                  <Input
                    id="optionD"
                    value={newQuestion.optionD}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        optionD: e.target.value,
                      })
                    }
                    placeholder="Option D"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer *</Label>
                  <Select
                    value={newQuestion.correctAnswer}
                    onValueChange={(value: "A" | "B" | "C" | "D") =>
                      setNewQuestion({ ...newQuestion, correctAnswer: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newQuestion.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      setNewQuestion({ ...newQuestion, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    value={newQuestion.marks}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        marks: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={newQuestion.explanation}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      explanation: e.target.value,
                    })
                  }
                  placeholder="Explain why the correct answer is correct..."
                  rows={2}
                />
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question to List
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-foreground">
                        Upload Question Document
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload PDF, DOCX, or TXT files containing questions
                      </p>
                    </div>

                    <div className="w-full max-w-xs">
                      <Input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) =>
                          setUploadFile(e.target.files?.[0] || null)
                        }
                        className="cursor-pointer"
                      />
                      {uploadFile && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                          <p className="font-medium truncate">
                            {uploadFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleDocumentUpload}
                      disabled={!uploadFile || uploading}
                      className="w-full max-w-xs"
                    >
                      {uploading ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload & Parse Questions
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Document Format Guidelines:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li>Format questions as "Question X: Question text"</li>
                    <li>
                      Format options as "a) Option text", "b) Option text", etc.
                    </li>
                    <li>
                      Mark the correct answer with ** at the end of the option
                      line
                    </li>
                    <li>Separate questions with blank lines</li>
                    <li>Supports 3-4 options per question</li>
                  </ul>

                  <div className="mt-3 p-3 bg-card rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Example:
                    </p>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {`Question 1:
What is the capital of France?
a) London
b) Paris **
c) Berlin
d) Madrid

Question 2:
Which planet is closest to the Sun?
a) Mercury **
b) Venus
c) Earth`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Questions ({questions.length})
          </h2>
          <div className="flex items-center space-x-2">
            {questions.length > 0 && (
              <>
                <Button
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete all ${questions.length} questions? This cannot be undone.`
                      )
                    ) {
                      setQuestions([]);
                      toast.success("All questions removed");
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
                <Button onClick={saveAllQuestions} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save & Publish Exam"}
                </Button>
              </>
            )}
          </div>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No questions added yet. Add your first question above.
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      <Badge className="capitalize">
                        {question.difficulty}
                      </Badge>
                      <Badge variant="secondary">
                        {question.marks} mark{question.marks !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {question.questionText}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeQuestion(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div
                      className={`p-2 rounded ${
                        question.correctAnswer === "A"
                          ? "bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-800"
                          : "bg-muted/50"
                      }`}
                    >
                      <span className="font-semibold">A:</span>{" "}
                      {question.optionA}
                      {question.correctAnswer === "A" && (
                        <Check className="inline h-4 w-4 ml-1 text-green-600" />
                      )}
                    </div>
                    <div
                      className={`p-2 rounded ${
                        question.correctAnswer === "B"
                          ? "bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-800"
                          : "bg-muted/50"
                      }`}
                    >
                      <span className="font-semibold">B:</span>{" "}
                      {question.optionB}
                      {question.correctAnswer === "B" && (
                        <Check className="inline h-4 w-4 ml-1 text-green-600" />
                      )}
                    </div>
                    <div
                      className={`p-2 rounded ${
                        question.correctAnswer === "C"
                          ? "bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-800"
                          : "bg-muted/50"
                      }`}
                    >
                      <span className="font-semibold">C:</span>{" "}
                      {question.optionC}
                      {question.correctAnswer === "C" && (
                        <Check className="inline h-4 w-4 ml-1 text-green-600" />
                      )}
                    </div>
                    <div
                      className={`p-2 rounded ${
                        question.correctAnswer === "D"
                          ? "bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-800"
                          : "bg-muted/50"
                      }`}
                    >
                      <span className="font-semibold">D:</span>{" "}
                      {question.optionD}
                      {question.correctAnswer === "D" && (
                        <Check className="inline h-4 w-4 ml-1 text-green-600" />
                      )}
                    </div>
                  </div>
                  {question.explanation && (
                    <div className="text-sm text-muted-foreground mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="font-semibold">Explanation:</span>{" "}
                      {question.explanation}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
