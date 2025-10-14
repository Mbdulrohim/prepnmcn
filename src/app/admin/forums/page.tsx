"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";

interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  activeUsers: number;
  totalUsers: number;
}

interface ForumTopic {
  id: number;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  createdAt: string;
}

interface ExtendedUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface ExtendedSession {
  user?: ExtendedUser;
}

export default function AdminForumsPage() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const router = useRouter();
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes(session?.user?.role || "")
    ) {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchForumStats();
      fetchForumTopics();
    }
  }, [session, status, router]);

  const fetchForumStats = async () => {
    try {
      // For now, return mock data since forums aren't implemented yet
      const mockStats: ForumStats = {
        totalTopics: 0,
        totalPosts: 0,
        activeUsers: 0,
        totalUsers: 0,
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching forum stats:", error);
    }
  };

  const fetchForumTopics = async () => {
    try {
      // For now, return empty array since forums aren't implemented yet
      setTopics([]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Forums</h1>
            <p className="text-muted-foreground">
              Manage discussion forums and community engagement
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forums</h1>
          <p className="text-muted-foreground">
            Manage discussion forums and community engagement
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Forum
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTopics || 0}</div>
            <p className="text-xs text-muted-foreground">
              Discussion topics created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">Messages posted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Users active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered forum users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forum Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No forum topics yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Forums feature is coming soon. Users will be able to create
                discussion topics and engage with the community.
              </p>
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Create First Topic
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Topics would be listed here */}
              <p className="text-muted-foreground text-center py-8">
                Forum topics will appear here once implemented
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
