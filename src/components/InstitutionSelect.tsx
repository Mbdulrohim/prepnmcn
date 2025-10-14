"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface Institution {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  type: string;
}

interface InstitutionSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InstitutionSelect({
  value,
  onValueChange,
  placeholder = "Select institution...",
  disabled = false,
  className,
}: InstitutionSelectProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch institutions on component mount
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/institutions");
        const data = await response.json();
        if (data.success) {
          setInstitutions(data.institutions);
        }
      } catch (error) {
        console.error("Failed to fetch institutions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="institution">Institution</Label>
      <select
        id="institution"
        value={value || ""}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full h-12 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
          className || ""
        }`}
      >
        <option value="" disabled>
          {loading ? "Loading institutions..." : placeholder}
        </option>
        {institutions.map((institution) => (
          <option key={institution.id} value={institution.id}>
            {institution.name} ({institution.code}) - {institution.state}
          </option>
        ))}
      </select>
    </div>
  );
}
