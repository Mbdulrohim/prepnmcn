"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Star, Lock } from "lucide-react";

interface Resource {
  id: number;
  name: string;
  isFree: boolean;
  createdAt: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setIsPremiumRequired(false);
      setErrorMessage("");
      const qs = new URLSearchParams();
      if (searchTerm) qs.set("search", searchTerm);
      if (selectedType && selectedType !== "all") qs.set("type", selectedType);
      const url = `/api/resources${qs.toString() ? `?${qs}` : ""}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setResources(data);
        } else if (response.status === 403) {
          const error = await response.json();
          setIsPremiumRequired(true);
          setErrorMessage(error.error || "Premium subscription required");
        } else if (response.status === 401) {
          setErrorMessage("Please sign in to access resources");
        }
      } catch (error) {
        console.error("Failed to fetch resources", error);
        setErrorMessage("Failed to load resources");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, [searchTerm, selectedType]);

  return (
    <div className="container mx-auto py-6 px-4 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Resources</h1>
      
      {isPremiumRequired && (
        <Alert className="mb-4 sm:mb-6 border-yellow-300 bg-yellow-50">
          <Lock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Premium Access Required</AlertTitle>
          <AlertDescription className="text-yellow-700 text-sm">
            {errorMessage || "You need a premium subscription to access study resources. Contact an administrator to upgrade your account."}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && !isPremiumRequired && (
        <Alert className="mb-4 sm:mb-6" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-4">
        <input
          placeholder="Search resources"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded w-full text-sm sm:text-base"
          disabled={isPremiumRequired}
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-auto text-sm sm:text-base"
          disabled={isPremiumRequired}
        >
          <option value="all">All</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      {isLoading ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : isPremiumRequired ? (
        <Card className="p-6 sm:p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 sm:p-4 rounded-full">
              <Star className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Upgrade to Premium</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Access all study resources, shareable exams, and more with a premium subscription.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Contact your administrator to upgrade your account.
          </p>
        </Card>
      ) : resources.length === 0 ? (
        <Card className="p-6 sm:p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-muted p-3 sm:p-4 rounded-full">
              <Star className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">No Resources Available</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            There are currently no resources to display.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Check back later or contact an administrator.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{resource.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center flex-wrap gap-2">
                <Badge variant={resource.isFree ? "default" : "secondary"}>
                  {resource.isFree ? "Free" : "Paid"}
                </Badge>
                <a href={`/api/resources/${resource.id}/download`} download>
                  <Button size="sm">Download</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
