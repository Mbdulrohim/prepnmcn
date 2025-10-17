"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Bell,
  Plus,
  X,
  Save,
  User,
  Settings,
  CheckCircle,
  Target,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  academicLevel: "100" | "200" | "300" | "400" | "500" | "600" | null;
  selectedCourses:
    | {
        courseCode: string;
        courseName: string;
        creditHours: number;
        semester: "first" | "second";
      }[]
    | null;
  studyPreferences: {
    dailyStudyHours: number;
    preferredStudyTimes: string[];
    learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
    breakFrequency: number;
  } | null;
  notificationSettings: {
    studyReminders: boolean;
    assessmentDeadlines: boolean;
    motivationalMessages: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    reminderFrequency: "daily" | "weekly" | "custom";
  } | null;
}

export default function AcademicProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Form state
  const [academicLevel, setAcademicLevel] = useState<string>("");
  const [courses, setCourses] = useState<
    {
      courseCode: string;
      courseName: string;
      creditHours: number;
      semester: "first" | "second";
    }[]
  >([]);
  const [studyPreferences, setStudyPreferences] = useState({
    dailyStudyHours: 2,
    preferredStudyTimes: [] as string[],
    learningStyle: "visual" as
      | "visual"
      | "auditory"
      | "kinesthetic"
      | "reading",
    breakFrequency: 25,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    studyReminders: true,
    assessmentDeadlines: true,
    motivationalMessages: true,
    emailNotifications: true,
    pushNotifications: false,
    reminderFrequency: "daily" as "daily" | "weekly" | "custom",
  });

  // New course form
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    courseName: "",
    creditHours: 1,
    semester: "first" as "first" | "second",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setUser(userData);

        // Populate form with existing data
        if (userData.academicLevel) setAcademicLevel(userData.academicLevel);
        if (userData.selectedCourses) setCourses(userData.selectedCourses);
        if (userData.studyPreferences)
          setStudyPreferences(userData.studyPreferences);
        if (userData.notificationSettings)
          setNotificationSettings(userData.notificationSettings);
      } else {
        router.push("/auth/signin");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          academicLevel,
          selectedCourses: courses,
          studyPreferences,
          notificationSettings,
        }),
      });

      if (response.ok) {
        toast.success("Academic profile updated successfully!");
        await fetchUserProfile(); // Refresh data
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setSaving(false);
    }
  };

  const addCourse = async () => {
    if (newCourse.courseCode && newCourse.courseName) {
      const updatedCourses = [...courses, { ...newCourse }];
      setCourses(updatedCourses);

      // Immediately save to database
      try {
        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            academicLevel,
            selectedCourses: updatedCourses,
            studyPreferences,
            notificationSettings,
          }),
        });

        if (response.ok) {
          toast.success("Course added successfully!");
          await fetchUserProfile(); // Refresh data to ensure sync
        } else {
          // Revert local state if save failed
          setCourses(courses);
          toast.error("Failed to save course");
        }
      } catch (error) {
        // Revert local state if save failed
        setCourses(courses);
        console.error("Error saving course:", error);
        toast.error("An error occurred while saving the course");
      }

      // Reset form
      setNewCourse({
        courseCode: "",
        courseName: "",
        creditHours: 1,
        semester: "first",
      });
    }
  };

  const removeCourse = async (index: number) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    const courseToRemove = courses[index];

    // Immediately update local state for responsive UI
    setCourses(updatedCourses);

    // Save to database
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          academicLevel,
          selectedCourses: updatedCourses,
          studyPreferences,
          notificationSettings,
        }),
      });

      if (response.ok) {
        toast.success(
          `Course ${courseToRemove.courseCode} removed successfully!`
        );
        await fetchUserProfile(); // Refresh data to ensure sync
      } else {
        // Revert local state if save failed
        setCourses(courses);
        toast.error("Failed to remove course");
      }
    } catch (error) {
      // Revert local state if save failed
      setCourses(courses);
      console.error("Error removing course:", error);
      toast.error("An error occurred while removing the course");
    }
  };

  const toggleStudyTime = (time: string) => {
    setStudyPreferences((prev) => ({
      ...prev,
      preferredStudyTimes: prev.preferredStudyTimes.includes(time)
        ? prev.preferredStudyTimes.filter((t) => t !== time)
        : [...prev.preferredStudyTimes, time],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading your academic profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Academic Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Set up your academic information for personalized study planning
          </p>
        </div>

        <div className="space-y-6">
          {/* Current Profile Summary */}
          {!loading && user && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Your Current Academic Profile
                </CardTitle>
                <CardDescription>
                  Here's a summary of your saved academic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Academic Level
                    </Label>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {user.academicLevel
                          ? `${user.academicLevel} Level`
                          : "Not set"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Enrolled Courses
                    </Label>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {user.selectedCourses?.length || 0} courses
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Daily Study Hours
                    </Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {user.studyPreferences?.dailyStudyHours || 0} hours
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Learning Style
                    </Label>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      <span className="font-medium capitalize">
                        {user.studyPreferences?.learningStyle || "Not set"}
                      </span>
                    </div>
                  </div>
                </div>

                {user.selectedCourses && user.selectedCourses.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Your Courses
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Semester</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.selectedCourses.map((course, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono font-medium">
                                {course.courseCode}
                              </TableCell>
                              <TableCell className="font-medium">
                                {course.courseName}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {course.creditHours} credit
                                  {course.creditHours !== 1 ? "s" : ""}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    course.semester === "first"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {course.semester === "first" ? "1st" : "2nd"}{" "}
                                  Semester
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Academic Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Academic Level
              </CardTitle>
              <CardDescription>
                Select your current academic level to get relevant content and
                recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="academic-level">Current Level</Label>
                <Select value={academicLevel} onValueChange={setAcademicLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level (Freshman)</SelectItem>
                    <SelectItem value="200">200 Level (Sophomore)</SelectItem>
                    <SelectItem value="300">300 Level (Junior)</SelectItem>
                    <SelectItem value="400">400 Level (Senior)</SelectItem>
                    <SelectItem value="500">500 Level (Graduate)</SelectItem>
                    <SelectItem value="600">
                      600 Level (Advanced Graduate)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Current Courses
              </CardTitle>
              <CardDescription>
                Add the courses you're currently taking for personalized study
                planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add Course Form */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 p-6 border rounded-lg bg-muted/50">
                  <div className="xl:col-span-3">
                    <Label htmlFor="course-code">Course Code</Label>
                    <Input
                      id="course-code"
                      placeholder="e.g., MATH 101"
                      value={newCourse.courseCode}
                      onChange={(e) =>
                        setNewCourse((prev) => ({
                          ...prev,
                          courseCode: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="xl:col-span-4">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input
                      id="course-name"
                      placeholder="e.g., Calculus 1"
                      value={newCourse.courseName}
                      onChange={(e) =>
                        setNewCourse((prev) => ({
                          ...prev,
                          courseName: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="xl:col-span-2">
                    <Label htmlFor="credit-hours">Credits</Label>
                    <Input
                      id="credit-hours"
                      type="number"
                      min="1"
                      max="6"
                      value={newCourse.creditHours}
                      onChange={(e) =>
                        setNewCourse((prev) => ({
                          ...prev,
                          creditHours: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="xl:col-span-3">
                    <Label>Semester</Label>
                    <Select
                      value={newCourse.semester}
                      onValueChange={(value: "first" | "second") =>
                        setNewCourse((prev) => ({ ...prev, semester: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first">First Semester</SelectItem>
                        <SelectItem value="second">Second Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="xl:col-span-12 flex justify-end">
                    <Button onClick={addCourse} size="default" className="px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </div>
                </div>

                {/* Current Courses List */}
                {courses.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">
                      Enrolled Courses
                    </Label>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courses.map((course, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono font-medium">
                                {course.courseCode}
                              </TableCell>
                              <TableCell className="font-medium">
                                {course.courseName}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {course.creditHours} credit
                                  {course.creditHours !== 1 ? "s" : ""}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    course.semester === "first"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {course.semester === "first" ? "1st" : "2nd"}{" "}
                                  Semester
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCourse(index)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Study Preferences
              </CardTitle>
              <CardDescription>
                Tell us about your study habits for better recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="daily-hours">Daily Study Hours</Label>
                    <Input
                      id="daily-hours"
                      type="number"
                      min="1"
                      max="12"
                      value={studyPreferences.dailyStudyHours}
                      onChange={(e) =>
                        setStudyPreferences((prev) => ({
                          ...prev,
                          dailyStudyHours: parseInt(e.target.value) || 2,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="break-frequency">
                      Break Frequency (minutes)
                    </Label>
                    <Input
                      id="break-frequency"
                      type="number"
                      min="5"
                      max="60"
                      value={studyPreferences.breakFrequency}
                      onChange={(e) =>
                        setStudyPreferences((prev) => ({
                          ...prev,
                          breakFrequency: parseInt(e.target.value) || 25,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Learning Style</Label>
                    <Select
                      value={studyPreferences.learningStyle}
                      onValueChange={(
                        value: "visual" | "auditory" | "kinesthetic" | "reading"
                      ) =>
                        setStudyPreferences((prev) => ({
                          ...prev,
                          learningStyle: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">
                          Visual (diagrams, charts)
                        </SelectItem>
                        <SelectItem value="auditory">
                          Auditory (lectures, discussions)
                        </SelectItem>
                        <SelectItem value="kinesthetic">
                          Kinesthetic (hands-on, practical)
                        </SelectItem>
                        <SelectItem value="reading">
                          Reading/Writing (books, notes)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Preferred Study Times</Label>
                    <div className="space-y-2">
                      {["morning", "afternoon", "evening", "night"].map(
                        (time) => (
                          <div
                            key={time}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={time}
                              checked={studyPreferences.preferredStudyTimes.includes(
                                time
                              )}
                              onCheckedChange={() => toggleStudyTime(time)}
                            />
                            <Label htmlFor={time} className="capitalize">
                              {time}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to receive study reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Reminder Types</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="study-reminders"
                        checked={notificationSettings.studyReminders}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            studyReminders: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="study-reminders">
                        Study Session Reminders
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assessment-deadlines"
                        checked={notificationSettings.assessmentDeadlines}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            assessmentDeadlines: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="assessment-deadlines">
                        Assessment Deadlines
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="motivational-messages"
                        checked={notificationSettings.motivationalMessages}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            motivationalMessages: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="motivational-messages">
                        Motivational Messages
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Delivery Methods</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email-notifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            emailNotifications: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="push-notifications"
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            pushNotifications: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="push-notifications">
                        Push Notifications
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label>Reminder Frequency</Label>
                    <Select
                      value={notificationSettings.reminderFrequency}
                      onValueChange={(value: "daily" | "weekly" | "custom") =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          reminderFrequency: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              size="lg"
              className="px-8"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Academic Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
