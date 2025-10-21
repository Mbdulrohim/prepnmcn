"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  FileText,
  BookOpen,
  Package,
  Users,
  Eye,
  Edit,
  Upload,
  File,
} from "lucide-react";
import { toast } from "sonner";

interface ExamCategory {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  pathways: ExamPathway[];
}

interface ExamPathway {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  packages: ExamPackage[];
}

interface ExamPackage {
  id: string;
  name: string;
  description: string;
  packageType: string;
  frequency: string;
  price: number;
  currency: string;
  isActive: boolean;
  exams: Exam[];
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  type: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
}

export function ExamManagement() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchExamStructure();
  }, []);

  const fetchExamStructure = async () => {
    try {
      const response = await fetch("/api/admin/exams");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      } else {
        toast.error("Failed to load exam structure");
      }
    } catch (error) {
      console.error("Error fetching exam structure:", error);
      toast.error("Failed to load exam structure");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "pathways":
        return <Users className="h-4 w-4" />;
      case "research":
        return <BookOpen className="h-4 w-4" />;
      case "olevel_jamb":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPackageTypeColor = (type: string) => {
    switch (type) {
      case "monthly_subscription":
        return "bg-blue-100 text-blue-800";
      case "one_time_payment":
        return "bg-green-100 text-green-800";
      case "installment_2x":
      case "installment_3x":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Exam Structure...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Exam Management</h2>
          <p className="text-muted-foreground">
            Manage exam categories, pathways, packages, and individual exams
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Exam Categories</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first exam category.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategoryExpansion(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(category.type)}
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{category.type}</Badge>
                    <Badge variant="secondary">
                      {category.pathways?.length || 0} pathways
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedCategories.has(category.id) && (
                <CardContent>
                  {category.pathways && category.pathways.length > 0 ? (
                    <div className="space-y-4">
                      {category.pathways.map((pathway) => (
                        <div key={pathway.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{pathway.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {pathway.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{pathway.type}</Badge>
                              <Badge variant="secondary">
                                {pathway.packages?.length || 0} packages
                              </Badge>
                            </div>
                          </div>

                          {pathway.packages && pathway.packages.length > 0 ? (
                            <div className="space-y-3">
                              {pathway.packages.map((pkg) => (
                                <div
                                  key={pkg.id}
                                  className="border-l-4 border-blue-200 pl-4 py-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Package className="h-4 w-4" />
                                        <span className="font-medium">
                                          {pkg.name}
                                        </span>
                                        <Badge
                                          className={getPackageTypeColor(
                                            pkg.packageType
                                          )}
                                        >
                                          {pkg.packageType.replace("_", " ")}
                                        </Badge>
                                        <Badge variant="outline">
                                          {pkg.frequency}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {pkg.description}
                                      </p>
                                      <div className="flex items-center space-x-4 text-sm">
                                        <span className="font-semibold text-green-600">
                                          ₦{pkg.price.toLocaleString()}
                                        </span>
                                        <span>
                                          {pkg.exams?.length || 0} exams
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {pkg.exams && pkg.exams.length > 0 && (
                                    <div className="mt-3">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Exam Title</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Marks</TableHead>
                                            <TableHead>Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {pkg.exams.map((exam) => (
                                            <TableRow key={exam.id}>
                                              <TableCell className="font-medium">
                                                {exam.title}
                                              </TableCell>
                                              <TableCell>
                                                {exam.subject}
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant="outline">
                                                  {exam.type}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>
                                                {exam.duration} min
                                              </TableCell>
                                              <TableCell>
                                                {exam.passingMarks}/
                                                {exam.totalMarks}
                                              </TableCell>
                                              <TableCell>
                                                <div className="flex space-x-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                  >
                                                    <Edit className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              No packages in this pathway yet.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No pathways in this category yet.
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Question Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Question File Upload</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload PDF, DOCX, or TXT files containing questions. The system will
            automatically parse and extract questions.
          </p>
        </CardHeader>
        <CardContent>
          <QuestionUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Mock exam data - in real app, fetch from API
  const mockExams = [
    { id: "exam-1", title: "RN Pathway - Weekly Assessment 1" },
    { id: "exam-2", title: "O'Level Mathematics - Mock Exam" },
    { id: "exam-3", title: "JAMB Chemistry - Practice Test" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Only PDF, DOCX, and TXT files are allowed."
        );
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedExamId) {
      toast.error("Please select both a file and an exam.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("examId", selectedExamId);

      const response = await fetch("/api/admin/questions/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result.data);
        toast.success(
          `Successfully uploaded and parsed ${result.data.questionsParsed} questions!`
        );
        setSelectedFile(null);
        setSelectedExamId("");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Exam</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose an exam...</option>
            {mockExams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Question File
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supported formats: PDF, DOCX, TXT (max 10MB)
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="p-4 bg-blue-50 rounded-md">
          <div className="flex items-center space-x-2">
            <File className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || !selectedExamId || isUploading}
        className="w-full md:w-auto"
      >
        {isUploading ? "Uploading..." : "Upload & Parse Questions"}
      </Button>

      {uploadResult && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">
            Upload Successful!
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>📄 Questions parsed: {uploadResult.questionsParsed}</p>
            <p>📁 File stored as: {uploadResult.fileUrl}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">
                Preview extracted text
              </summary>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                {uploadResult.extractedText}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
