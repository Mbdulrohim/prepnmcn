"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Users, Lock, Globe, ArrowRight, Pin, Hash } from "lucide-react";
import { toast } from "sonner";

interface ForumItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  programId?: string | null;
  isOpenToAll: boolean;
  isPinned: boolean;
  isMember: boolean;
  memberCount: number;
  metadata?: { icon?: string; color?: string };
}

interface Program {
  id: string;
  code: string;
  name: string;
}

function ForumSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card animate-pulse">
      <div className="h-11 w-11 bg-muted rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-3 w-2/3 bg-muted rounded" />
      </div>
      <div className="h-8 w-20 bg-muted rounded-lg" />
    </div>
  );
}

function AccessBadge({
  forum,
  programCode,
}: {
  forum: ForumItem;
  programCode: string | null;
}) {
  if (programCode) {
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <Lock className="h-3 w-3" />
        {programCode}
      </Badge>
    );
  }
  if (forum.isOpenToAll) {
    return (
      <Badge variant="outline" className="text-xs gap-1">
        <Globe className="h-3 w-3" />
        Open
      </Badge>
    );
  }
  return <Badge variant="outline" className="text-xs">Enrolled</Badge>;
}

function ForumRow({
  forum,
  programCode,
  isJoining,
  onJoin,
  onLeave,
}: {
  forum: ForumItem;
  programCode: string | null;
  isJoining: boolean;
  onJoin: (f: ForumItem) => void;
  onLeave: (f: ForumItem) => void;
}) {
  const router = useRouter();
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  const color = forum.metadata?.color;
  const iconClass =
    color && colorMap[color] ? colorMap[color] : "bg-primary/10 text-primary";

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/30 hover:border-primary/20 transition-all">
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}
      >
        <Hash className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{forum.name}</span>
          {forum.isPinned && (
            <Pin className="h-3 w-3 text-primary flex-shrink-0" />
          )}
          <AccessBadge forum={forum} programCode={programCode} />
          {forum.isMember && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              ● Joined
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {forum.description && (
            <p className="text-xs text-muted-foreground truncate">
              {forum.description}
            </p>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
            <Users className="h-3 w-3" />
            {forum.memberCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {forum.isMember ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isJoining}
              onClick={() => onLeave(forum)}
            >
              Leave
            </Button>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => router.push(`/forums/${forum.slug}`)}
            >
              Open <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={isJoining}
            onClick={() => onJoin(forum)}
          >
            {isJoining ? "Joining…" : "Join"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ForumsPage() {
  const router = useRouter();
  const [forums, setForums] = useState<ForumItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchForums = useCallback(async () => {
    try {
      const res = await fetch("/api/forums");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        throw new Error("Failed");
      }
      const data = await res.json();
      setForums(data.forums ?? []);
    } catch {
      toast.error("Could not load forums");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchForums();
    fetch("/api/programs")
      .then((r) => r.json())
      .then((d) => setPrograms(d.programs ?? []))
      .catch(() => {});
  }, [fetchForums]);

  const handleJoin = async (forum: ForumItem) => {
    setJoiningId(forum.id);
    try {
      const res = await fetch(`/api/forums/${forum.slug}/join`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Cannot join");
        return;
      }
      toast.success(`You've joined ${forum.name}`);
      setForums((prev) =>
        prev.map((f) =>
          f.id === forum.id
            ? { ...f, isMember: true, memberCount: f.memberCount + 1 }
            : f
        )
      );
    } catch {
      toast.error("Failed to join forum");
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (forum: ForumItem) => {
    setJoiningId(forum.id);
    try {
      await fetch(`/api/forums/${forum.slug}/join`, { method: "DELETE" });
      toast.success(`You've left ${forum.name}`);
      setForums((prev) =>
        prev.map((f) =>
          f.id === forum.id
            ? { ...f, isMember: false, memberCount: Math.max(0, f.memberCount - 1) }
            : f
        )
      );
    } catch {
      toast.error("Failed to leave");
    } finally {
      setJoiningId(null);
    }
  };

  const getProgramCode = (programId: string | null | undefined) => {
    if (!programId) return null;
    return programs.find((p) => p.id === programId)?.code ?? null;
  };

  const joinedForums = forums.filter((f) => f.isMember);
  const pinnedForums = forums.filter((f) => f.isPinned && !f.isMember);
  const otherForums = forums.filter((f) => !f.isMember && !f.isPinned);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Forums</h1>
            <p className="text-sm text-muted-foreground">
              Community discussions for your programs
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <ForumSkeleton key={i} />
          ))}
        </div>
      ) : forums.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No forums yet</h2>
          <p className="text-sm text-muted-foreground">
            Forums will appear here once you have an active program enrollment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {joinedForums.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Your Forums
              </p>
              <div className="space-y-2">
                {joinedForums.map((forum) => (
                  <ForumRow
                    key={forum.id}
                    forum={forum}
                    programCode={getProgramCode(forum.programId)}
                    isJoining={joiningId === forum.id}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                  />
                ))}
              </div>
            </section>
          )}

          {(pinnedForums.length > 0 || otherForums.length > 0) && (
            <section>
              {joinedForums.length > 0 && <Separator className="mb-6" />}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {joinedForums.length > 0 ? "Discover" : "Available Forums"}
              </p>
              <div className="space-y-2">
                {[...pinnedForums, ...otherForums].map((forum) => (
                  <ForumRow
                    key={forum.id}
                    forum={forum}
                    programCode={getProgramCode(forum.programId)}
                    isJoining={joiningId === forum.id}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
