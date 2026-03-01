"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Send,
  Users,
  Lock,
  Globe,
  Trash2,
  Pin,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ForumInfo {
  id: string;
  slug: string;
  name: string;
  description?: string;
  programId?: string | null;
  isOpenToAll: boolean;
  isPinned: boolean;
  isMember: boolean;
  memberCount: number;
}

interface Post {
  id: string;
  content: string;
  isPinned: boolean;
  parentPostId?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const POLL_INTERVAL = 5000; // 5 seconds

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ForumChatPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id as string | undefined;
  const isAdmin = ["admin", "super_admin"].includes((session?.user as any)?.role);

  const [forum, setForum] = useState<ForumInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [notMember, setNotMember] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastPostTimestampRef = useRef<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isAtBottomRef = useRef(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch forum details
  useEffect(() => {
    fetch(`/api/forums/${slug}`)
      .then((r) => {
        if (r.status === 403) { setAccessDenied(true); setLoading(false); return null; }
        if (r.status === 404) { router.push("/forums"); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setForum(d.forum);
        if (!d.forum.isMember && !isAdmin) {
          setNotMember(true);
          setLoading(false);
        }
      })
      .catch(() => router.push("/forums"));
  }, [slug, router, isAdmin]);

  // Load initial posts
  const loadInitialPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/forums/${slug}/posts?limit=50`);
      if (res.status === 403) { setNotMember(true); setLoading(false); return; }
      const data = await res.json();
      const fetched: Post[] = data.posts ?? [];
      setPosts(fetched);
      setHasMore(data.hasMore ?? false);
      if (fetched.length > 0) {
        lastPostTimestampRef.current = fetched[fetched.length - 1].createdAt;
      }
    } catch {
      toast.error("Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!notMember && !accessDenied) {
      loadInitialPosts();
    }
  }, [loadInitialPosts, notMember, accessDenied]);

  // Scroll to bottom after initial load
  useEffect(() => {
    if (!loading && posts.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [loading]);

  // Polling for new messages
  useEffect(() => {
    if (notMember || accessDenied) return;

    const poll = async () => {
      const after = lastPostTimestampRef.current;
      if (!after) return;
      try {
        const res = await fetch(`/api/forums/${slug}/posts?after=${encodeURIComponent(after)}&limit=50`);
        if (!res.ok) return;
        const data = await res.json();
        const newPosts: Post[] = data.posts ?? [];
        if (newPosts.length > 0) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = newPosts.filter((p) => !existingIds.has(p.id));
            if (fresh.length === 0) return prev;
            lastPostTimestampRef.current = fresh[fresh.length - 1].createdAt;
            return [...prev, ...fresh];
          });
          // Auto-scroll if user is near the bottom
          if (isAtBottomRef.current) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          }
        }
      } catch {
        // silently ignore polling errors
      }
    };

    pollingRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [slug, notMember, accessDenied]);

  // Track scroll position to decide auto-scroll
  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distFromBottom < 150;
  }, []);

  // Load older messages
  const loadOlder = async () => {
    if (posts.length === 0 || loadingMore) return;
    setLoadingMore(true);
    const oldest = posts[0].createdAt;
    try {
      const res = await fetch(`/api/forums/${slug}/posts?before=${encodeURIComponent(oldest)}&limit=30`);
      const data = await res.json();
      const older: Post[] = data.posts ?? [];
      if (older.length > 0) {
        setPosts((prev) => [...older, ...prev]);
        setHasMore(data.hasMore ?? false);
        // Keep scroll position
        const el = scrollAreaRef.current;
        if (el) {
          const prevScrollHeight = el.scrollHeight;
          requestAnimationFrame(() => {
            el.scrollTop += el.scrollHeight - prevScrollHeight;
          });
        }
      } else {
        setHasMore(false);
      }
    } catch {
      toast.error("Could not load older messages");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    const content = message.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/forums/${slug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }
      const data = await res.json();
      const newPost: Post = data.post;
      setPosts((prev) => {
        const exists = prev.some((p) => p.id === newPost.id);
        if (exists) return prev;
        return [...prev, newPost];
      });
      lastPostTimestampRef.current = newPost.createdAt;
      setMessage("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (post: Post) => {
    try {
      const res = await fetch(`/api/forums/${slug}/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Could not delete message"); return; }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/forums/${slug}/join`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Cannot join");
        return;
      }
      setNotMember(false);
      setForum((prev) => prev ? { ...prev, isMember: true, memberCount: prev.memberCount + 1 } : prev);
      loadInitialPosts();
    } catch {
      toast.error("Failed to join");
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need to be enrolled in the required program to access this forum.
          </p>
          <Link href="/forums"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Forums</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Forum header */}
      <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/forums">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            {forum ? (
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold truncate">{forum.name}</h1>
                {forum.programId ? (
                  <Badge variant="secondary" className="text-xs"><Lock className="h-3 w-3 mr-1" />Program</Badge>
                ) : forum.isOpenToAll ? (
                  <Badge variant="outline" className="text-xs"><Globe className="h-3 w-3 mr-1" />Open</Badge>
                ) : null}
              </div>
            ) : (
              <Skeleton className="h-5 w-48" />
            )}
            {forum && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Users className="h-3 w-3" />
                <span>{forum.memberCount} member{forum.memberCount !== 1 ? "s" : ""}</span>
                {forum.description && <span className="ml-2 truncate hidden sm:inline">— {forum.description}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Not a member gate */}
      {notMember ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Join to participate</h2>
            <p className="text-muted-foreground mb-6">
              {forum?.name ? `Join ${forum.name}` : "Join this forum"} to view and send messages.
            </p>
            <Button onClick={handleJoin}>Join Forum</Button>
          </div>
        </div>
      ) : (
        /* Chat area */
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-2 min-h-0">
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto py-4 space-y-1"
            style={{ maxHeight: "calc(100vh - 220px)" }}
          >
            {/* Load older */}
            {hasMore && (
              <div className="text-center mb-4">
                <Button variant="outline" size="sm" onClick={loadOlder} disabled={loadingMore}>
                  {loadingMore ? "Loading…" : "Load older messages"}
                </Button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full max-w-xs" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquareDashes />
                <p className="mt-3 font-medium">No messages yet</p>
                <p className="text-sm">Be the first to say something!</p>
              </div>
            ) : (
              posts.map((post, idx) => {
                const isOwn = post.user.id === currentUserId;
                const canDelete = isOwn || isAdmin;
                const showAvatar = idx === 0 || posts[idx - 1].user.id !== post.user.id;

                return (
                  <div
                    key={post.id}
                    className={cn(
                      "group flex items-start gap-2 px-1 py-0.5 rounded-lg hover:bg-muted/40 transition-colors",
                      isOwn && "flex-row-reverse"
                    )}
                  >
                    <div className={cn("flex-shrink-0 w-8", !showAvatar && "invisible")}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                          {initials(post.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className={cn("flex-1 min-w-0 max-w-[75%]", isOwn && "flex flex-col items-end")}>
                      {showAvatar && (
                        <div className={cn("flex items-baseline gap-2 mb-0.5", isOwn && "flex-row-reverse")}>
                          <span className="text-sm font-semibold">{isOwn ? "You" : post.user.name}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(post.createdAt)}</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        )}
                      >
                        {post.content}
                      </div>
                    </div>
                    {canDelete && (
                      <div className={cn("flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-center", isOwn && "order-first")}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(post)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Message input */}
          <div className="border-t pt-3 pb-4">
            <div className="flex gap-2 items-end">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                className="min-h-[44px] max-h-32 resize-none flex-1"
                rows={1}
              />
              <Button
                size="icon"
                className="h-11 w-11 flex-shrink-0"
                onClick={handleSend}
                disabled={!message.trim() || sending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageSquareDashes() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-muted-foreground"
    >
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}
