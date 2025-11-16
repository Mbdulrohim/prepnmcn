"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  BookOpen,
  Trophy,
  Home,
  MessageSquare,
  Settings,
  ChevronDown,
  MoreHorizontal,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import FeedbackButton from "@/components/FeedbackButton";
import FeedbackDialog from "@/components/FeedbackDialog";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === "loading";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Study Planner", href: "/study-planner", icon: Calendar },
    { name: "CGPA Calculator", href: "/cgpa-calculator", icon: Calculator },
    { name: "Academic Profile", href: "/profile/academic", icon: User },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Forums", href: "/forums", icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href;

  if (loading) {
    return (
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-3 text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              <Image src="/preplogo.png" alt="O/Prep" width={32} height={32} />
              <span className="hidden sm:block">O/Prep</span>
            </Link>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <Image src="/preplogo.png" alt="O/Prep" width={32} height={32} />
            <span className="hidden sm:block">O/Prep</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Home size={18} />
                  <span className="hidden lg:block">Dashboard</span>
                </Link>

                {/* Feedback Button */}
                <FeedbackButton>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${"text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                  >
                    <MessageSquare size={18} />
                    <span className="hidden lg:block">Feedback</span>
                  </div>
                </FeedbackButton>

                {/* Academic Profile Link */}
                <Link
                  href="/profile/academic"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/profile/academic")
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <User size={18} />
                  <span className="hidden lg:block">Academic Profile</span>
                </Link>

                {/* Exams Link */}
                <Link
                  href="/exams"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/exams")
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <BookOpen size={18} />
                  <span className="hidden lg:block">Exams</span>
                </Link>

                {/* More Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-3 py-2 h-10 text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <MoreHorizontal size={18} />
                      <span className="hidden lg:block">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {/* Study Planner */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/study-planner"
                        className="flex items-center gap-2"
                      >
                        <Calendar size={16} />
                        Study Planner
                      </Link>
                    </DropdownMenuItem>

                    {/* Leaderboard */}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/leaderboard"
                        className="flex items-center gap-2"
                      >
                        <Trophy size={16} />
                        Leaderboard
                      </Link>
                    </DropdownMenuItem>

                    {/* Forums */}
                    <DropdownMenuItem asChild>
                      <Link href="/forums" className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        Forums
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <div className="ml-2">
                  <ThemeToggle />
                </div>

                {/* User Menu */}
                <div className="ml-4 pl-4 border-l border-border">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-10 px-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user?.name || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {(user?.name || user?.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:flex flex-col items-start">
                          <span className="text-sm font-medium text-foreground">
                            {user?.name || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(user as any)?.role || "Student"}
                          </span>
                        </div>
                        <ChevronDown
                          size={16}
                          className="text-muted-foreground"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium text-foreground">
                          {user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2"
                        >
                          <User size={16} />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2"
                        >
                          <Settings size={16} />
                          Preferences
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signin">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user?.name || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user?.name || user?.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  {/* Dashboard */}
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/dashboard")
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home size={20} />
                    Dashboard
                  </Link>

                  {/* Feedback Button */}
                  <FeedbackButton>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer">
                      <MessageSquare size={20} />
                      Feedback
                    </div>
                  </FeedbackButton>

                  {/* Academic Profile */}
                  <Link
                    href="/profile/academic"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/profile/academic")
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    Academic Profile
                  </Link>

                  {/* Study Planner */}
                  <Link
                    href="/study-planner"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/study-planner")
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar size={20} />
                    Study Planner
                  </Link>

                  {/* Exams */}
                  <Link
                    href="/exams"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/exams")
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BookOpen size={20} />
                    Exams
                  </Link>

                  {/* CGPA Calculator */}
                  <Link
                    href="/cgpa-calculator"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/cgpa-calculator")
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calculator size={20} />
                    CGPA Calculator
                  </Link>

                  {/* Leaderboard */}
                  <Link
                    href="/leaderboard"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/leaderboard")
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy size={20} />
                    Leaderboard
                  </Link>

                  {/* Forums */}
                  <Link
                    href="/forums"
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/forums")
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageSquare size={20} />
                    Forums
                  </Link>

                  {/* Mobile Feedback Button */}
                  <div className="px-3 py-2">
                    <FeedbackButton>
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-lg transition-all duration-200">
                        <MessageSquare size={20} />
                        Feedback
                      </div>
                    </FeedbackButton>
                  </div>

                  {/* Mobile Theme Toggle */}
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>Theme:</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="border-t border-border pt-2 mt-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={20} />
                      Profile Settings
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings size={20} />
                      Preferences
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full text-left"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
