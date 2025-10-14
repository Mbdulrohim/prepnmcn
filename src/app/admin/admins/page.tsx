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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  UserPlus,
  MoreHorizontal,
  Mail,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  superAdmin: string;
}

export default function AdminsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("admin");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "super_admin"
    ) {
      router.push("/admin");
    } else if (status === "authenticated") {
      fetchAdmins();
    }
  }, [session, status, router]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/admins");
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
        calculateStats(data);
      } else {
        toast.error("Failed to fetch admins.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching admins.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (adminData: Admin[]) => {
    const stats = {
      totalAdmins: adminData.length,
      activeAdmins: adminData.filter((a) => a.isActive).length,
      superAdmin: "doyextech@gmail.com",
    };
    setStats(stats);
  };

  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          role: newAdminRole,
        }),
      });

      if (response.ok) {
        toast.success("New admin added successfully.");
        setNewAdminEmail("");
        setNewAdminRole("admin");
        setIsAddDialogOpen(false);
        fetchAdmins(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add new admin.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminAction = async (
    action: string,
    adminId: string,
    adminEmail: string
  ) => {
    if (action === "remove" && adminEmail === "doyextech@gmail.com") {
      toast.error("Cannot remove the super admin.");
      return;
    }

    if (action === "demote") {
      try {
        const response = await fetch(`/api/admin/users/${adminId}/demote`, {
          method: "POST",
        });

        if (response.ok) {
          toast.success(`Admin ${adminEmail} has been demoted to user.`);
          fetchAdmins(); // Refresh the list
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to demote admin.");
        }
      } catch (error) {
        toast.error("An error occurred while demoting the admin.");
      }
      return;
    }

    // Placeholder for other admin actions
    toast.info(
      `${action} functionality would be implemented here for ${adminEmail}`
    );
  };

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-40 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admins Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
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

  if (session?.user?.email !== "doyextech@gmail.com") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-muted-foreground">
              Access Denied
            </h1>
            <p className="text-muted-foreground mt-2">
              You don't have permission to access admin management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Admin Management</h1>
        <p className="text-muted-foreground">
          Manage system administrators and their access privileges
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {stats?.totalAdmins || 0} Total Admins
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {stats?.activeAdmins || 0} Active
          </Badge>
          <Badge variant="destructive" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Super Admin: {stats?.superAdmin}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Total Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdmins}</div>
              <p className="text-xs text-muted-foreground">System admins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAdmins}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Super Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">
                {stats.superAdmin}
              </div>
              <p className="text-xs text-muted-foreground">
                Full system access
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Control
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Administrator</DialogTitle>
                  <DialogDescription>
                    Grant admin privileges to a user by entering their email
                    address. They will have full access to the admin dashboard.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">User Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="user@example.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-role">Role</Label>
                    <Select
                      value={newAdminRole}
                      onValueChange={setNewAdminRole}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Admin"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Admins Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No administrators found
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {admin.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {admin.email}
                            </div>
                          </div>
                          {admin.email === "doyextech@gmail.com" && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={admin.isActive ? "default" : "secondary"}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            admin.role === "super_admin"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {admin.role === "super_admin" ? (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Super Admin
                            </>
                          ) : (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.institution || "Not specified"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleDateString()
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
                                handleAdminAction("view", admin.id, admin.email)
                              }
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAdminAction(
                                  "permissions",
                                  admin.id,
                                  admin.email
                                )
                              }
                            >
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAdminAction(
                                  admin.isActive ? "deactivate" : "activate",
                                  admin.id,
                                  admin.email
                                )
                              }
                              className={
                                admin.isActive
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }
                            >
                              {admin.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            {admin.email !== "doyextech@gmail.com" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAdminAction(
                                    "demote",
                                    admin.id,
                                    admin.email
                                  )
                                }
                                className="text-orange-600"
                              >
                                Demote to User
                              </DropdownMenuItem>
                            )}
                            {admin.email !== "doyextech@gmail.com" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAdminAction(
                                    "remove",
                                    admin.id,
                                    admin.email
                                  )
                                }
                                className="text-red-600"
                              >
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Security Notice
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Admin privileges grant full access to the system. Only add
                  trusted users and regularly review admin access. The super
                  admin account cannot be removed for system security.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
