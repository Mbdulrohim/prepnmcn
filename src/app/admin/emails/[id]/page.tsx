"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Trash2,
  Archive,
  Reply,
  MoreVertical,
  Paperclip,
  Calendar,
  User,
  Mail,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  textBody?: string;
  htmlBody?: string;
  receivedAt: string;
  isRead: boolean;
  isArchived: boolean;
  folder: string;
  attachments?: any[];
}

export default function AdminEmailDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "super_admin") {
      toast.error("Unauthorized access");
      router.push("/admin");
      return;
    }

    if (params.id) {
      fetchEmail(params.id as string);
    }
  }, [params.id, session, status]);

  const fetchEmail = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/emails/${id}`);
      const data = await res.json();

      if (data.success) {
        setEmail(data.data);
        // Mark as read if not already
        if (!data.data.isRead) {
          markAsRead(id);
        }
      } else {
        toast.error("Failed to load email");
        router.push("/admin/emails");
      }
    } catch (error) {
      console.error("Error loading email:", error);
      toast.error("Error loading email");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const handleDelete = async () => {
    if (!email || !confirm("Are you sure you want to delete this email?"))
      return;

    try {
      const res = await fetch(`/api/admin/emails/${email.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Email deleted");
        router.push("/admin/emails");
      } else {
        toast.error("Failed to delete email");
      }
    } catch (error) {
      toast.error("Error deleting email");
    }
  };

  const handleArchive = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/admin/emails/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isArchived: !email.isArchived,
          folder: email.isArchived ? "inbox" : "archive",
        }),
      });
      if (res.ok) {
        toast.success(email.isArchived ? "Email unarchived" : "Email archived");
        router.push("/admin/emails");
      } else {
        toast.error("Failed to update email");
      }
    } catch (error) {
      toast.error("Error updating email");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!email) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleArchive}>
            <Archive className="h-4 w-4 mr-2" />
            {email.isArchived ? "Unarchive" : "Archive"}
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold leading-tight">
                {email.subject}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(email.receivedAt), "PPP p")}
                </span>
                <span className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {email.folder}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{email.from}</div>
                <div className="text-xs text-muted-foreground">
                  To: {Array.isArray(email.to) ? email.to.join(", ") : email.to}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="min-h-[200px] text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {email.htmlBody ? (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: email.htmlBody }}
              />
            ) : (
              email.textBody
            )}
          </div>

          {email.attachments && email.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attachments ({email.attachments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {email.attachments.map((att: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                          {att.filename?.split(".").pop() || "FILE"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {att.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(att.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
