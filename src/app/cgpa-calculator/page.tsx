"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Plus,
  Trash2,
  BookOpen,
  TrendingUp,
  Award,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
  grade: string;
  creditHours: number;
  gradePoint: number;
}

const GRADE_SCALES = {
  "Nigerian Federal Universities (5.0)": {
    A: 5.0,
    AB: 4.5,
    B: 4.0,
    BC: 3.5,
    C: 3.0,
    CD: 2.5,
    D: 2.0,
    E: 1.0,
    F: 0.0,
  },
  "Nigerian State Universities (5.0)": {
    A: 5.0,
    AB: 4.5,
    B: 4.0,
    BC: 3.5,
    C: 3.0,
    CD: 2.5,
    D: 2.0,
    E: 1.0,
    F: 0.0,
  },
  "Nigerian Private Universities (5.0)": {
    A: 5.0,
    AB: 4.5,
    B: 4.0,
    BC: 3.5,
    C: 3.0,
    CD: 2.5,
    D: 2.0,
    E: 1.0,
    F: 0.0,
  },
  "International (4.0)": {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
  },
};

export default function CGPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      name: "",
      grade: "",
      creditHours: 3,
      gradePoint: 0,
    },
  ]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [totalGradePoints, setTotalGradePoints] = useState<number>(0);
  const [selectedScale, setSelectedScale] = useState<string>(
    "Nigerian Federal Universities (5.0)"
  );
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [manualTotalCredits, setManualTotalCredits] = useState<number>(0);
  const [manualTotalPoints, setManualTotalPoints] = useState<number>(0);

  // Calculate CGPA whenever courses or scale changes
  useEffect(() => {
    if (!manualMode) {
      calculateCGPA();
    }
  }, [courses, selectedScale, manualMode]);

  // Calculate manual CGPA
  useEffect(() => {
    if (manualMode && manualTotalCredits > 0) {
      const calculatedCGPA = manualTotalPoints / manualTotalCredits;
      setCgpa(Number(calculatedCGPA.toFixed(2)));
      setTotalCredits(manualTotalCredits);
      setTotalGradePoints(Number(manualTotalPoints.toFixed(2)));
    }
  }, [manualTotalCredits, manualTotalPoints, manualMode]);

  const calculateCGPA = () => {
    const currentScale =
      GRADE_SCALES[selectedScale as keyof typeof GRADE_SCALES];
    let totalGradePointsValue = 0;
    let totalCreditHours = 0;

    courses.forEach((course) => {
      if (course.grade && course.creditHours > 0) {
        const gradePoint =
          currentScale[course.grade as keyof typeof currentScale] || 0;
        totalGradePointsValue += gradePoint * course.creditHours;
        totalCreditHours += course.creditHours;
      }
    });

    const calculatedCGPA =
      totalCreditHours > 0 ? totalGradePointsValue / totalCreditHours : 0;

    setCgpa(Number(calculatedCGPA.toFixed(2)));
    setTotalCredits(totalCreditHours);
    setTotalGradePoints(Number(totalGradePointsValue.toFixed(2)));
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: "",
      grade: "",
      creditHours: 3,
      gradePoint: 0,
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id));
    } else {
      toast.error("You must have at least one course");
    }
  };

  const updateCourse = (
    id: string,
    field: keyof Course,
    value: string | number
  ) => {
    setCourses(
      courses.map((course) => {
        if (course.id === id) {
          const updatedCourse = { ...course, [field]: value };

          // Update grade point when grade changes
          if (field === "grade") {
            const currentScale =
              GRADE_SCALES[selectedScale as keyof typeof GRADE_SCALES];
            updatedCourse.gradePoint =
              currentScale[value as keyof typeof currentScale] || 0;
          }

          return updatedCourse;
        }
        return course;
      })
    );
  };

  const resetCalculator = () => {
    setCourses([
      {
        id: "1",
        name: "",
        grade: "",
        creditHours: 3,
        gradePoint: 0,
      },
    ]);
    setCgpa(0);
    setTotalCredits(0);
    setTotalGradePoints(0);
    toast.success("Calculator reset");
  };

  const getCGPAColor = (cgpa: number) => {
    if (cgpa >= 3.7) return "text-green-600";
    if (cgpa >= 3.0) return "text-blue-600";
    if (cgpa >= 2.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getCGPAStatus = (cgpa: number) => {
    if (cgpa >= 3.7) return "Excellent";
    if (cgpa >= 3.0) return "Good";
    if (cgpa >= 2.0) return "Satisfactory";
    return "Needs Improvement";
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">CGPA Calculator</h1>
          <p className="text-muted-foreground">
            Calculate your Cumulative Grade Point Average
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calculator Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Information
              </CardTitle>
              <CardDescription>
                Add your courses with grades and credit hours to calculate your
                CGPA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grading Scale Selector */}
              <div className="space-y-2">
                <Label htmlFor="grading-scale">Grading Scale</Label>
                <Select value={selectedScale} onValueChange={setSelectedScale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grading scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(GRADE_SCALES).map((scale) => (
                      <SelectItem key={scale} value={scale}>
                        {scale}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manual-mode"
                  checked={manualMode}
                  onChange={(e) => setManualMode(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="manual-mode" className="text-sm">
                  Manual Input Mode (Enter total credits and grade points
                  directly)
                </Label>
              </div>

              {manualMode ? (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium">Manual CGPA Calculation</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="total-credits">Total Credit Hours</Label>
                      <Input
                        id="total-credits"
                        type="number"
                        min="1"
                        value={manualTotalCredits}
                        onChange={(e) =>
                          setManualTotalCredits(parseInt(e.target.value) || 0)
                        }
                        placeholder="e.g., 120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total-points">Total Grade Points</Label>
                      <Input
                        id="total-points"
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualTotalPoints}
                        onChange={(e) =>
                          setManualTotalPoints(parseFloat(e.target.value) || 0)
                        }
                        placeholder="e.g., 450.5"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your total credit hours and total grade points from
                    your transcript.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course, index) => (
                    <div
                      key={course.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Course {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCourse(course.id)}
                          disabled={courses.length === 1}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`course-name-${course.id}`}>
                            Course Name
                          </Label>
                          <Input
                            id={`course-name-${course.id}`}
                            placeholder="e.g., Mathematics 101"
                            value={course.name}
                            onChange={(e) =>
                              updateCourse(course.id, "name", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`course-grade-${course.id}`}>
                            Grade
                          </Label>
                          <Select
                            value={course.grade}
                            onValueChange={(value) =>
                              updateCourse(course.id, "grade", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(
                                GRADE_SCALES[
                                  selectedScale as keyof typeof GRADE_SCALES
                                ]
                              ).map(([grade, points]) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade} ({points})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`course-credits-${course.id}`}>
                            Credit Hours
                          </Label>
                          <Input
                            id={`course-credits-${course.id}`}
                            type="number"
                            min="1"
                            max="6"
                            value={course.creditHours}
                            onChange={(e) =>
                              updateCourse(
                                course.id,
                                "creditHours",
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      {course.grade && (
                        <div className="text-sm text-muted-foreground">
                          Grade Point: {course.gradePoint} ×{" "}
                          {course.creditHours} credits ={" "}
                          {(course.gradePoint * course.creditHours).toFixed(2)}{" "}
                          points
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button
                      onClick={addCourse}
                      variant="outline"
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                    <Button onClick={resetCalculator} variant="outline">
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                CGPA Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getCGPAColor(cgpa)}`}>
                  {cgpa.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {getCGPAStatus(cgpa)}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Credits
                  </span>
                  <span className="font-medium">{totalCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Grade Points
                  </span>
                  <span className="font-medium">{totalGradePoints}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Grade Scale ({selectedScale})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {Object.entries(
                  GRADE_SCALES[selectedScale as keyof typeof GRADE_SCALES]
                ).map(([grade, points]) => (
                  <div key={grade} className="flex justify-between">
                    <Badge variant="outline">{grade}</Badge>
                    <span>{points}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How it Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>CGPA = Total Grade Points ÷ Total Credit Hours</p>
              <p>Grade Points = Grade Value × Credit Hours</p>
              <p>
                Add all your courses with their grades and credit hours to get
                your cumulative GPA.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
