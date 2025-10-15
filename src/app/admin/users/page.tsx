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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Crown,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalPoints: number;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any)?.role)
    ) {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchUsers();
    }
  }, [session, status, router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        calculateStats(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (userData: User[]) => {
    const stats = {
      totalUsers: userData.length,
      activeUsers: userData.filter((u) => u.isActive).length,
      adminUsers: userData.filter((u) => u.role === "admin" || u.role === "super_admin").length,
      totalPoints: userData.reduce((sum, u) => sum + u.points, 0),
    };
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== "all") {
      const isActive = selectedStatus === "active";
      filtered = filtered.filter((user) => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
  };

  const handleUserAction = async (action: string, userId: string) => {
    if (action === "Promote to Admin") {
      try {
        const response = await fetch(`/api/admin/users/${userId}/promote-admin`, {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message);
          if (data.requiresSignOut) {
            toast.info("The user needs to sign out and sign back in to access new permissions", {
              duration: 10000,
            });
          }
          // Refresh the users list
          fetchUsers();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to promote user");
        }
      } catch (error) {
        console.error("Failed to promote user:", error);
        toast.error("Failed to promote user");
      }
    } else if (action === "Promote to Super Admin") {
      try {
        const response = await fetch(`/api/admin/users/${userId}/promote-super`, {
          method: "POST",
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message);
          if (data.requiresSignOut) {
            toast.info("The user needs to sign out and sign back in to access new permissions", {
              duration: 10000,
            });
          }
          // Refresh the users list
          fetchUsers();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to promote user");
        }
      } catch (error) {
        console.error("Failed to promote user:", error);
        toast.error("Failed to promote user");
      }
    } else {
      // Placeholder for other actions
      toast.info(`${action} functionality would be implemented here`);
    }
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
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8" />
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
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">User Management</h1>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {stats?.totalUsers || 0} Total Users
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <UserCheck className="h-3 w-3" />
            {stats?.activeUsers || 0} Active
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            {stats?.adminUsers || 0} Admins
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
              <p className="text-xs text-muted-foreground">Admin privileges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPoints.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Study points earned
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {users.length === 0
                        ? "No users found"
                        : "No users match your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" || user.role === "super_admin"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {user.role === "super_admin" ? "Super Admin" : user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.institution || "Not set"}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {user.points.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction("View Profile", user.id)
                              }
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction("Edit User", user.id)
                              }
                            >
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction("Reset Password", user.id)
                              }
                            >
                              Reset Password
                            </DropdownMenuItem>
                            {user.role !== "admin" && user.role !== "super_admin" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUserAction("Promote to Admin", user.id)
                                }
                                className="text-blue-600"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            {user.role !== "super_admin" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUserAction("Promote to Super Admin", user.id)
                                }
                                className="text-purple-600"
                              >
                                <Crown className="mr-2 h-4 w-4" />
                                Promote to Super Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  user.isActive ? "Deactivate" : "Activate",
                                  user.id
                                )
                              }
                              className={
                                user.isActive
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction("Delete User", user.id)
                              }
                              className="text-red-600"
                            >
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
            {filteredUsers.length !== users.length && (
              <Button
                variant="link"
                onClick={clearFilters}
                className="p-0 h-auto"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
