"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Users,
  Plus,
  MoreHorizontal,
  Lock,
  Globe,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ForumRow {
  id: string;
  slug: string;
  name: string;
  description?: string;
  programId?: string | null;
  isOpenToAll: boolean;
  isActive: boolean;
  isPinned: boolean;
  memberCount: number;
  postCount: number;
  metadata?: { icon?: string; color?: string };
  createdAt: string;
}

interface Program {
  id: string;
  code: string;
  name: string;
}

const DEFAULT_FORM = {
  name: "",
  slug: "",
  description: "",
  programId: "none",
  isOpenToAll: false,
  isPinned: false,
};

export default function AdminForumsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [forums, setForums] = useState<ForumRow[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editForum, setEditForum] = useState<ForumRow | null>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any)?.role)
    ) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const fetchForums = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/forums");
      const data = await res.json();
      setForums(data.forums ?? []);
    } catch {
      toast.error("Could not load forums");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchForums();
      fetch("/api/programs")
        .then((r) => r.json())
        .then((d) => setPrograms(d.programs ?? []))
        .catch(() => {});
    }
  }, [status, fetchForums]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: !editForum
        ? value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : prev.slug,
    }));
  };

  const openCreate = () => {
    setForm({ ...DEFAULT_FORM });
    setEditForum(null);
    setCreateOpen(true);
  };

  const openEdit = (f: ForumRow) => {
    setForm({
      name: f.name,
      slug: f.slug,
      description: f.description ?? "",
      programId: f.programId ?? "none",
      isOpenToAll: f.isOpenToAll,
      isPinned: f.isPinned,
    });
    setEditForum(f);
    setCreateOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        programId: form.programId === "none" ? null : form.programId,
        isOpenToAll: form.isOpenToAll,
        isPinned: form.isPinned,
      };

      const res = editForum
        ? await fetch(`/api/admin/forums/${editForum.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/forums", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success(editForum ? "Forum updated" : "Forum created");
      setCreateOpen(false);
      fetchForums();
    } catch {
      toast.error("Failed to save forum");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (f: ForumRow) => {
    try {
      await fetch(`/api/admin/forums/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !f.isActive }),
      });
      setForums((prev) =>
        prev.map((fr) =>
          fr.id === f.id ? { ...fr, isActive: !f.isActive } : fr,
        ),
      );
    } catch {
      toast.error("Failed to update");
    }
  };

  const togglePinned = async (f: ForumRow) => {
    try {
      await fetch(`/api/admin/forums/${f.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !f.isPinned }),
      });
      setForums((prev) =>
        prev.map((fr) =>
          fr.id === f.id ? { ...fr, isPinned: !f.isPinned } : fr,
        ),
      );
    } catch {
      toast.error("Failed to update");
    }
  };

  const getProgramCode = (programId: string | null | undefined) => {
    if (!programId) return null;
    return programs.find((p) => p.id === programId)?.code ?? null;
  };

  const totalMembers = forums.reduce((s, f) => s + f.memberCount, 0);
  const totalPosts = forums.reduce((s, f) => s + f.postCount, 0);
  const activeForums = forums.filter((f) => f.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forums</h1>
          <p className="text-muted-foreground">
            Manage community discussion forums
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Forum
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Forums",
            value: forums.length,
            icon: MessageSquare,
            sub: `${activeForums} active`,
          },
          {
            label: "Total Members",
            value: totalMembers,
            icon: Users,
            sub: "across all forums",
          },
          {
            label: "Total Posts",
            value: totalPosts,
            icon: MessageSquare,
            sub: "messages sent",
          },
          {
            label: "Pinned Forums",
            value: forums.filter((f) => f.isPinned).length,
            icon: Pin,
            sub: "shown first",
          },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forums Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Forums</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : forums.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No forums yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first forum to get started.
              </p>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Forum
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forum</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Posts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forums.map((f) => {
                  const programCode = getProgramCode(f.programId);
                  return (
                    <TableRow
                      key={f.id}
                      className={!f.isActive ? "opacity-50" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {f.isPinned && (
                            <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-medium">{f.name}</div>
                            <div className="text-xs text-muted-foreground">
                              /{f.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {programCode ? (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            {programCode} only
                          </Badge>
                        ) : f.isOpenToAll ? (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Enrolled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {f.memberCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {f.postCount}
                      </TableCell>
                      <TableCell>
                        <Badge variant={f.isActive ? "default" : "secondary"}>
                          {f.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(`/forums/${f.slug}`, "_blank")
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Forum
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(f)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePinned(f)}>
                              {f.isPinned ? (
                                <>
                                  <PinOff className="h-4 w-4 mr-2" />
                                  Unpin
                                </>
                              ) : (
                                <>
                                  <Pin className="h-4 w-4 mr-2" />
                                  Pin
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(f)}>
                              {f.isActive ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen} modal={false}>
        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editForum ? "Edit Forum" : "Create Forum"}
            </DialogTitle>
            <DialogDescription>
              {editForum
                ? "Update forum settings."
                : "Set up a new discussion forum."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-name">Name *</Label>
              <Input
                id="f-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. RN General Discussion"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-slug">Slug *</Label>
              <Input
                id="f-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-"),
                  }))
                }
                placeholder="e.g. rn-general"
              />
              <p className="text-xs text-muted-foreground">
                Used in the URL: /forums/{form.slug || "…"}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-desc">Description</Label>
              <Textarea
                id="f-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="What is this forum about?"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Program Restriction</Label>
              <Select
                value={form.programId}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    programId: v,
                    isOpenToAll: v === "none" ? p.isOpenToAll : false,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No restriction (all enrolled users)
                  </SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If set, only active enrollees of that program can join.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Open to all users</Label>
                <p className="text-xs text-muted-foreground">
                  Allow any logged-in user to join (no enrollment required)
                </p>
              </div>
              <Switch
                checked={form.isOpenToAll}
                onCheckedChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    isOpenToAll: v,
                    programId: v ? "none" : p.programId,
                  }))
                }
                disabled={form.programId !== "none"}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Pin forum</Label>
                <p className="text-xs text-muted-foreground">
                  Show this forum at the top of the list
                </p>
              </div>
              <Switch
                checked={form.isPinned}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isPinned: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editForum ? "Save Changes" : "Create Forum"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
