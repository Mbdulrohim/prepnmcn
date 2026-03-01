"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Baby,
  Stethoscope,
  HeartPulse,
  GraduationCap,
  Users,
  RefreshCcw,
  Pencil,
  Loader2,
  CircleCheck,
  CircleX,
  Wand2,
  Plus,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  RM: <Baby className="h-6 w-6" />,
  RN: <Stethoscope className="h-6 w-6" />,
  RPHN: <HeartPulse className="h-6 w-6" />,
  SPECIALTY: <GraduationCap className="h-6 w-6" />,
};

const PROGRAM_COLORS: Record<string, string> = {
  RM: "#E91E63",
  RN: "#2196F3",
  RPHN: "#4CAF50",
  SPECIALTY: "#9C27B0",
};

interface Program {
  id: string;
  code: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  durationMonths: number;
  isActive: boolean;
  enrollmentCount?: number;
  metadata?: {
    features?: string[];
    icon?: string;
    color?: string;
    displayOrder?: number;
  };
  createdAt: string;
}

export default function ProgramsPage() {
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as any)?.role === "super_admin";

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMonths: "12",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Create program state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    code: "",
    name: "",
    description: "",
    price: "",
    durationMonths: "12",
    color: "#2196F3",
  });
  const [creating, setCreating] = useState(false);

  // Migration state
  const [migrationTarget, setMigrationTarget] = useState<string>("");
  const [migrationMode, setMigrationMode] = useState<
    "premium" | "all-users"
  >("all-users");
  const [migrating, setMigrating] = useState(false);
  const [dryRunning, setDryRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/programs");
      const data = await res.json();
      if (data.success) {
        setPrograms(data.programs);
      } else {
        toast.error(data.error || "Failed to load programs");
      }
    } catch {
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleSeedDefaults = async () => {
    if (!isSuperAdmin) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/programs/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Default programs seeded");
        await fetchPrograms();
      } else {
        toast.error(data.error || "Seeding failed");
      }
    } catch {
      toast.error("Seeding failed");
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleActive = async (program: Program) => {
    if (!isSuperAdmin) return;
    try {
      const res = await fetch(`/api/admin/programs/${program.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !program.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `${program.name} ${!program.isActive ? "activated" : "deactivated"}`,
        );
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === program.id ? { ...p, isActive: !p.isActive } : p,
          ),
        );
      } else {
        toast.error(data.error || "Failed to update program");
      }
    } catch {
      toast.error("Failed to update program");
    }
  };

  const openEdit = (program: Program) => {
    setEditingProgram(program);
    setEditForm({
      name: program.name,
      description: program.description || "",
      price: program.price?.toString() || "",
      durationMonths: program.durationMonths?.toString() || "12",
      isActive: program.isActive,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProgram || !isSuperAdmin) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/programs/${editingProgram.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: editForm.price ? parseFloat(editForm.price) : undefined,
          durationMonths: parseInt(editForm.durationMonths) || 12,
          isActive: editForm.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Program updated");
        setEditingProgram(null);
        await fetchPrograms();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount?: number, currency = "NGN") => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateProgram = async () => {
    if (!isSuperAdmin) return;
    if (!createForm.code.trim() || !createForm.name.trim()) {
      toast.error("Code and name are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: createForm.code.toUpperCase().trim(),
          name: createForm.name.trim(),
          description: createForm.description.trim() || undefined,
          price: createForm.price ? parseFloat(createForm.price) : undefined,
          durationMonths: parseInt(createForm.durationMonths) || 12,
          metadata: {
            color: createForm.color,
            displayOrder: programs.length + 1,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Program "${data.program.name}" created`);
        setShowCreate(false);
        setCreateForm({
          code: "",
          name: "",
          description: "",
          price: "",
          durationMonths: "12",
          color: "#2196F3",
        });
        await fetchPrograms();
      } else {
        toast.error(data.error || "Failed to create program");
      }
    } catch {
      toast.error("Failed to create program");
    } finally {
      setCreating(false);
    }
  };

  const handleMigration = async (dryRun: boolean) => {
    if (!isSuperAdmin || !migrationTarget) return;
    if (dryRun) setDryRunning(true);
    else setMigrating(true);
    setMigrationResult(null);
    try {
      const res = await fetch("/api/admin/migrate-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProgramId: migrationTarget,
          mode: migrationMode,
          dryRun,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMigrationResult(data);
        if (!dryRun) {
          toast.success(
            `Migration complete: ${data.summary.migrated} users ${migrationMode === "all-users" ? "assigned" : "migrated"}, ${data.summary.skipped} skipped`,
          );
          await fetchPrograms(); // Refresh enrollment counts
        }
      } else {
        toast.error(data.error || "Migration failed");
      }
    } catch {
      toast.error("Migration failed");
    } finally {
      setMigrating(false);
      setDryRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the nursing programs available on O&apos;Prep. Programs must
            be active for users to enroll.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={fetchPrograms}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {isSuperAdmin && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSeedDefaults}
                disabled={seeding}
              >
                {seeding ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-1" />
                )}
                Seed Defaults
              </Button>
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create Program
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info banner */}
      {programs.length === 0 && !loading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
          <strong>No programs found.</strong> Click &quot;Seed Defaults&quot; to
          create the standard RM, RN, RPHN, and Specialty programs automatically.
        </div>
      )}

      {/* Programs grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          : programs.map((program) => {
              const color =
                program.metadata?.color || PROGRAM_COLORS[program.code] || "#64748b";
              const icon = PROGRAM_ICONS[program.code] || (
                <GraduationCap className="h-6 w-6" />
              );

              return (
                <Card
                  key={program.id}
                  className={
                    program.isActive ? "border-border" : "border-dashed opacity-60"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {icon}
                        </div>
                        <div>
                          <CardTitle className="text-base leading-tight">
                            {program.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {program.code}
                            </Badge>
                            {program.isActive ? (
                              <Badge className="text-xs px-1.5 py-0 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                <CircleCheck className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                              >
                                <CircleX className="h-3 w-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(program)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {program.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-md bg-muted px-2 py-1.5">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(program.price, program.currency)}
                        </p>
                      </div>
                      <div className="rounded-md bg-muted px-2 py-1.5">
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-semibold">
                          {program.durationMonths}mo
                        </p>
                      </div>
                      <div className="rounded-md bg-muted px-2 py-1.5">
                        <p className="text-xs text-muted-foreground">
                          <Users className="h-3 w-3 inline mr-0.5" />
                          Active
                        </p>
                        <p className="text-sm font-semibold">
                          {program.enrollmentCount ?? 0}
                        </p>
                      </div>
                    </div>

                    {isSuperAdmin && (
                      <div className="flex items-center justify-between pt-1 border-t">
                        <span className="text-xs text-muted-foreground">
                          {program.isActive
                            ? "Visible to users"
                            : "Hidden from users"}
                        </span>
                        <Switch
                          checked={program.isActive}
                          onCheckedChange={() => handleToggleActive(program)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingProgram}
        onOpenChange={(o) => !o && setEditingProgram(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Program — {editingProgram?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price (NGN)</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="e.g. 15000"
                />
              </div>
              <div className="space-y-1">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.durationMonths}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      durationMonths: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(v) =>
                  setEditForm((f) => ({ ...f, isActive: v }))
                }
              />
              <Label>{editForm.isActive ? "Active" : "Inactive"}</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingProgram(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Program Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
            <DialogDescription>
              Add a new nursing program. The code must be unique (e.g. RM, RN,
              PERIOP).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>
                  Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. RM"
                  maxLength={50}
                />
              </div>
              <div className="space-y-1">
                <Label>Brand Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={createForm.color}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="h-9 w-12 rounded border cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">
                    {createForm.color}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label>
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Registered Midwife (RM)"
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                placeholder="Brief description of the program"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price (NGN)</Label>
                <Input
                  type="number"
                  min="0"
                  value={createForm.price}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="e.g. 15000"
                />
              </div>
              <div className="space-y-1">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  min="1"
                  value={createForm.durationMonths}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      durationMonths: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateProgram}
                disabled={creating || !createForm.code || !createForm.name}
              >
                {creating && (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                Create Program
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Migration Tool */}
      {isSuperAdmin && programs.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">
                    User Migration Tool
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Assign existing users to a program. Premium users get active
                    enrollment; others get pending status.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Target Program</Label>
                  <Select
                    value={migrationTarget}
                    onValueChange={(v) => {
                      setMigrationTarget(v);
                      setMigrationResult(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs
                        .filter((p) => p.isActive)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Migration Mode</Label>
                  <Select
                    value={migrationMode}
                    onValueChange={(v: "premium" | "all-users") => {
                      setMigrationMode(v);
                      setMigrationResult(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-users">
                        All Users (assign everyone)
                      </SelectItem>
                      <SelectItem value="premium">
                        Premium Only (activate premium users)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription className="text-xs">
                  {migrationMode === "all-users" ? (
                    <>
                      <strong>All Users mode:</strong> Every user without an
                      enrollment in the target program will be assigned.
                      Currently-premium users get <strong>Active</strong> status;
                      non-premium users get <strong>Pending</strong> status.
                      Users who already have an enrollment are skipped.
                    </>
                  ) : (
                    <>
                      <strong>Premium Only mode:</strong> Only users with{" "}
                      <code>isPremium = true</code> are migrated. They get an{" "}
                      <strong>Active</strong> enrollment with their existing
                      expiry date preserved. Already-enrolled users are skipped.
                    </>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!migrationTarget || dryRunning || migrating}
                  onClick={() => handleMigration(true)}
                >
                  {dryRunning && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Dry Run (Preview)
                </Button>
                <Button
                  variant="default"
                  disabled={!migrationTarget || migrating || dryRunning}
                  onClick={() => handleMigration(false)}
                >
                  {migrating && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Run Migration
                </Button>
              </div>

              {/* Migration Results */}
              {migrationResult && (
                <Alert
                  variant={migrationResult.dryRun ? "default" : "default"}
                  className={
                    migrationResult.dryRun
                      ? "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800"
                      : "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
                  }
                >
                  {migrationResult.dryRun ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {migrationResult.dryRun
                      ? "Dry Run Preview"
                      : "Migration Complete"}
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-1 text-sm space-y-1">
                      <p>
                        Target:{" "}
                        <strong>
                          {migrationResult.targetProgram.name} (
                          {migrationResult.targetProgram.code})
                        </strong>
                      </p>
                      <p>
                        Total users:{" "}
                        <strong>
                          {migrationResult.summary.totalUsers ??
                            migrationResult.summary.totalPremiumUsers}
                        </strong>
                      </p>
                      <p>
                        {migrationResult.dryRun
                          ? "Would migrate"
                          : "Migrated"}
                        : <strong>{migrationResult.summary.migrated}</strong>
                      </p>
                      <p>
                        Skipped:{" "}
                        <strong>{migrationResult.summary.skipped}</strong>
                      </p>
                    </div>
                    {migrationResult.dryRun && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        This was a preview. Click &quot;Run Migration&quot; to
                        apply changes.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
