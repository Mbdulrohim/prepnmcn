"use client";

import { useState, useEffect } from "react";
import { ProgramSelect } from "@/components/ProgramSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function ProgramSelectionPrompt() {
  const [open, setOpen] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkProgramStatus();
  }, []);

  const checkProgramStatus = async () => {
    try {
      const response = await fetch("/api/user/programs");
      if (response.ok) {
        const data = await response.json();
        if (data.needsProgramSelection) {
          setOpen(true);
        }
      }
    } catch (error) {
      // Silently fail — don't block user experience
    } finally {
      setChecked(true);
    }
  };

  const handleSubmit = async () => {
    if (selectedPrograms.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/user/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programCodes: selectedPrograms }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setOpen(false);
      } else {
        toast.error(data.error || "Failed to save program selection");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!checked) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Program</DialogTitle>
          <DialogDescription>
            Please select the program you are preparing for. This helps us
            provide you with the right resources and exams.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ProgramSelect
            value={selectedPrograms}
            onValueChange={setSelectedPrograms}
            multiple={false}
            label="Choose Your Program"
          />

          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700 text-xs">
              You can select one program now. To enroll in multiple programs,
              contact your admin or pay online for additional programs.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedPrograms.length === 0}
            >
              {loading ? "Saving..." : "Save Selection"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
