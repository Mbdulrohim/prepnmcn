"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Lock, Globe, ArrowRight, Pin } from "lucide-react";
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
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="h-5 w-1/2 bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

function ForumCard({
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

  return (
    <Card className="hover:shadow-md transition-shadow border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-lg">{forum.name}</CardTitle>
              {forum.isPinned && <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
              {programCode ? (
                <Badge variant="secondary" className="text-xs font-medium">
                  <Lock className="h-3 w-3 mr-1" />{programCode} only
                </Badge>
              ) : forum.isOpenToAll ? (
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />Open
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Enrolled users</Badge>
              )}
              {forum.isMember && (
                <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Joined</Badge>
              )}
            </div>
            {forum.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{forum.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{forum.memberCount} member{forum.memberCount !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            {forum.isMember ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs"
                  disabled={isJoining}
                  onClick={() => onLeave(forum)}
                >
                  Leave
                </Button>
                <Button size="sm" onClick={() => router.push(`/forums/${forum.slug}`)}>
                  Enter Forum <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            ) : (
              <Button size="sm" disabled={isJoining} onClick={() => onJoin(forum)}>
                {isJoining ? "Joining…" : "Join Forum"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
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
        if (res.status === 401) { router.push("/auth/login"); return; }
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
    fetch("/api/programs").then((r) => r.json()).then((d) => setPrograms(d.programs ?? [])).catch(() => {});
  }, [fetchForums]);

  const handleJoin = async (forum: ForumItem) => {
    setJoiningId(forum.id);
    try {
      const res = await fetch(`/api/forums/${forum.slug}/join`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Cannot join");
        return;
      }
      toast.success(`You've joined ${forum.name}`);
      setForums((prev) =>
        prev.map((f) => f.id === forum.id ? { ...f, isMember: true, memberCount: f.memberCount + 1 } : f)
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
        prev.map((f) => f.id === forum.id ? { ...f, isMember: false, memberCount: Math.max(0, f.memberCount - 1) } : f)
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

  const pinnedForums = forums.filter((f) => f.isPinned);
  const regularForums = forums.filter((f) => !f.isPinned);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Forums
          </h1>
          <p className="text-muted-foreground mt-1">
            Join community discussions with students in your programs.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <ForumSkeleton key={i} />)}</div>
        ) : forums.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No forums available</h2>
              <p className="text-muted-foreground">
                Forums will appear here once you enroll in an active program.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pinnedForums.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Pin className="h-3.5 w-3.5" /> Pinned
                </h2>
                <div className="space-y-3">
                  {pinnedForums.map((forum) => (
                    <ForumCard
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
            <section>
              {pinnedForums.length > 0 && (
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  All Forums
                </h2>
              )}
              <div className="space-y-3">
                {regularForums.map((forum) => (
                  <ForumCard
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
          </div>
        )}
      </div>
    </div>
  );
}
