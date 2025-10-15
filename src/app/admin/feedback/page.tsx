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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  MoreHorizontal,
  Eye,
  Trash2,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "responded";
}

interface FeedbackStats {
  totalFeedback: number;
  unreadFeedback: number;
  readFeedback: number;
  respondedFeedback: number;
}

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [fullMessageFeedback, setFullMessageFeedback] =
    useState<Feedback | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchFeedback();
    }
  }, [session, status]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setStats(data.stats);
      } else {
        toast.error("Failed to fetch feedback.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeedbackStatus = async (
    feedbackId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Feedback status updated.");
        fetchFeedback(); // Refresh the list
      } else {
        toast.error("Failed to update feedback status.");
      }
    } catch (error) {
      toast.error("An error occurred while updating feedback.");
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Feedback deleted.");
        fetchFeedback(); // Refresh the list
      } else {
        toast.error("Failed to delete feedback.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting feedback.");
    }
  };

  const sendResponse = async () => {
    if (!selectedFeedback || !responseMessage.trim()) return;

    setIsSendingResponse(true);
    try {
      const response = await fetch(
        `/api/admin/feedback/${selectedFeedback.id}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response: responseMessage.trim() }),
        }
      );

      if (response.ok) {
        toast.success("Response sent successfully!");
        setIsResponseDialogOpen(false);
        setResponseMessage("");
        setSelectedFeedback(null);
        fetchFeedback(); // Refresh the list
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send response.");
      }
    } catch (error) {
      toast.error("An error occurred while sending response.");
    } finally {
      setIsSendingResponse(false);
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive">Unread</Badge>;
      case "read":
        return <Badge variant="secondary">Read</Badge>;
      case "responded":
        return <Badge variant="default">Responded</Badge>;
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
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">
            View and manage user feedback submissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalFeedback || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.unreadFeedback || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.readFeedback || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.respondedFeedback || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="responded">Responded</option>
        </select>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.userEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="max-w-md cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => {
                        setFullMessageFeedback(item);
                        setIsMessageDialogOpen(true);
                      }}
                      title="Click to view full message"
                    >
                      {truncateMessage(item.message)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFeedback(item);
                            setIsResponseDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Respond
                        </DropdownMenuItem>
                        {item.status === "unread" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateFeedbackStatus(item.id, "read")
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        {item.status === "read" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateFeedbackStatus(item.id, "responded")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Responded
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteFeedback(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredFeedback.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No feedback found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Send a response to {selectedFeedback?.userName}'s feedback
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Original Feedback */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Original Feedback:
                </p>
                <p className="text-sm text-gray-600">
                  {selectedFeedback.message}
                </p>
              </div>

              {/* Response Input */}
              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  placeholder="Type your response to the user..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={4}
                  disabled={isSendingResponse}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResponseDialogOpen(false);
                    setResponseMessage("");
                    setSelectedFeedback(null);
                  }}
                  disabled={isSendingResponse}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendResponse}
                  disabled={isSendingResponse || !responseMessage.trim()}
                >
                  {isSendingResponse ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Response
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Feedback Message</DialogTitle>
            <DialogDescription>
              Full message from {fullMessageFeedback?.userName}
            </DialogDescription>
          </DialogHeader>

          {fullMessageFeedback && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {fullMessageFeedback.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {fullMessageFeedback.userName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {fullMessageFeedback.userEmail}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusBadge(fullMessageFeedback.status)}
                  <span className="text-sm text-gray-500">
                    {new Date(fullMessageFeedback.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Full Message */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Message:</h4>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {fullMessageFeedback.message}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMessageDialogOpen(false);
                    setFullMessageFeedback(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedFeedback(fullMessageFeedback);
                    setIsResponseDialogOpen(true);
                    setIsMessageDialogOpen(false);
                    setFullMessageFeedback(null);
                  }}
                >
                  Respond
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
