"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgramOption {
  id: string;
  code: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  metadata?: {
    features?: string[];
    icon?: string;
    color?: string;
    displayOrder?: number;
  };
}

interface ProgramSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const PROGRAM_ICONS: Record<string, string> = {
  RM: "👶",
  RN: "🩺",
  RPHN: "💚",
  SPECIALTY: "🎓",
};

export function ProgramSelect({
  value,
  onValueChange,
  multiple = false,
  disabled = false,
  className,
  label = "Select Your Program",
}: ProgramSelectProps) {
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch("/api/programs");
        const data = await response.json();
        if (data.success) {
          setPrograms(data.programs);
        }
      } catch (error) {
        console.error("Failed to fetch programs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const toggleProgram = (programCode: string) => {
    if (disabled) return;

    if (multiple) {
      if (value.includes(programCode)) {
        onValueChange(value.filter((v) => v !== programCode));
      } else {
        onValueChange([...value, programCode]);
      }
    } else {
      if (value.includes(programCode)) {
        onValueChange([]);
      } else {
        onValueChange([programCode]);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {multiple && (
        <p className="text-xs text-muted-foreground">
          You can select multiple programs if you wish to enroll in more than
          one
        </p>
      )}
      <div className="grid grid-cols-1 gap-2">
        {programs.map((program) => {
          const isSelected = value.includes(program.code);
          const icon = PROGRAM_ICONS[program.code] || "📚";

          return (
            <Card
              key={program.code}
              className={cn(
                "relative cursor-pointer transition-all duration-200 p-3 border-2",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-muted hover:border-primary/40 hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => toggleProgram(program.code)}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {program.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {program.code}
                    </Badge>
                  </div>
                  {program.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {program.description}
                    </p>
                  )}
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30",
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="text-xs text-destructive">Please select a program</p>
      )}
    </div>
  );
}
