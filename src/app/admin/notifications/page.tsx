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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Mail,
  Send,
  Users,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "email" | "system";
  title: string;
  message: string;
  recipientEmail?: string;
  recipientId?: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  createdAt: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  createdAt: string;
}

interface UserOption {
  id: string;
  email: string;
  name: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isAutomationDialogOpen, setIsAutomationDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [emailForm, setEmailForm] = useState({
    recipientType: "individual",
    recipientEmail: "",
    recipientId: "",
    subject: "",
    message: "",
  });

  const [automationForm, setAutomationForm] = useState({
    name: "",
    trigger: "user_registration",
    action: "send_welcome_email",
    conditions: {},
    template: {
      subject: "",
      body: "",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchNotifications();
      fetchAutomationRules();
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
      } else {
        toast.error("Failed to fetch notifications.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching notifications.");
    }
  };

  const fetchAutomationRules = async () => {
    try {
      const response = await fetch("/api/admin/notifications?type=automation");
      if (response.ok) {
        const data = await response.json();
        setAutomationRules(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch automation rules:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setUsers(
          data.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) {
      toast.error("Subject and message are required");
      return;
    }

    if (emailForm.recipientType === "individual" && !emailForm.recipientEmail) {
      toast.error("Recipient email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform form data to match API expectations
      let requestBody: any = {
        type: "email",
        subject: emailForm.subject,
        body: emailForm.message,
      };

      if (emailForm.recipientType === "individual") {
        requestBody.recipientEmails = [emailForm.recipientEmail];
      } else {
        // Map recipient types to API expected values
        switch (emailForm.recipientType) {
          case "all_users":
            requestBody.recipientRole = "all";
            break;
          case "students":
            requestBody.recipientRole = "student";
            break;
          case "admins":
            requestBody.recipientRole = "admin";
            break;
          case "super_admins":
            requestBody.recipientRole = "super_admin";
            break;
          case "inactive_users":
            // For now, send to all users (API doesn't support activity filtering yet)
            requestBody.recipientRole = "all";
            break;
          case "all":
          default:
            requestBody.recipientRole = "all";
            break;
        }
      }

      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        toast.success("Email sent successfully!");
        setIsSendDialogOpen(false);
        setEmailForm({
          recipientType: "individual",
          recipientEmail: "",
          recipientId: "",
          subject: "",
          message: "",
        });
        fetchNotifications();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send email");
      }
    } catch (error) {
      toast.error("An error occurred while sending email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createAutomationRule = async () => {
    if (!automationForm.name) {
      toast.error("Rule name is required");
      return;
    }

    if (!automationForm.template.subject) {
      toast.error("Email subject is required");
      return;
    }

    if (!automationForm.template.body) {
      toast.error("Email body is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "automation",
          ...automationForm,
        }),
      });

      if (response.ok) {
        toast.success("Automation rule created!");
        setIsAutomationDialogOpen(false);
        setAutomationForm({
          name: "",
          trigger: "user_registration",
          action: "send_welcome_email",
          conditions: {},
          template: {
            subject: "",
            body: "",
          },
        });
        fetchAutomationRules();
      } else {
        toast.error("Failed to create automation rule");
      }
    } catch (error) {
      toast.error("An error occurred while creating automation rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ruleId, isActive }),
      });

      if (response.ok) {
        toast.success(`Rule ${isActive ? "activated" : "deactivated"}`);
        fetchAutomationRules();
      } else {
        toast.error("Failed to update rule");
      }
    } catch (error) {
      toast.error("An error occurred while updating rule");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Center</h1>
          <p className="text-muted-foreground">
            Send emails and manage automated notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isAutomationDialogOpen}
            onOpenChange={setIsAutomationDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Zap className="mr-2 h-4 w-4" />
                Add Automation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
                <DialogDescription>
                  Set up automated notifications based on user actions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={automationForm.name}
                    onChange={(e) =>
                      setAutomationForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Welcome Email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trigger">Trigger</Label>
                  <Select
                    value={automationForm.trigger}
                    onValueChange={(value) =>
                      setAutomationForm((prev) => ({ ...prev, trigger: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_registration">
                        User Registration
                      </SelectItem>
                      <SelectItem value="user_login">User Login</SelectItem>
                      <SelectItem value="profile_completion">
                        Profile Completion
                      </SelectItem>
                      <SelectItem value="inactive_user">
                        Inactive User (7 days)
                      </SelectItem>
                      <SelectItem value="study_streak">
                        Study Streak Milestone
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="action">Action</Label>
                  <Select
                    value={automationForm.action}
                    onValueChange={(value) =>
                      setAutomationForm((prev) => ({ ...prev, action: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_welcome_email">
                        Send Welcome Email
                      </SelectItem>
                      <SelectItem value="send_reminder_email">
                        Send Reminder Email
                      </SelectItem>
                      <SelectItem value="send_motivation_email">
                        Send Motivation Email
                      </SelectItem>
                      <SelectItem value="send_achievement_email">
                        Send Achievement Email
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-subject">Email Subject</Label>
                  <Input
                    id="template-subject"
                    value={automationForm.template.subject}
                    onChange={(e) =>
                      setAutomationForm((prev) => ({
                        ...prev,
                        template: {
                          ...prev.template,
                          subject: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g., Welcome to PrepP!"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-body">Email Body</Label>
                  <Textarea
                    id="template-body"
                    value={automationForm.template.body}
                    onChange={(e) =>
                      setAutomationForm((prev) => ({
                        ...prev,
                        template: {
                          ...prev.template,
                          body: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g., Welcome {{userName}}! Your account has been created successfully."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAutomationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createAutomationRule} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Email Notification</DialogTitle>
                <DialogDescription>
                  Send personalized emails to users or groups.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient-type">Recipient Type</Label>
                  <Select
                    value={emailForm.recipientType}
                    onValueChange={(value) =>
                      setEmailForm((prev) => ({
                        ...prev,
                        recipientType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        Individual User
                      </SelectItem>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="students">All Students</SelectItem>
                      <SelectItem value="admins">All Admins</SelectItem>
                      <SelectItem value="super_admins">Super Admins Only</SelectItem>
                      <SelectItem value="inactive_users">
                        Inactive Users (30+ days)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {emailForm.recipientType === "individual" && (
                  <div className="grid gap-2">
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select
                      value={emailForm.recipientId}
                      onValueChange={(value) => {
                        const user = users.find((u) => u.id === value);
                        setEmailForm((prev) => ({
                          ...prev,
                          recipientId: value,
                          recipientEmail: user?.email || "",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2 max-w-full">
                              <span className="truncate">{user.name}</span>
                              <span className="text-muted-foreground truncate text-sm">
                                ({user.email})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) =>
                      setEmailForm((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Email subject"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={emailForm.message}
                    onChange={(e) =>
                      setEmailForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Email message"
                    rows={6}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSendDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={sendEmail} disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Email History</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sent
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {notifications.filter((n) => n.status === "sent").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {notifications.filter((n) => n.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {notifications.filter((n) => n.status === "failed").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {notifications.length > 0
                    ? Math.round(
                        (notifications.filter((n) => n.status === "sent")
                          .length /
                          notifications.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {notification.type === "email" ? (
                            <Mail className="w-3 h-3 mr-1" />
                          ) : (
                            <Bell className="w-3 h-3 mr-1" />
                          )}
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div
                          className="max-w-[250px] truncate"
                          title={notification.title}
                        >
                          {notification.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-[200px] truncate"
                          title={
                            notification.recipientEmail || "Multiple recipients"
                          }
                        >
                          {notification.recipientEmail || "Multiple recipients"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(notification.status)}
                      </TableCell>
                      <TableCell>
                        {notification.sentAt
                          ? new Date(notification.sentAt).toLocaleDateString()
                          : "Not sent"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {notifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications sent yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Automatically send emails based on user actions and milestones.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automationRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.trigger.replace(/_/g, " ")}</TableCell>
                      <TableCell>Send Email</TableCell>
                      <TableCell>
                        <Badge
                          variant={rule.isActive ? "default" : "secondary"}
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(rule.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleAutomationRule(rule.id, !rule.isActive)
                          }
                        >
                          {rule.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {automationRules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No automation rules created yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
