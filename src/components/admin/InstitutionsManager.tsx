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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Filter, Plus, Globe, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Institution {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  latitude?: number;
  longitude?: number;
}

interface GeoStats {
  totalStates: number;
  totalCities: number;
  institutionsByState: Record<string, number>;
  institutionsByType: Record<string, number>;
}

export default function InstitutionsManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<
    Institution[]
  >([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isAddInstitutionOpen, setIsAddInstitutionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [geoStats, setGeoStats] = useState<GeoStats | null>(null);
  const [newInstitution, setNewInstitution] = useState({
    name: "",
    code: "",
    state: "",
    city: "",
    type: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      !["admin", "super_admin"].includes((session?.user as any)?.role)
    ) {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchInstitutions();
    }
  }, [session, status, router]);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, searchTerm, selectedState, selectedType]);

  useEffect(() => {
    if (institutions.length > 0) {
      calculateGeoStats();
    }
  }, [institutions]);

  const fetchInstitutions = async () => {
    try {
      const res = await fetch("/api/admin/institutions");
      const data = await res.json();
      setInstitutions(data);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInstitutions = () => {
    let filtered = institutions;

    if (searchTerm) {
      filtered = filtered.filter(
        (inst) =>
          inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inst.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedState && selectedState !== "all") {
      filtered = filtered.filter((inst) => inst.state === selectedState);
    }

    if (selectedType && selectedType !== "all") {
      filtered = filtered.filter((inst) => inst.type === selectedType);
    }

    setFilteredInstitutions(filtered);
  };

  const calculateGeoStats = () => {
    const states = new Set(institutions.map((inst) => inst.state));
    const cities = new Set(institutions.map((inst) => inst.city));

    const institutionsByState: Record<string, number> = {};
    const institutionsByType: Record<string, number> = {};

    institutions.forEach((inst) => {
      institutionsByState[inst.state] =
        (institutionsByState[inst.state] || 0) + 1;
      institutionsByType[inst.type] = (institutionsByType[inst.type] || 0) + 1;
    });

    setGeoStats({
      totalStates: states.size,
      totalCities: cities.size,
      institutionsByState,
      institutionsByType,
    });
  };

  const toggleInstitutionSelection = (institutionId: string) => {
    const newSelected = new Set(selectedInstitutions);
    if (newSelected.has(institutionId)) {
      newSelected.delete(institutionId);
    } else {
      newSelected.add(institutionId);
    }
    setSelectedInstitutions(newSelected);
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/institutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInstitution),
      });

      if (res.ok) {
        const addedInstitution = await res.json();
        setInstitutions([addedInstitution, ...institutions]);
        setNewInstitution({
          name: "",
          code: "",
          state: "",
          city: "",
          type: "",
        });
        setIsAddInstitutionOpen(false);
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (error) {
      console.error("Error adding institution:", error);
      alert("Error adding institution");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedState("all");
    setSelectedType("all");
  };

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-64 mx-auto" />
          <div className="flex justify-center gap-2 mt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Geo Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-8 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-end gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Table Header */}
              <div className="flex items-center space-x-4 pb-2 border-b">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              {/* Table Rows */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24 rounded" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const institutionTypes = [
    "University",
    "Polytechnic",
    "College of Education",
    "Monotechnic",
    "College of Health",
    "Other",
  ];

  return (
    <div className="space-y-6">
      {/* SEO Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">
          Institutions Management
        </h1>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {geoStats?.totalStates || 0} States
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {geoStats?.totalCities || 0} Cities
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {institutions.length} Institutions
          </Badge>
        </div>
      </div>

      {/* Geo Stats Cards */}
      {geoStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Geographic Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{geoStats.totalStates}</div>
              <p className="text-xs text-muted-foreground">States covered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                City Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{geoStats.totalCities}</div>
              <p className="text-xs text-muted-foreground">
                Cities represented
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.entries(geoStats.institutionsByState).sort(
                  ([, a], [, b]) => b - a
                )[0]?.[0] || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {Object.entries(geoStats.institutionsByState).sort(
                  ([, a], [, b]) => b - a
                )[0]?.[1] || 0}{" "}
                institutions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Institution Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(geoStats.institutionsByType).length}
              </div>
              <p className="text-xs text-muted-foreground">Different types</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Institutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Institution name, code, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {nigerianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {institutionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Dialog
                open={isAddInstitutionOpen}
                onOpenChange={setIsAddInstitutionOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Institution</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddInstitution} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Institution Name</Label>
                      <Input
                        id="name"
                        value={newInstitution.name}
                        onChange={(e) =>
                          setNewInstitution({
                            ...newInstitution,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Institution Code</Label>
                      <Input
                        id="code"
                        value={newInstitution.code}
                        onChange={(e) =>
                          setNewInstitution({
                            ...newInstitution,
                            code: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={newInstitution.state}
                        onValueChange={(value) =>
                          setNewInstitution({ ...newInstitution, state: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {nigerianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newInstitution.city}
                        onChange={(e) =>
                          setNewInstitution({
                            ...newInstitution,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Institution Type</Label>
                      <Select
                        value={newInstitution.type}
                        onValueChange={(value) =>
                          setNewInstitution({ ...newInstitution, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select institution type" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">
                      Add Institution
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institutions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Institutions ({filteredInstitutions.length} of {institutions.length}
            )
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>State</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((institution) => (
                <TableRow
                  key={institution.id}
                  data-state={
                    selectedInstitutions.has(institution.id)
                      ? "selected"
                      : undefined
                  }
                  onClick={() => toggleInstitutionSelection(institution.id)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedInstitutions.has(institution.id)}
                      onChange={() =>
                        toggleInstitutionSelection(institution.id)
                      }
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {institution.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{institution.code}</Badge>
                  </TableCell>
                  <TableCell>{institution.state}</TableCell>
                  <TableCell>{institution.city}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{institution.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        institution.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {institution.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(institution.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
