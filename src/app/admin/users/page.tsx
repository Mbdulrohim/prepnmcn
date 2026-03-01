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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Star,
  BookOpen,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface ProgramInfo {
  id: string;
  code: string;
  name: string;
}

interface UserEnrollmentInfo {
  programId: string;
  programCode: string;
  programName: string;
  status: string;
  expiresAt?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  points: number;
  isActive: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  createdAt: string;
  lastLogin?: string;
  programEnrollments?: UserEnrollmentInfo[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  premiumUsers: number;
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
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("all");
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [managedProgramIds, setManagedProgramIds] = useState<string[]>([]);

  // Premium grant dialog state
  const [premiumDialog, setPremiumDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });
  const [premiumProgramId, setPremiumProgramId] = useState("");
  const [premiumDurationType, setPremiumDurationType] = useState<
    "days" | "months"
  >("days");
  const [premiumDuration, setPremiumDuration] = useState("30");

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
      fetchPrograms();
    }
  }, [session, status, router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedStatus, selectedProgramFilter]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/admin/programs");
      if (response.ok) {
        const data = await response.json();
        if (data.programs) {
          setPrograms(data.programs);
          setManagedProgramIds(data.programs.map((p: any) => p.id));
        }
      }
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

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
      adminUsers: userData.filter(
        (u) => u.role === "admin" || u.role === "super_admin",
      ).length,
      premiumUsers: userData.filter(
        (u) =>
          u.isPremium ||
          (u.programEnrollments?.some((e) => e.status === "active") ?? false),
      ).length,
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
          user.institution.toLowerCase().includes(searchTerm.toLowerCase()),
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

    // Program filter
    if (selectedProgramFilter !== "all") {
      filtered = filtered.filter((user) =>
        user.programEnrollments?.some(
          (e) => e.programId === selectedProgramFilter,
        ),
      );
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSelectedProgramFilter("all");
  };

  const openPremiumDialog = (userId: string, userName: string) => {
    setPremiumDialog({ open: true, userId, userName });
    setPremiumProgramId(programs[0]?.id || "");
    setPremiumDurationType("days");
    setPremiumDuration("30");
  };

  const handleGrantPremium = async () => {
    if (!premiumProgramId || !premiumDuration) {
      toast.error("Please select a program and duration");
      return;
    }

    try {
      const body: any = { programId: premiumProgramId };
      if (premiumDurationType === "days") {
        body.durationDays = parseInt(premiumDuration);
      } else {
        body.durationMonths = parseInt(premiumDuration);
      }

      const response = await fetch(
        `/api/admin/users/${premiumDialog.userId}/promote-premium`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setPremiumDialog({ open: false, userId: "", userName: "" });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to grant premium access");
      }
    } catch (error) {
      toast.error("Failed to grant premium access");
    }
  };

  const handleRevokeProgramPremium = async (
    userId: string,
    programId: string,
    programName: string,
  ) => {
    if (
      !confirm(
        `Are you sure you want to revoke premium access for ${programName}?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/users/${userId}/promote-premium?programId=${programId}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to revoke premium access");
      }
    } catch (error) {
      toast.error("Failed to revoke premium access");
    }
  };

  const handleUserAction = async (
    action: string,
    userId: string,
    durationMonths?: number,
  ) => {
    if (action === "Promote to Admin") {
      try {
        const response = await fetch(
          `/api/admin/users/${userId}/promote-admin`,
          {
            method: "POST",
          },
        );

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message);
          if (data.requiresSignOut) {
            toast.info(
              "The user needs to sign out and sign back in to access new permissions",
              {
                duration: 10000,
              },
            );
          }
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
        const response = await fetch(
          `/api/admin/users/${userId}/promote-super`,
          {
            method: "POST",
          },
        );

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message);
          if (data.requiresSignOut) {
            toast.info(
              "The user needs to sign out and sign back in to access new permissions",
              {
                duration: 10000,
              },
            );
          }
          fetchUsers();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to promote user");
        }
      } catch (error) {
        console.error("Failed to promote user:", error);
        toast.error("Failed to promote user");
      }
    } else if (action === "Deactivate" || action === "Activate") {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: action === "Activate" }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message);
          fetchUsers();
        } else {
          const error = await response.json();
          toast.error(
            error.message || `Failed to ${action.toLowerCase()} user`,
          );
        }
      } catch (error) {
        console.error(`Failed to ${action.toLowerCase()} user:`, error);
        toast.error(`Failed to ${action.toLowerCase()} user`);
      }
    } else if (action === "Delete User") {
      if (
        !confirm(
          "Are you sure you want to delete this user? This action cannot be undone.",
        )
      ) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message);
          fetchUsers();
        } else {
          const error = await response.json();
          toast.error(error.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error("Failed to delete user");
      }
    } else {
      toast.info(`${action} functionality would be implemented here`);
    }
  };

  const getUserProgramBadges = (user: User) => {
    if (!user.programEnrollments || user.programEnrollments.length === 0)
      return null;

    return user.programEnrollments.map((e) => {
      const isActive = e.status === "active";
      const isPending = e.status === "pending_approval";

      return (
        <Badge
          key={e.programId}
          variant={isActive ? "default" : isPending ? "outline" : "secondary"}
          className={
            isActive
              ? "bg-green-100 text-green-800 border-green-300 text-[10px]"
              : isPending
                ? "bg-yellow-50 border-yellow-300 text-yellow-700 text-[10px]"
                : "text-[10px]"
          }
        >
          {e.programCode}
          {isPending && " (pending)"}
          {e.status === "expired" && " (expired)"}
          {e.status === "revoked" && " (revoked)"}
        </Badge>
      );
    });
  };

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-64 mx-auto" />
          <div className="flex justify-center gap-2 mt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
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
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
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
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {stats?.totalUsers || 0} Total Users
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <UserCheck className="h-3 w-3" />
            {stats?.activeUsers || 0} Active
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {stats?.premiumUsers || 0} Premium
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            {stats?.adminUsers || 0} Admins
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Star className="h-4 w-4" />
                Premium Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active subscriptions
              </p>
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

            {/* Program Filter */}
            <div>
              <Label htmlFor="program">Program</Label>
              <Select
                value={selectedProgramFilter}
                onValueChange={setSelectedProgramFilter}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </SelectItem>
                  ))}
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
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
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
                          {user.role === "super_admin"
                            ? "Super Admin"
                            : user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {getUserProgramBadges(user) || (
                            <span className="text-xs text-muted-foreground">
                              No program
                            </span>
                          )}
                        </div>
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
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

                            <DropdownMenuSeparator />

                            {/* Program Premium Access */}
                            <DropdownMenuItem
                              onClick={() =>
                                openPremiumDialog(user.id, user.name)
                              }
                              className="text-green-600"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Grant Program Access
                            </DropdownMenuItem>

                            {/* Revoke per-program access */}
                            {user.programEnrollments?.filter(
                              (e) => e.status === "active",
                            ).length ? (
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="text-orange-600">
                                  <UserX className="mr-2 h-4 w-4" />
                                  Revoke Program Access
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {user.programEnrollments
                                    ?.filter((e) => e.status === "active")
                                    .map((e) => (
                                      <DropdownMenuItem
                                        key={e.programId}
                                        onClick={() =>
                                          handleRevokeProgramPremium(
                                            user.id,
                                            e.programId,
                                            e.programName,
                                          )
                                        }
                                        className="text-orange-600"
                                      >
                                        Revoke {e.programCode}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            ) : null}

                            <DropdownMenuSeparator />

                            {user.role !== "admin" &&
                              user.role !== "super_admin" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(
                                      "Promote to Admin",
                                      user.id,
                                    )
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
                                  handleUserAction(
                                    "Promote to Super Admin",
                                    user.id,
                                  )
                                }
                                className="text-purple-600"
                              >
                                <Crown className="mr-2 h-4 w-4" />
                                Promote to Super Admin
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() =>
                                handleUserAction(
                                  user.isActive ? "Deactivate" : "Activate",
                                  user.id,
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

      {/* Grant Premium Dialog */}
      <Dialog
        open={premiumDialog.open}
        onOpenChange={(open) => setPremiumDialog((prev) => ({ ...prev, open }))}
        modal={false}
      >
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            // Prevent dialog closing when clicking Select portal or anywhere outside.
            // Dialog is only closed via the X button or Cancel button.
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Grant Program Access</DialogTitle>
            <DialogDescription>
              Grant premium access for{" "}
              <span className="font-semibold">{premiumDialog.userName}</span> to
              a specific program.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Program</Label>
              <Select
                value={premiumProgramId}
                onValueChange={setPremiumProgramId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration Type</Label>
              <Select
                value={premiumDurationType}
                onValueChange={(v) =>
                  setPremiumDurationType(v as "days" | "months")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Duration ({premiumDurationType === "days" ? "days" : "months"})
              </Label>
              <div className="flex gap-2 flex-wrap">
                {premiumDurationType === "days"
                  ? [30, 40, 50, 60, 90, 120, 180, 365].map((d) => (
                      <Button
                        key={d}
                        variant={
                          premiumDuration === String(d) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPremiumDuration(String(d))}
                      >
                        {d}d
                      </Button>
                    ))
                  : [1, 2, 3, 6, 12].map((m) => (
                      <Button
                        key={m}
                        variant={
                          premiumDuration === String(m) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setPremiumDuration(String(m))}
                      >
                        {m}mo
                      </Button>
                    ))}
              </div>
              <Input
                type="number"
                value={premiumDuration}
                onChange={(e) => setPremiumDuration(e.target.value)}
                placeholder={`Custom ${premiumDurationType}`}
                min="1"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setPremiumDialog({ open: false, userId: "", userName: "" })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleGrantPremium}>Grant Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
