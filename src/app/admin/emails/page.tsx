"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Mail,
  MailOpen,
  Trash2,
  Archive,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Email {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  isRead: boolean;
  isArchived: boolean;
  folder: string;
}

function AdminEmailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const page = parseInt(searchParams.get("page") || "1");
  const folder = searchParams.get("folder") || "inbox";
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "super_admin") {
      toast.error("Unauthorized access");
      router.push("/admin");
      return;
    }
    fetchEmails();
  }, [page, folder, search, session, status]); // Debounce search in real app

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        folder,
        search,
      });

      const res = await fetch(`/api/admin/emails?${query}`);
      const data = await res.json();

      if (data.success) {
        setEmails(data.data);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to load emails");
      }
    } catch (error) {
      console.error("Error loading emails:", error);
      toast.error("Error loading emails");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this email?")) return;

    try {
      const res = await fetch(`/api/admin/emails/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Email deleted");
        fetchEmails();
      } else {
        toast.error("Failed to delete email");
      }
    } catch (error) {
      toast.error("Error deleting email");
    }
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true, folder: "archive" }),
      });
      if (res.ok) {
        toast.success("Email archived");
        fetchEmails();
      } else {
        toast.error("Failed to archive email");
      }
    } catch (error) {
      toast.error("Error archiving email");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Inbox</h1>
          <p className="text-muted-foreground">
            Manage incoming emails from{" "}
            {folder === "inbox" ? "Inbox" : "Archive"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={folder === "inbox" ? "default" : "outline"}
            onClick={() => router.push("/admin/emails?folder=inbox")}
          >
            Inbox
          </Button>
          <Button
            variant={folder === "archive" ? "default" : "outline"}
            onClick={() => router.push("/admin/emails?folder=archive")}
          >
            Archive
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <div className="flex items-center space-x-2">
              <form
                onSubmit={handleSearch}
                className="flex items-center space-x-2"
              >
                <Input
                  placeholder="Search subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-[200px] lg:w-[300px]"
                />
                <Button type="submit" size="icon" variant="ghost">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button size="icon" variant="ghost" onClick={fetchEmails}>
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[200px]">From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[150px]">Received</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : emails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No emails found.
                    </TableCell>
                  </TableRow>
                ) : (
                  emails.map((email) => (
                    <TableRow
                      key={email.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/emails/${email.id}`)}
                    >
                      <TableCell>
                        {email.isRead ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {email.from}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span
                            className={!email.isRead ? "font-semibold" : ""}
                          >
                            {email.subject}
                          </span>
                          {!email.isRead && (
                            <Badge
                              variant="secondary"
                              className="h-5 px-1.5 text-[10px]"
                            >
                              New
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(email.receivedAt), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {folder !== "archive" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={(e) => handleArchive(email.id, e)}
                              title="Archive"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDelete(email.id, e)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`?page=${page - 1}&folder=${folder}`)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`?page=${page + 1}&folder=${folder}`)}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminEmailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdminEmailsContent />
    </Suspense>
  );
}
