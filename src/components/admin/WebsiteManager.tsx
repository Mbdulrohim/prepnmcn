"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Heart,
  FileText,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface CommunityVoice {
  id: string;
  name: string;
  role: string;
  institution: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface CampusStory {
  id: string;
  title: string;
  institution: string;
  content: string;
  imageUrl?: string;
  author: string;
  isActive: boolean;
  createdAt: string;
}

interface LearnerTestimonial {
  id: string;
  name: string;
  program: string;
  institution: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export default function WebsiteManager() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for different content types
  const [communityVoices, setCommunityVoices] = useState<CommunityVoice[]>([]);
  const [campusStories, setCampusStories] = useState<CampusStory[]>([]);
  const [learnerTestimonials, setLearnerTestimonials] = useState<
    LearnerTestimonial[]
  >([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("voices");

  // Dialog states
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);

  // Form states
  const [editingVoice, setEditingVoice] = useState<CommunityVoice | null>(null);
  const [editingStory, setEditingStory] = useState<CampusStory | null>(null);
  const [editingTestimonial, setEditingTestimonial] =
    useState<LearnerTestimonial | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const [voiceForm, setVoiceForm] = useState({
    name: "",
    role: "",
    institution: "",
    content: "",
    imageUrl: "",
    isActive: true,
  });

  const [storyForm, setStoryForm] = useState({
    title: "",
    institution: "",
    content: "",
    imageUrl: "",
    author: "",
    isActive: true,
  });

  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    program: "",
    institution: "",
    content: "",
    imageUrl: "",
    isActive: true,
  });

  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "",
    category: "",
    tags: "",
    imageUrl: "",
    isPublished: false,
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
      fetchAllContent();
    }
  }, [session, status, router]);

  const fetchAllContent = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCommunityVoices(),
        fetchCampusStories(),
        fetchLearnerTestimonials(),
        fetchBlogPosts(),
      ]);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunityVoices = async () => {
    try {
      const response = await fetch("/api/admin/website/voices");
      if (response.ok) {
        const data = await response.json();
        setCommunityVoices(data);
      }
    } catch (error) {
      console.error("Error fetching community voices:", error);
    }
  };

  const fetchCampusStories = async () => {
    try {
      const response = await fetch("/api/admin/website/stories");
      if (response.ok) {
        const data = await response.json();
        setCampusStories(data);
      }
    } catch (error) {
      console.error("Error fetching campus stories:", error);
    }
  };

  const fetchLearnerTestimonials = async () => {
    try {
      const response = await fetch("/api/admin/website/testimonials");
      if (response.ok) {
        const data = await response.json();
        setLearnerTestimonials(data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch("/api/admin/website/blog");
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
  };

  // Voice handlers
  const handleVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingVoice ? "PUT" : "POST";
      const url = editingVoice
        ? `/api/admin/website/voices/${editingVoice.id}`
        : "/api/admin/website/voices";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voiceForm),
      });

      if (response.ok) {
        toast.success(
          editingVoice
            ? "Voice updated successfully"
            : "Voice added successfully"
        );
        setVoiceDialogOpen(false);
        resetVoiceForm();
        fetchCommunityVoices();
      } else {
        toast.error("Failed to save voice");
      }
    } catch (error) {
      console.error("Error saving voice:", error);
      toast.error("Failed to save voice");
    }
  };

  const handleDeleteVoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voice?")) return;

    try {
      const response = await fetch(`/api/admin/website/voices/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Voice deleted successfully");
        fetchCommunityVoices();
      } else {
        toast.error("Failed to delete voice");
      }
    } catch (error) {
      console.error("Error deleting voice:", error);
      toast.error("Failed to delete voice");
    }
  };

  const resetVoiceForm = () => {
    setVoiceForm({
      name: "",
      role: "",
      institution: "",
      content: "",
      imageUrl: "",
      isActive: true,
    });
    setEditingVoice(null);
  };

  // Similar handlers for stories, testimonials, and blog posts would go here
  // For brevity, I'll implement the basic structure and you can expand as needed

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Website Content Management</h1>
            <p className="text-muted-foreground">
              Manage community voices, campus stories, testimonials, and blog
              posts
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Content Management</h1>
          <p className="text-muted-foreground">
            Manage community voices, campus stories, testimonials, and blog
            posts
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="voices" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community Voices
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Campus Stories
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Why Learners Stay
          </TabsTrigger>
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog
          </TabsTrigger>
        </TabsList>

        {/* Community Voices Tab */}
        <TabsContent value="voices" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Voices from the Community</h2>
            <Dialog open={voiceDialogOpen} onOpenChange={setVoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetVoiceForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Voice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingVoice
                      ? "Edit Community Voice"
                      : "Add Community Voice"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleVoiceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="voice-name">Name</Label>
                      <Input
                        id="voice-name"
                        value={voiceForm.name}
                        onChange={(e) =>
                          setVoiceForm({ ...voiceForm, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="voice-role">Role</Label>
                      <Input
                        id="voice-role"
                        value={voiceForm.role}
                        onChange={(e) =>
                          setVoiceForm({ ...voiceForm, role: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="voice-institution">Institution</Label>
                    <Input
                      id="voice-institution"
                      value={voiceForm.institution}
                      onChange={(e) =>
                        setVoiceForm({
                          ...voiceForm,
                          institution: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="voice-content">Content</Label>
                    <Textarea
                      id="voice-content"
                      value={voiceForm.content}
                      onChange={(e) =>
                        setVoiceForm({ ...voiceForm, content: e.target.value })
                      }
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="voice-image">Image URL (optional)</Label>
                    <Input
                      id="voice-image"
                      value={voiceForm.imageUrl}
                      onChange={(e) =>
                        setVoiceForm({ ...voiceForm, imageUrl: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="voice-active"
                      checked={voiceForm.isActive}
                      onChange={(e) =>
                        setVoiceForm({
                          ...voiceForm,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="voice-active">Active</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVoiceDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingVoice ? "Update" : "Save"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityVoices.map((voice) => (
              <Card key={voice.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{voice.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {voice.role} • {voice.institution}
                      </p>
                    </div>
                    <Badge variant={voice.isActive ? "default" : "secondary"}>
                      {voice.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{voice.content}</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingVoice(voice);
                        setVoiceForm({
                          name: voice.name,
                          role: voice.role,
                          institution: voice.institution,
                          content: voice.content,
                          imageUrl: voice.imageUrl || "",
                          isActive: voice.isActive,
                        });
                        setVoiceDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteVoice(voice.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Campus Stories Tab */}
        <TabsContent value="stories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Stories from Campuses We Serve
            </h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Story
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Campus stories management coming soon...
          </div>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Why Learners Stay</h2>
            <p className="text-sm text-muted-foreground">
              A complete prep command centre in one login. Every module aligns
              with the realities of professional programs—tight schedules,
              multiple commitments.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Learner testimonials management coming soon...
          </div>
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Blog Posts</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Blog Post
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Blog management coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
