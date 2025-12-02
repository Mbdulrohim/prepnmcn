"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileText,
  Building,
  MessageSquare,
  Mail,
  ExternalLink,
  Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamManagement } from "./ExamManagement";
import { toast } from "sonner";

interface Stats {
  userCount: number;
  resourceCount: number;
  institutionCount: number;
  feedbackCount: number;
  emailCodeCount: number;
}

interface EngagementAnalytics {
  totalUsers: number;
  activeUsers: number;
  averageCompletionRate: number;
  topPerformingInstitutions: Array<{
    name: string;
    completionRate: number;
    totalUsers: number;
  }>;
  moduleCompletionRates: Array<{
    moduleName: string;
    completionRate: number;
    totalAttempts: number;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  institution: string;
  createdAt: string;
}

interface Resource {
  id: number;
  name: string;
  isFree: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [engagementAnalytics, setEngagementAnalytics] =
    useState<EngagementAnalytics | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedResources, setSelectedResources] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/admin/resources");
      const data = await res.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEngagementAnalytics = useCallback(async () => {
    try {
      // For now, return empty data since the actual analytics system isn't implemented yet
      // This will be replaced with real data when study planner and modules are implemented
      const mockAnalytics: EngagementAnalytics = {
        totalUsers: users.length,
        activeUsers: 0,
        averageCompletionRate: 0,
        topPerformingInstitutions: [],
        moduleCompletionRates: [],
      };
      setEngagementAnalytics(mockAnalytics);
    } catch (error) {
      console.error("Error fetching engagement analytics:", error);
    }
  }, [users]);

  const toggleUserSelection = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
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

  const handleDownloadStudentBios = async () => {
    try {
      const response = await fetch("/api/admin/users/export", {
        method: "GET",
      });

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `student-bios-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Download started");
      } else {
        let errorMessage = "Failed to download student bios";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Failed to download student bios (${response.status})`;
        }
        console.error("Download failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error downloading student bios:", error);
      toast.error("Failed to download student bios");
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any)?.role)
    ) {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchStats();
      fetchUsers();
      fetchResources();
      fetchEngagementAnalytics();
    }
  }, [session, status, router, fetchEngagementAnalytics]);

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />

        {/* Tabs Skeleton */}
        <Skeleton className="h-9 w-full" />

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
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
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.userCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Resources
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.resourceCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Institutions
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.institutionCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Feedback
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.feedbackCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Email Codes
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.emailCodeCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Analytics */}
          {engagementAnalytics && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Engagement Analytics</h2>

              {/* Analytics Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {engagementAnalytics.activeUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        (engagementAnalytics.activeUsers /
                          engagementAnalytics.totalUsers) *
                          100
                      )}
                      % of total users
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Completion Rate
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {engagementAnalytics.averageCompletionRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all modules
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Top Institution
                    </CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold truncate">
                      {engagementAnalytics.topPerformingInstitutions[0]?.name ||
                        "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {engagementAnalytics.topPerformingInstitutions[0]
                        ?.completionRate || 0}
                      % completion rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performing Institutions */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Institutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {engagementAnalytics.topPerformingInstitutions.map(
                      (institution, index) => (
                        <div
                          key={institution.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{institution.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {institution.totalUsers} students
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {institution.completionRate}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              completion
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Module Completion Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Module Completion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {engagementAnalytics.moduleCompletionRates.map((module) => (
                      <div key={module.moduleName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {module.moduleName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {module.completionRate}% ({module.totalAttempts}{" "}
                            attempts)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${module.completionRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/institutions")}
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Manage Institutions
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadStudentBios}
                  className="flex items-center gap-2"
                  disabled
                >
                  <Download className="h-4 w-4" />
                  Download Student Bios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      data-state={
                        selectedUsers.has(user.id) ? "selected" : undefined
                      }
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.institution}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Resources Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resources ({resources.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow
                      key={resource.id}
                      data-state={
                        selectedResources.has(resource.id)
                          ? "selected"
                          : undefined
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
                      <TableCell>{resource.name}</TableCell>
                      <TableCell>
                        {resource.isFree ? "Free" : "Premium"}
                      </TableCell>
                      <TableCell>
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <ExamManagement />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Send emails, manage templates, and view email analytics.
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Email Management Coming Soon
                </h3>
                <p className="text-muted-foreground mb-4">
                  This feature will allow you to send bulk emails, manage
                  templates, and track delivery.
                </p>
                <Button variant="outline">Send Email</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
