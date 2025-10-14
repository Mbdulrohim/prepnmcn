"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch institutions on component mount
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true);
      try {
        // Fetch with a high limit to get all institutions
        const response = await fetch("/api/institutions?limit=1000");
        const data = await response.json();
        if (data.success) {
          console.log(`Loaded ${data.institutions.length} institutions`);
          setInstitutions(data.institutions);
        } else {
          console.error("Failed to load institutions:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch institutions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  // Filter institutions based on search query
  const filteredInstitutions = institutions.filter((institution) => {
    const query = searchQuery.toLowerCase();
    return (
      institution.name.toLowerCase().includes(query) ||
      institution.code.toLowerCase().includes(query) ||
      institution.state.toLowerCase().includes(query) ||
      institution.city.toLowerCase().includes(query)
    );
  });

  // Get selected institution for display
  const selectedInstitution = institutions.find((inst) => inst.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="institution">Institution</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              "w-full justify-between h-12 px-3 py-2 text-sm",
              !value && "text-muted-foreground",
              className
            )}
          >
            {loading ? (
              "Loading institutions..."
            ) : selectedInstitution ? (
              <span className="truncate">
                {selectedInstitution.name} ({selectedInstitution.code})
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder={`Search ${institutions.length} institutions...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {searchQuery && filteredInstitutions.length > 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                Showing {filteredInstitutions.length} of {institutions.length}{" "}
                institutions
              </div>
            )}
            <CommandEmpty>
              {loading ? "Loading institutions..." : "No institution found."}
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {filteredInstitutions.map((institution) => (
                <CommandItem
                  key={institution.id}
                  value={institution.id}
                  onSelect={() => {
                    onValueChange(institution.id);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === institution.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{institution.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {institution.code} • {institution.city},{" "}
                      {institution.state}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
