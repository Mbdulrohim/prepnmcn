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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Shield,
  Key,
  Search,
  UserPlus,
  Crown,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  permissions?: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const PERMISSIONS: Permission[] = [
  // User Management
  {
    id: "users.view",
    name: "View Users",
    description: "Can view user list and details",
    category: "Users",
  },
  {
    id: "users.create",
    name: "Create Users",
    description: "Can create new user accounts",
    category: "Users",
  },
  {
    id: "users.edit",
    name: "Edit Users",
    description: "Can edit user information",
    category: "Users",
  },
  {
    id: "users.delete",
    name: "Delete Users",
    description: "Can delete user accounts",
    category: "Users",
  },

  // Admin Management
  {
    id: "admins.view",
    name: "View Admins",
    description: "Can view admin list",
    category: "Admins",
  },
  {
    id: "admins.promote",
    name: "Promote Users",
    description: "Can promote users to admin",
    category: "Admins",
  },
  {
    id: "admins.demote",
    name: "Demote Admins",
    description: "Can demote admins to users",
    category: "Admins",
  },

  // Content Management
  {
    id: "institutions.manage",
    name: "Manage Institutions",
    description: "Can add/edit/delete institutions",
    category: "Content",
  },
  {
    id: "resources.manage",
    name: "Manage Resources",
    description: "Can add/edit/delete resources",
    category: "Content",
  },

  // Financial
  {
    id: "payments.view",
    name: "View Payments",
    description: "Can view payment records",
    category: "Financial",
  },
  {
    id: "payments.manage",
    name: "Manage Payments",
    description: "Can manage payment settings",
    category: "Financial",
  },

  // System
  {
    id: "ai.manage",
    name: "Manage AI Engine",
    description: "Can configure AI settings",
    category: "System",
  },
  {
    id: "seo.manage",
    name: "Manage SEO",
    description: "Can manage SEO settings",
    category: "System",
  },
  {
    id: "settings.manage",
    name: "Manage Settings",
    description: "Can access system settings",
    category: "System",
  },
];

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [isSuperPromoteDialogOpen, setIsSuperPromoteDialogOpen] =
    useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any)?.role !== "super_admin") {
      router.push("/admin");
      return;
    }
    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const promoteToAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("User promoted to admin successfully");
        fetchUsers();
        setIsPromoteDialogOpen(false);
      } else {
        toast.error("Failed to promote user");
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user");
    }
  };

  const promoteToSuperAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote-super`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("User promoted to super admin successfully");
        fetchUsers();
        setIsPromoteDialogOpen(false);
      } else {
        toast.error("Failed to promote user to super admin");
      }
    } catch (error) {
      console.error("Error promoting user to super admin:", error);
      toast.error("Failed to promote user to super admin");
    }
  };

  const demoteFromAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/demote`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Admin demoted to user successfully");
        fetchUsers();
      } else {
        toast.error("Failed to demote admin");
      }
    } catch (error) {
      console.error("Error demoting admin:", error);
      toast.error("Failed to demote admin");
    }
  };

  const updateUserPermissions = async (
    userId: number,
    permissions: string[]
  ) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        toast.success("Permissions updated successfully");
        fetchUsers();
        setIsPermissionsDialogOpen(false);
      } else {
        toast.error("Failed to update permissions");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="h-10 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
          <div className="flex justify-center gap-2 mt-4">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">Admin Settings</h1>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Settings className="h-3 w-3" />
            System Configuration
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Access Control
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Role Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* User Management Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Super Admins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.role === "super_admin").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.role === "admin").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Regular Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.role === "user").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Search Users</Label>
                  <Input
                    id="search"
                    placeholder="Name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Filter by Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                User Management ({filteredUsers.length} of {users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {user.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === "user" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsPromoteDialogOpen(true);
                                }}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Admin
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsSuperPromoteDialogOpen(true);
                                }}
                              >
                                <Crown className="h-4 w-4 mr-1" />
                                Super
                              </Button>
                            </div>
                          )}
                          {user.role === "admin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => demoteFromAdmin(user.id)}
                            >
                              Demote
                            </Button>
                          )}
                          {user.permissions && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsPermissionsDialogOpen(true);
                              }}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Permissions
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permission Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {["Users", "Admins", "Content", "Financial", "System"].map(
                  (category) => (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {
                            PERMISSIONS.filter((p) => p.category === category)
                              .length
                          }{" "}
                          permissions
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Crown className="h-4 w-4 text-red-500" />
                        Super Admin
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Full system access with all permissions
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Admin
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Administrative access with limited permissions
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        User
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Standard user access
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Promote Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote User to Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to promote{" "}
              <strong>{selectedUser?.name}</strong> to admin?
            </p>
            <p className="text-sm text-muted-foreground">
              This will give them access to administrative functions and
              settings.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPromoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedUser && promoteToAdmin(selectedUser.id)}
              >
                Promote to Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Super Admin Promote Dialog */}
      <Dialog
        open={isSuperPromoteDialogOpen}
        onOpenChange={setIsSuperPromoteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote User to Super Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <Crown className="h-5 w-5" />
                <strong>Warning: Super Admin Privileges</strong>
              </div>
              <p className="text-sm text-red-700 mt-2">
                Super admin has full system access and cannot be demoted. This
                action should only be given to trusted personnel.
              </p>
            </div>
            <p>
              Are you sure you want to promote{" "}
              <strong>{selectedUser?.name}</strong> to super admin?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSuperPromoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedUser && promoteToSuperAdmin(selectedUser.id)
                }
              >
                <Crown className="h-4 w-4 mr-2" />
                Promote to Super Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the permissions to grant to this user.
            </p>
            <div className="max-h-96 overflow-y-auto space-y-4">
              {["Users", "Admins", "Content", "Financial", "System"].map(
                (category) => (
                  <div key={category}>
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="grid grid-cols-1 gap-2 ml-4">
                      {PERMISSIONS.filter((p) => p.category === category).map(
                        (permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={permission.id}
                              defaultChecked={selectedUser?.permissions?.includes(
                                permission.id
                              )}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={permission.id} className="text-sm">
                              <strong>{permission.name}</strong>
                              <br />
                              <span className="text-muted-foreground">
                                {permission.description}
                              </span>
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPermissionsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Get selected permissions
                  const checkboxes = document.querySelectorAll(
                    'input[type="checkbox"]:checked'
                  );
                  const permissions = Array.from(checkboxes).map(
                    (cb) => (cb as HTMLInputElement).id
                  );
                  selectedUser &&
                    updateUserPermissions(selectedUser.id, permissions);
                }}
              >
                Update Permissions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
