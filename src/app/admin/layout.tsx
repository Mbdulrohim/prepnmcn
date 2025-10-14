"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Building,
  Shield,
  MapPin,
  Search,
  Bot,
  User,
  LogOut,
  Settings,
  CreditCard,
  MessageSquare,
  Mail,
  Bell,
  Trophy,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);

  // Check if user has admin access
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const userRole = (session.user as any)?.role;
    if (!userRole || !["admin", "super_admin"].includes(userRole)) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (session) {
      fetchUnreadFeedbackCount();
    }
  }, [session]);

  const fetchUnreadFeedbackCount = async () => {
    try {
      const response = await fetch("/api/admin/feedback/stats");
      if (response.ok) {
        const data = await response.json();
        setUnreadFeedbackCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread feedback count:", error);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/admin">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Shield className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="font-semibold group-data-[collapsible=icon]:hidden">
                      O/Prep Admin
                    </span>
                    <span className="text-xs group-data-[collapsible=icon]:hidden">
                      Management Console
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin")}
                    tooltip="Dashboard"
                  >
                    <Link href="/admin">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/seo")}
                    tooltip="SEO"
                  >
                    <Link href="/admin/seo">
                      <Search />
                      <span>SEO</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/ai-engine")}
                    tooltip="AI Engine"
                  >
                    <Link href="/admin/ai-engine">
                      <Bot />
                      <span>AI Engine</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/users")}
                    tooltip="Users"
                  >
                    <Link href="/admin/users">
                      <Users />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/institutions")}
                    tooltip="Institutions"
                  >
                    <Link href="/admin/institutions">
                      <Building />
                      <span>Institutions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/resources")}
                    tooltip="Resources"
                  >
                    <Link href="/admin/resources">
                      <FileText />
                      <span>Resources</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/leaderboard")}
                    tooltip="Leaderboard"
                  >
                    <Link href="/admin/leaderboard">
                      <Trophy />
                      <span>Leaderboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {(session?.user as any)?.role === "super_admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/admin/admins")}
                      tooltip="Admins"
                    >
                      <Link href="/admin/admins">
                        <Shield />
                        <span>Admins</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {(session?.user as any)?.role === "super_admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/admin/payments")}
                      tooltip="Payments"
                    >
                      <Link href="/admin/payments">
                        <CreditCard />
                        <span>Payments</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/feedback")}
                    tooltip="Feedback"
                  >
                    <Link href="/admin/feedback" className="relative">
                      <MessageSquare />
                      <span>Feedback</span>
                      {unreadFeedbackCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadFeedbackCount > 99
                            ? "99+"
                            : unreadFeedbackCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/forums")}
                    tooltip="Forums"
                  >
                    <Link href="/admin/forums">
                      <MessageSquare />
                      <span>Forums</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/notifications")}
                    tooltip="Notifications"
                  >
                    <Link href="/admin/notifications">
                      <Bell />
                      <span>Notifications</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <User />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-semibold group-data-[collapsible=icon]:hidden">
                    {session?.user?.name || "Admin User"}
                  </span>
                  <span className="text-xs group-data-[collapsible=icon]:hidden">
                    {session?.user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/admin/settings">
                  <Settings />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Settings
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                >
                  <LogOut />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Sign Out
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
