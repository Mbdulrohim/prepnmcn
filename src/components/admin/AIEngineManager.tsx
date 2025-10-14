"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface AIMetrics {
  totalPrompts: number;
  averageResponseTime: number;
  successRate: number;
  activeModels: number;
}

interface AIPrompt {
  id: string;
  name: string;
  content: string;
  model: string;
  category: string;
  performance: number;
  createdAt: string;
  lastUsed: string;
}

export default function AIEngineManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState("");
  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: "",
    content: "",
    category: "",
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
      fetchMetrics();
      fetchPrompts();
    }
  }, [session, status, router]);

  const fetchMetrics = async () => {
    try {
      // TODO: Implement API call to fetch real AI metrics
      setMetrics(null);
    } catch (error) {
      console.error("Error fetching AI metrics:", error);
    }
  };

  const fetchPrompts = async (newLimit?: number) => {
    try {
      const currentLimit = newLimit || limit;
      const res = await fetch(`/api/admin/ai-engine?limit=${currentLimit}`);
      const data = await res.json();

      if (res.ok) {
        setPrompts(data.prompts || []);
        setTotalCount(data.totalCount || 0);
        setHasMore(data.hasMore || false);
        if (newLimit) {
          setLimit(newLimit);
        }
      } else {
        console.error("Failed to fetch AI prompts");
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const increaseLimit = () => {
    const newLimit = Math.min(limit + 20, 100); // Max 100, increase by 20
    fetchPrompts(newLimit);
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.name || !newPrompt.content || !newPrompt.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // TODO: Implement API call to create prompt
      toast.info("Prompt creation would be implemented here");
    } catch (error) {
      toast.error("Failed to create prompt");
    }
  };

  const handleTestPrompt = (promptId: string) => {
    toast.info("Prompt testing functionality would be implemented here");
  };

  const handleOptimizePrompt = (promptId: string) => {
    toast.info("Prompt optimization would be implemented here");
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">
          AI Engine Optimization
        </h1>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            {metrics?.activeModels || 0} Active Models
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {metrics?.successRate || 0}% Success Rate
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {metrics?.totalPrompts || 0} Total Prompts
          </Badge>
        </div>
      </div>

      {/* AI Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Total Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalPrompts.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">AI interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.averageResponseTime}s
              </div>
              <p className="text-xs text-muted-foreground">Response speed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Successful responses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Active Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeModels}</div>
              <p className="text-xs text-muted-foreground">AI models in use</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prompt Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Create AI Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePrompt} className="space-y-4">
              <div>
                <Label htmlFor="prompt-name">Prompt Name</Label>
                <Input
                  id="prompt-name"
                  value={newPrompt.name}
                  onChange={(e) =>
                    setNewPrompt({ ...newPrompt, name: e.target.value })
                  }
                  placeholder="e.g., Study Plan Generator"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prompt-category">Category</Label>
                <Select
                  value={newPrompt.category}
                  onValueChange={(value) =>
                    setNewPrompt({ ...newPrompt, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Feedback">Feedback</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ai-model">AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPT-4">GPT-4</SelectItem>
                    <SelectItem value="GPT-3.5">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="Claude-3">Claude-3</SelectItem>
                    <SelectItem value="Gemini">Gemini Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prompt-content">Prompt Content</Label>
                <Textarea
                  id="prompt-content"
                  value={newPrompt.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewPrompt({ ...newPrompt, content: e.target.value })
                  }
                  placeholder="Enter your AI prompt template..."
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Prompt
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                toast.info("Model fine-tuning would be implemented here")
              }
            >
              <Brain className="mr-2 h-4 w-4" />
              Fine-tune Models
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                toast.info("Performance analytics would be implemented here")
              }
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                toast.info("A/B testing would be implemented here")
              }
            >
              <Target className="mr-2 h-4 w-4" />
              Run A/B Tests
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                toast.info("Backup system would be implemented here")
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Backup Prompts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Prompts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              AI Prompts Library ({prompts.length} of {totalCount})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {limit} items</span>
              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseLimit}
                  className="text-xs"
                >
                  Load More (+20)
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{prompt.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{prompt.model}</Badge>
                      <Badge variant="secondary">{prompt.category}</Badge>
                      <Badge
                        variant={
                          prompt.performance > 90
                            ? "default"
                            : prompt.performance > 80
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {prompt.performance}% Performance
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestPrompt(prompt.id)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOptimizePrompt(prompt.id)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Optimize
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {prompt.content}
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created: {prompt.createdAt}</span>
                  <span>Last used: {prompt.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
