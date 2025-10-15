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
  Trophy,
  Home,
  MessageSquare,
  Settings,
  ChevronDown,
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
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Forums", href: "/forums", icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href;

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Image src="/preplogo.png" alt="O/Prep" width={32} height={32} />
              <span className="hidden sm:block">O/Prep</span>
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Image src="/preplogo.png" alt="O/Prep" width={32} height={32} />
            <span className="hidden sm:block">O/Prep</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="hidden lg:block">{item.name}</span>
                    </Link>
                  );
                })}

                {/* Feedback Button */}
                <div className="ml-2">
                  <FeedbackButton />
                </div>

                {/* User Menu */}
                <div className="ml-4 pl-4 border-l border-gray-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-10 px-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user?.name || ""} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                            {(user?.name || user?.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:flex flex-col items-start">
                          <span className="text-sm font-medium text-gray-900">
                            {user?.name || "User"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(user as any)?.role || "Student"}
                          </span>
                        </div>
                        <ChevronDown size={16} className="text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
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
                        className="flex items-center gap-2 text-red-600 focus:text-red-600"
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
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user?.name || ""} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {(user?.name || user?.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={20} />
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* Mobile Feedback Button */}
                  <div className="px-3 py-2">
                    <FeedbackButton />
                  </div>

                  {/* Mobile Menu Items */}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={20} />
                      Profile Settings
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
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
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 w-full text-left"
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
